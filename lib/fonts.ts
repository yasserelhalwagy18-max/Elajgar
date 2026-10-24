import localFont from 'next/font/local';

/**
 * Vazirmatn, self-hosted.
 *
 * The font used to come from `next/font/google`, which downloads it from
 * Google Fonts at build time. That is a problem in two places:
 *
 * - The build fails outright when the machine cannot reach Google Fonts.
 *   `fonts.googleapis.com` is blocked on a lot of networks - including the
 *   one this project is developed on - and `next build` treats the failure
 *   as an error, while `next dev` only warns.
 * - Every visitor's browser fetched the font from Google as well, which is
 *   slow for users on the same kind of network, and it leaks their visit to
 *   a third party.
 *
 * The files come from the `@fontsource/vazirmatn` package, so they are
 * installed with the rest of the dependencies and never have to be fetched
 * from anywhere.
 *
 * The font is split into the Arabic and Latin subsets, exactly as Google
 * Fonts serves it. Each subset is a separate family with a `unicode-range`,
 * so the browser only downloads the file it needs: the Arabic one for the
 * Persian text and the Latin one for the numbers and the English words.
 *
 * The weights are the ones the app uses: `font-medium`, `font-semibold`,
 * `font-bold`, `font-extrabold` and `font-black` are all in use. The Google
 * Fonts version was a variable font that covered 100-900 with a single file;
 * these are static files, so each weight is a separate download - which the
 * browser only makes when that weight is actually rendered.
 *
 * The unicode ranges are the ones the fontsource package ships in its
 * `unicode.json`, so they match the files exactly.
 *
 * Note: the font loader reads this file statically, so every value here has
 * to be written out as a literal. A variable would silently not be picked
 * up - and the build would fail saying so.
 */

/** The Persian text. */
export const vazirmatnArabic = localFont({
  src: [
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-arabic-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-arabic-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-arabic-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-arabic-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-arabic-800-normal.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-arabic-900-normal.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-vazir-arabic',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  declarations: [
    {
      prop: 'unicode-range',
      value: 'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC,U+102E0-102FB,U+10E60-10E7E,U+10EC2-10EC4,U+10EFC-10EFF,U+1EE00-1EE03,U+1EE05-1EE1F,U+1EE21-1EE22,U+1EE24,U+1EE27,U+1EE29-1EE32,U+1EE34-1EE37,U+1EE39,U+1EE3B,U+1EE42,U+1EE47,U+1EE49,U+1EE4B,U+1EE4D-1EE4F,U+1EE51-1EE52,U+1EE54,U+1EE57,U+1EE59,U+1EE5B,U+1EE5D,U+1EE5F,U+1EE61-1EE62,U+1EE64,U+1EE67-1EE6A,U+1EE6C-1EE72,U+1EE74-1EE77,U+1EE79-1EE7C,U+1EE7E,U+1EE80-1EE89,U+1EE8B-1EE9B,U+1EEA1-1EEA3,U+1EEA5-1EEA9,U+1EEAB-1EEBB,U+1EEF0-1EEF1',
    },
  ],
});

/** The numbers, the Latin words and the punctuation. */
export const vazirmatnLatin = localFont({
  src: [
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-latin-800-normal.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/vazirmatn/files/vazirmatn-latin-900-normal.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-vazir-latin',
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  declarations: [
    {
      prop: 'unicode-range',
      value: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    },
  ],
});
