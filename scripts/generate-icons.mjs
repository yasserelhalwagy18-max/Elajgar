#!/usr/bin/env node
/**
 * Generate the PWA icons from `public/icon.svg`.
 *
 *   npm run icons:generate
 *
 * A web app manifest needs a real PNG icon for the install prompt - Chrome
 * wants a 192px and a 512px one, and Safari wants an "apple-touch-icon".
 * The SVG in the repository is the source; this turns it into the PNGs the
 * manifest points at.
 *
 * The maskable icon is drawn separately: a maskable icon is cropped to a
 * circle or a squircle, so the logo has to sit inside the safe zone (the
 * middle 80%) with the background filling the whole square.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, 'public');

const BRAND = '#2563EB';

/** The logo path, taken from `icon.svg`. */
const LOGO_PATH =
  'M220 180c-15 0-30 12-30 27l-6 15c-3 8-9 12-17 12s-14-4-17-12l-6-15c0-15-15-27-30-27-24 0-36 24-36 54 0 6 3 12 6 16l36 36c3 3 8 3 11 0l36-36c3-4 6-10 6-16 0-30-12-54-36-54';

const source = readFileSync(join(publicDir, 'icon.svg'), 'utf8');
const logo = source.match(/<path[^>]*\/>/)?.[0];
if (!logo) {
  console.error('Could not find the logo path in public/icon.svg');
  process.exit(1);
}

/** The plain icon: the SVG as it is. */
async function writeFromSvg(size, name) {
  const buffer = await sharp(Buffer.from(source)).resize(size, size).png().toBuffer();
  writeFileSync(join(publicDir, name), buffer);
  console.log(`  ${name}  ${size}x${size}  ${(buffer.length / 1024).toFixed(1)} KB`);
}

/**
 * The maskable icon: the logo at 60% of the canvas, on the brand colour.
 *
 * A maskable icon is cropped to whatever shape the platform uses, so
 * everything that matters has to be inside the middle 80%.
 */
async function writeMaskable(size, name) {
  const inner = Math.round(size * 0.6);
  const offset = Math.round((size - inner) / 2);

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${BRAND}"/>
    <g transform="translate(${offset} ${offset}) scale(${inner / 512})">
      ${logo}
    </g>
  </svg>`;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(join(publicDir, name), buffer);
  console.log(`  ${name}  ${size}x${size}  ${(buffer.length / 1024).toFixed(1)} KB`);
}

console.log('Generating the PWA icons:');
await writeFromSvg(192, 'icon-192.png');
await writeFromSvg(512, 'icon-512.png');
await writeMaskable(512, 'icon-maskable-512.png');
// Safari uses this one for the home screen.
await writeFromSvg(180, 'apple-touch-icon.png');
console.log('Done.');
