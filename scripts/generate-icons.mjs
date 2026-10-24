#!/usr/bin/env node
/**
 * Generate the PWA icons, splash screens, and OG image from `public/icon.svg`.
 *
 *   npm run icons:generate
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, 'public');

const BRAND = '#2563eb';
const SURFACE = '#f8fafc';

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

/** The maskable icon: the logo at 60% of the canvas, on the brand colour. */
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

/** An iOS startup splash screen with brand icon and app name centered on surface. */
async function writeSplash(width, height, name) {
  const iconSize = Math.min(Math.round(Math.min(width, height) * 0.28), 240);
  const iconX = Math.round((width - iconSize) / 2);
  const iconY = Math.round((height - iconSize) / 2) - 40;
  const textY = iconY + iconSize + 60;
  const fontSize = Math.max(Math.round(iconSize * 0.24), 28);

  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${SURFACE}"/>
    <g transform="translate(${iconX} ${iconY})">
      <rect width="${iconSize}" height="${iconSize}" rx="${Math.round(iconSize * 0.22)}" fill="${BRAND}"/>
      <g transform="scale(${iconSize / 512})">
        ${logo}
      </g>
    </g>
    <text x="${Math.round(width / 2)}" y="${textY}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="700" fill="#0f172a" text-anchor="middle">علاجگر</text>
  </svg>`;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(join(publicDir, name), buffer);
  console.log(`  ${name}  ${width}x${height}  ${(buffer.length / 1024).toFixed(1)} KB`);
}

/** 1200x630 Open Graph sharing image with logo and app name. */
async function writeOgImage() {
  const width = 1200;
  const height = 630;
  const iconSize = 160;
  const iconX = Math.round((width - iconSize) / 2);
  const iconY = 160;

  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="og-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b1120" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <radialGradient id="og-glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#2563eb" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#og-bg)"/>
    <rect width="${width}" height="${height}" fill="url(#og-glow)"/>
    <g transform="translate(${iconX} ${iconY})">
      <rect width="${iconSize}" height="${iconSize}" rx="36" fill="${BRAND}"/>
      <g transform="scale(${iconSize / 512})">
        ${logo}
      </g>
    </g>
    <text x="600" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="800" fill="#ffffff" text-anchor="middle">علاجگر</text>
    <text x="600" y="460" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="500" fill="#94a3b8" text-anchor="middle">برنامه هوشمند ارزیابی درد و سلامت مفاصل و عضلات</text>
  </svg>`;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(join(publicDir, 'og-image.png'), buffer);
  console.log(`  og-image.png  1200x630  ${(buffer.length / 1024).toFixed(1)} KB`);
}

console.log('Generating the PWA icons and sharing assets:');
await writeFromSvg(192, 'icon-192.png');
await writeFromSvg(512, 'icon-512.png');
await writeMaskable(512, 'icon-maskable-512.png');
await writeFromSvg(180, 'apple-touch-icon.png');

console.log('Generating iOS startup splash screens:');
await writeSplash(2048, 2732, 'apple-splash-2048-2732.png');
await writeSplash(1668, 2388, 'apple-splash-1668-2388.png');
await writeSplash(1536, 2048, 'apple-splash-1536-2048.png');
await writeSplash(1242, 2688, 'apple-splash-1242-2688.png');
await writeSplash(1170, 2532, 'apple-splash-1170-2532.png');
await writeSplash(1125, 2436, 'apple-splash-1125-2436.png');
await writeSplash(828, 1792, 'apple-splash-828-1792.png');

console.log('Generating Open Graph image:');
await writeOgImage();

console.log('Done.');
