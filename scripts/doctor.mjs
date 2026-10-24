#!/usr/bin/env node
/**
 * Check that the whole stack is wired up and healthy.
 *
 * Usage:
 *   npm run db:doctor
 *
 * It answers, in one go, the questions that are otherwise spread over a
 * dozen manual steps:
 *
 *   - are all the environment variables present and usable?
 *   - can the app actually reach the database?
 *   - does the database schema match prisma/schema.prisma?
 *   - is there an account that can open the admin panel?
 *   - can the SMS provider be reached, and does it still have credit?
 *
 * Every check is independent: one failure does not stop the rest, so a
 * single run tells you everything that is broken.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

/** Minimal `.env` parser: KEY=VALUE lines, optional quotes, `#` comments. */
function parseEnvFile(path) {
  const values = {};
  for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

const env = { ...process.env };
for (const file of ['.env.local', '.env']) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  for (const [key, value] of Object.entries(parseEnvFile(path))) {
    if (env[key] === undefined) env[key] = value;
  }
}
process.env.DATABASE_URL = env.DATABASE_URL;

const results = [];
function record(ok, label, detail) {
  results.push({ ok, label, detail });
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${label}${detail ? `  -  ${detail}` : ''}`);
}

console.log('\n=== 1. Environment ===');

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
  record(false, 'DATABASE_URL is set', 'no value found in .env or .env.local');
} else {
  const masked = databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, (_m, u, p) => `://${u}:${'*'.repeat(p.length)}@`);
  const schemeOk = databaseUrl.startsWith('mysql://');
  record(schemeOk, 'DATABASE_URL is set', masked);
  if (!schemeOk) {
    record(false, 'DATABASE_URL uses the mysql:// scheme', 'the Prisma datasource is provider = "mysql"');
  } else {
    record(true, 'DATABASE_URL uses the mysql:// scheme');
  }
  if (!/connection_limit=/.test(databaseUrl)) {
    record(false, 'DATABASE_URL caps the connection pool', 'add ?connection_limit=10 - Aiven\'s free tier allows only 20 connections');
  } else {
    record(true, 'DATABASE_URL caps the connection pool');
  }
}

record(
  Boolean(env.JWT_SECRET && env.JWT_SECRET.length >= 32),
  'JWT_SECRET is set',
  env.JWT_SECRET ? `${env.JWT_SECRET.length} characters` : 'missing - the session cookie cannot be signed',
);

const adminPhone = env.ADMIN_PHONE || env.ADMIN_PHONES;
record(Boolean(adminPhone), 'ADMIN_PHONE is set', adminPhone || 'missing - the seed will not create an admin');

record(
  Boolean(env.SMSIR_API_KEY),
  'SMSIR_API_KEY is set',
  env.SMSIR_API_KEY ? `${env.SMSIR_API_KEY.length} characters` : 'missing - the OTP SMS will not be sent',
);
record(
  Boolean(env.SMSIR_TEMPLATE_ID && Number(env.SMSIR_TEMPLATE_ID) > 0),
  'SMSIR_TEMPLATE_ID is set',
  env.SMSIR_TEMPLATE_ID || 'missing - the OTP SMS will not be sent',
);

console.log('\n=== 2. Database ===');

let prisma = null;
let dbReachable = false;
try {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient();
  const started = Date.now();
  await prisma.$queryRawUnsafe('SELECT 1 AS ok');
  dbReachable = true;
  record(true, 'the database is reachable', `${Date.now() - started}ms`);
} catch (error) {
  // The Prisma message starts with blank lines, so the first line is often
  // empty. Take the first line that actually says something.
  const lines = String(error instanceof Error ? error.message : error)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const detail = lines.find((line) => !line.startsWith('Invalid `prisma')) ?? lines[0] ?? 'unknown error';
  const code = String(error instanceof Error ? error.message : '').match(/code:\s*'([A-Z]\d+)'/)?.[1];

  record(false, 'the database is reachable', code ? `${code} - ${detail}` : detail);

  if (detail.includes('Can\'t reach database server')) {
    console.log(
      '\n        The database server itself is not answering. This is not a\n' +
      '        problem with the connection string - the host resolves and the\n' +
      '        TCP port does not accept a connection at all.\n' +
      '\n' +
      '        If the host is an Aiven free-tier service, it is powered off\n' +
      '        automatically after a period of inactivity: log in to the Aiven\n' +
      '        console and press "Power on" for the service, then run this\n' +
      '        command again.',
    );
  }
}

