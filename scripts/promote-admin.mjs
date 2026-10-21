#!/usr/bin/env node
/**
 * Manage the accounts that can open the admin panel.
 *
 * Usage:
 *   node scripts/promote-admin.mjs 09123456789            give the role
 *   node scripts/promote-admin.mjs 09123456789 --revoke   take the role away
 *   node scripts/promote-admin.mjs 09123456789 --set-password 13474393
 *                                                          set the password,
 *                                                          so the account can
 *                                                          sign in without an
 *                                                          SMS code
 *   node scripts/promote-admin.mjs 09123456789 --clear-password
 *                                                          remove the password,
 *                                                          so the account can
 *                                                          only sign in with an
 *                                                          SMS code
 *   node scripts/promote-admin.mjs 09123456789 --delete    delete the account
 *
 * The account does not have to exist yet - it is created if it does not.
 * Alternatively set `ADMIN_PHONE` and run `npm run db:seed`, which creates
 * the account and grants the role.
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
const clearPassword = args.includes('--clear-password');
const remove = args.includes('--delete');
const wantsPassword = args.includes('--set-password');

/**
 * The phone number is the first plain argument and the password is the
 * second one.
 *
 * The order is fixed rather than "the password is the word after the flag",
 * because npm puts the script's own flags first:
 * `npm run admin:set-password 09121512173 13474393` arrives as
 * `--set-password 09121512173 13474393`, and there the word after the flag
 * is the phone number.
 */
const positionals = args.filter((arg) => !arg.startsWith('--'));
const phoneNumber = positionals[0];
const newPassword = positionals[1];

if (!phoneNumber) {
  console.error(
    'Usage: node scripts/promote-admin.mjs <phoneNumber> [--revoke] [--set-password <password>] [--clear-password] [--delete]',
  );
  process.exit(1);
}

if (wantsPassword && !newPassword) {
  console.error('✖ --set-password needs the password after the phone number.');
  process.exit(1);
}

const { PrismaClient, Role } = await import('@prisma/client');

// The connection string has to be handed to Prisma directly. Prisma reads
// `.env` on its own, and `.env` is not where the real one lives - the
// `.env.local` file is, and it is the one that has to win. Without this the
// script talks to whatever `.env` happens to say, which is usually a
// leftover from a different setup.
const prisma = new PrismaClient(
  env.DATABASE_URL ? { datasources: { db: { url: env.DATABASE_URL } } } : undefined,
);

try {
  // The account does not have to exist yet: setting a password on a fresh
  // number is how a test account is made.
  const user = await prisma.user.upsert({
    where: { phoneNumber },
    update: {},
    create: { phoneNumber },
  });

  if (remove) {
    // The account and everything that belongs to it - the health record, the
    // daily logs, the questionnaire - go with it.
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`✔ Deleted the account ${user.phoneNumber} and everything in it.`);
  } else if (wantsPassword) {
    const { hashPassword } = await import('../lib/scrypt.mjs');
    const hash = await hashPassword(newPassword);

    await prisma.hashedPassword.upsert({
      where: { userId: user.id },
      update: { hash },
      create: { userId: user.id, hash },
    });

    console.log(
      `✔ The password of ${user.phoneNumber} was set. ` +
        'The account can sign in with it now.',
    );
  } else if (clearPassword) {
    await prisma.hashedPassword.deleteMany({ where: { userId: user.id } });
    console.log(
      `✔ The password of ${user.phoneNumber} was removed. ` +
        'The account can only sign in with an SMS code now.',
    );
  } else {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: revoke ? Role.USER : Role.ADMIN },
      select: { id: true, phoneNumber: true, fullName: true, role: true },
    });

    console.log(
      revoke
        ? `✔ Role revoked. ${updated.phoneNumber} is now a regular user.`
        : `✔ Promoted. ${updated.phoneNumber} can now open the admin panel.`,
    );
  }
} catch (error) {
  console.error('✖ Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
