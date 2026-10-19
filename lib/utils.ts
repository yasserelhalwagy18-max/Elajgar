import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names, resolving conflicts between them.
 *
 * `clsx` handles conditional class values; `twMerge` makes sure the *last*
 * conflicting utility wins (e.g. `border-primary` beats `border-transparent`),
 * which a plain string join cannot do.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a Date to a `YYYY-MM-DD` key using the **local** calendar day.
 *
 * Never use `toISOString().split('T')[0]` for this: that is the UTC day, and
 * for any timezone ahead of UTC (Iran is UTC+3:30) it returns the previous day
 * between midnight and 03:30 local time.
 */
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parse a `YYYY-MM-DD` key into a local Date at midnight. */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year!, (month ?? 1) - 1, day ?? 1);
}

export function normalizeDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 0x30))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x30))
    .replace(/[\s-]/g, '');
}

/**
 * Normalize Arabic/Persian text for search.
 *
 * Persian has no letter case, and the same letter exists in several code
 * points (ي/ی, ك/ک, أ/ا). Without this, a user typing the Persian form will
 * not match text that was entered with the Arabic form.
 */
export function normalizeText(input: string): string {
  return input
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ۀة]/g, 'ه')
    .replace(/[‌-‏]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