if (prisma && !dbReachable) {
  // The queries below would all fail for the same reason, so they would
  // report a missing table and send the reader chasing a schema problem
  // that does not exist. Say plainly that they were skipped.
  record(false, 'the schema matches prisma/schema.prisma', 'skipped - the database is unreachable');
  record(false, 'an account can open the admin panel', 'skipped - the database is unreachable');
  await prisma.$disconnect();
} else if (prisma) {
  const models = [
    ['user', 'users'],
    ['otpCode', 'OTP codes'],
    ['food', 'foods'],
    ['gym', 'gyms'],
    ['exercise', 'exercises'],
    ['videoContent', 'videos'],
    ['article', 'articles'],
    ['appSetting', 'settings'],
    ['plan', 'plans'],
    ['subscription', 'subscriptions'],
    ['payment', 'payments'],
    ['auditLog', 'audit log entries'],
  ];

  const counts = [];
  let schemaMismatch = null;
  for (const [model, label] of models) {
    try {
      const n = await prisma[model].count();
      // findFirst queries all model columns, catching missing columns (e.g. tokenVersion)
      await prisma[model].findFirst();
      counts.push(`${label}: ${n}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const firstUsefulLine = msg.split('\n').map(l => l.trim()).filter(l => Boolean(l) && !l.startsWith('Invalid `prisma'))[0] || 'schema out of sync';
      schemaMismatch = `${label} (${firstUsefulLine})`;
      break;
    }
  }

  if (schemaMismatch) {
    record(false, 'the schema matches prisma/schema.prisma', `schema mismatch in "${schemaMismatch}" - run: npm run db:push`);
  } else {
    record(true, 'the schema matches prisma/schema.prisma', counts.join(', '));
  }

  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { phoneNumber: true, isActive: true },
    });
    const active = admins.filter((a) => a.isActive !== false);
    record(
      active.length > 0,
      'an account can open the admin panel',
      active.length ? `admin: ${active.map((a) => a.phoneNumber).join(', ')}` : 'no user has the ADMIN role',
    );
  } catch (error) {
    record(false, 'an account can open the admin panel', 'the user table could not be read');
  }

  await prisma.$disconnect();
}

console.log('\n=== 3. SMS provider (sms.ir) ===');
if (!env.SMSIR_API_KEY) {
  record(false, 'the SMS provider is reachable', 'no API key to test with');
} else {
  try {
    const res = await fetch('https://api.sms.ir/v1/credit', {
      headers: { 'x-api-key': env.SMSIR_API_KEY, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data && data.status === 1) {
      record(true, 'the SMS provider is reachable', `credit: ${data.data}`);
      if (Number(data.data) <= 0) {
        console.log('        The balance is empty - the OTP SMS will not be delivered until it is topped up.');
      }
    } else {
      record(false, 'the SMS provider is reachable', `HTTP ${res.status}, status=${data?.status ?? 'none'}`);
    }
  } catch (error) {
    // A network failure and a rejected key need different fixes, so they are
    // reported differently.
    const cause = error instanceof Error ? error.cause : undefined;
    const reason = cause?.code ?? (error instanceof Error ? error.message : String(error));

    if (cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || reason.includes('timed out')) {
      record(false, 'the SMS provider is reachable', `the request to api.sms.ir timed out (${reason})`);
      console.log(
        '\n        The provider could not be reached. Either sms.ir is having a\n' +
        '        problem, or this machine cannot get to it. The OTP SMS will\n' +
        '        not be delivered until it answers again.',
      );
    } else {
      record(false, 'the SMS provider is reachable', reason);
    }
  }
}

console.log('\n=== 4. Prisma client ===');
try {
  const generated = join(root, 'node_modules', '.prisma', 'client', 'schema.prisma');
  if (!existsSync(generated)) {
    record(false, 'the Prisma client is generated', 'run: npm run db:generate');
  } else {
    const clientSchema = readFileSync(generated, 'utf8');
    const repoSchema = readFileSync(join(root, 'prisma', 'schema.prisma'), 'utf8');
    const modelsOf = (text) =>
      [...text.matchAll(/^model\s+(\w+)/gm)].map((m) => m[1]).sort().join(',');
    const same = modelsOf(clientSchema) === modelsOf(repoSchema);
    record(
      same,
      'the Prisma client matches prisma/schema.prisma',
      same ? 'up to date' : 'the generated client is stale - run: npm run db:generate',
    );
  }
} catch (error) {
  record(false, 'the Prisma client matches prisma/schema.prisma', String(error));
}

const failed = results.filter((r) => !r.ok);
console.log(`\n=== Summary: ${results.length - failed.length}/${results.length} checks passed ===`);
if (failed.length) {
  console.log('\nFailed checks:');
  for (const f of failed) console.log(`  - ${f.label}${f.detail ? `: ${f.detail}` : ''}`);
  process.exit(1);
}
console.log('Everything is wired up.\n');
