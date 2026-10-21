#!/usr/bin/env node
/**
 * Run the Prisma CLI with the right environment.
 *
 * Why this exists:
 *
 * - The Prisma CLI reads `.env` only. Next.js reads `.env.local` first and
 *   then `.env`. When a developer keeps the real connection string in
 *   `.env.local` (which is git-ignored, so that is the sane place for it),
 *   `npx prisma db push` picks up the *stale* `.env` instead and fails with
 *   "the URL must start with the protocol mysql://" - or worse, pushes the
 *   schema to the wrong database.
 * - On the host there is usually no `.env.local` at all, only the `.env` the
 *   deployment guide tells you to create.
 *
 * So: load `.env.local` when it exists, fall back to `.env`, and let an
 * already-exported DATABASE_URL win over both.
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

// `.env.local` first, then `.env` - but never overwrite a variable that is
// already set in the real environment.
for (const file of ['.env.local', '.env']) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  for (const [key, value] of Object.entries(parseEnvFile(path))) {
    if (env[key] === undefined) env[key] = value;
  }
}

const prismaBin = join(root, 'node_modules', '.bin', 'prisma');
const child = spawn(prismaBin, process.argv.slice(2), {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  // On Windows the Prisma query engine is a .dll that a running app holds
  // open, so it cannot be replaced. The raw error says nothing about that.
  if (code !== 0 && process.platform === 'win32') {
    console.error(
      '\n  If the error above mentions "EPERM" or "query_engine", the app is\n' +
        '  still running and is holding the Prisma engine open. Stop it\n' +
        '  (Ctrl+C in the terminal it runs in) and run this again.\n',
    );
  }

  process.exit(code ?? 0);
});
