#!/usr/bin/env node
/**
 * Promote a user to admin (or take the role away).
 *
 * Usage:
 *   node scripts/promote-admin.mjs 09123456789
 *   node scripts/promote-admin.mjs 09123456789 --revoke
 *
 * The user must already exist - sign in through the app once so the account
 * is created, then run this. Alternatively set `ADMIN_PHONE` and run
 * `npm run db:seed`, which creates the account and grants the role.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

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

const args = process.argv.slice(2);
const revoke = args.includes('--revoke');
const phoneNumber = args.find((arg) => !arg.startsWith('--'));

if (!phoneNumber) {
  console.error('Usage: node scripts/promote-admin.mjs <phoneNumber> [--revoke]');
  process.exit(1);
}

const { PrismaClient, Role } = await import('@prisma/client');
const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({ where: { phoneNumber } });

  if (!user) {
    console.error(
      `✖ No user with the phone number ${phoneNumber}.\n` +
        '  The account is created on the first sign-in - sign in through the app first, then run this again.',
    );
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: revoke ? Role.USER : Role.ADMIN },
    select: { id: true, phoneNumber: true, fullName: true, role: true },
  });

  console.log(
    revoke
      ? `✔ Role revoked. ${updated.phoneNumber} is now a regular user.`
      : `✔ Promoted. ${updated.phoneNumber} can now open /admin.`,
  );
} catch (error) {
  console.error('✖ Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
