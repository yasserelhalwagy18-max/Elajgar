#!/usr/bin/env node
/**
 * Build the project and pack it into a zip for Liara.
 *
 *   npm run deploy:zip
 *
 * The zip is what gets uploaded in the Liara console. The CLI
 * (`liara deploy`) can upload the folder directly and reads `.liaraignore`,
 * so this script is the fallback for when the console is easier.
 *
 * What is left out:
 *
 * - `node_modules` and `.next` - Liara installs and builds on its own
 *   server, and the Prisma client has to be built *there* anyway
 * - the environment files - the variables are set in the Liara console, so
 *   the secrets never leave this machine
 * - the logs and the build cache
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'deploy');
const outFile = join(outDir, 'elajgar.zip');

/** What must not go into the zip. */
const EXCLUDES = [
  'node_modules',
  '.next',
  '.git',
  '.env',
  '.env.local',
  '.env.production',
  'coverage',
  'deploy',
  '*.log',
  'tsconfig.tsbuildinfo',
  'scripts/_*.mjs',
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  if (result.status !== 0) {
    console.error(`\n✖ ${command} ${args.join(' ')} failed.`);
    process.exit(result.status ?? 1);
  }
}

console.log('1/3  Building the app...');
run('npm', ['run', 'build']);

// The Prisma client is built by the build step, but the one in
// node_modules is for Windows. It has to go, or Liara will upload a
// Windows engine that cannot load on their server.
console.log('\n2/3  Removing the locally built Prisma engine...');
const engineDir = join(root, 'node_modules', '.prisma', 'client');
if (existsSync(engineDir)) {
  rmSync(engineDir, { recursive: true, force: true });
  console.log('   removed node_modules/.prisma/client');
}

console.log('\n3/3  Packing the zip...');
mkdirSync(outDir, { recursive: true });
if (existsSync(outFile)) rmSync(outFile, { force: true });

// `tar -a` makes a zip out of a tarball on Windows (bsdtar) and on macOS.
// On Linux, `tar` is GNU tar and needs --format, so `zip` is used there if
// it is installed.
const tarArgs = [
  '-a',
  '-c',
  '-f',
  outFile,
  ...EXCLUDES.map((pattern) => `--exclude=${pattern}`),
  '.',
];

const isWindows = process.platform === 'win32';
if (isWindows) {
  run('tar', tarArgs);
} else {
  const hasZip = spawnSync('which', ['zip'], { stdio: 'ignore' }).status === 0;
  if (hasZip) {
    run('zip', ['-r', '-q', outFile, '.', ...EXCLUDES.map((p) => `-x ${p}`)]);
  } else {
    // No zip on the machine: fall back to the tar, and say so.
    run('tar', ['-c', '-f', outFile.replace(/\.zip$/, '.tar.gz'), ...tarArgs.slice(0, 2), ...EXCLUDES.map((p) => `--exclude=${p}`), '.']);
    console.log('\n  (zip is not installed on this machine, so a .tar.gz was made instead)');
  }
}

const size = existsSync(outFile)
  ? (readFileSync(outFile).length / 1024 / 1024).toFixed(1)
  : '?';

console.log('\n─────────────────────────────────────────────');
console.log(`  The zip is ready:  deploy/elajgar.zip  (${size} MB)`);
console.log('\n  Next:');
console.log('   1. Open https://console.liara.ir');
console.log('   2. Open your app, then "استقرار جدید" (New deployment)');
console.log('   3. Drag the zip in');
console.log('   4. Set the environment variables (see DEPLOY.md)');
console.log('   5. Click "استقرار" (Deploy)');
console.log('─────────────────────────────────────────────');
