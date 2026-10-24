import { describe, it, expect } from 'vitest';
import { toDateKey, fromDateKey, normalizeText, formatPersianNumber } from './utils';

describe('toDateKey', () => {
  it('uses the local calendar day, not the UTC day', () => {
    // 2026-10-19T21:30Z is 2026-10-20 01:00 in Tehran (UTC+3:30).
    const moment = new Date('2026-10-19T21:30:00Z');
    const key = toDateKey(moment);

    // The UTC key would be 2026-10-19 - the previous local day.
    expect(key).not.toBe('2026-10-19');
    expect(key).toBe(toDateKey(new Date(moment.getTime() + 60_000)));
  });

  it('produces a zero-padded YYYY-MM-DD key', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('round-trips through fromDateKey', () => {
    const date = new Date(2026, 4, 17);
    expect(toDateKey(fromDateKey(toDateKey(date)))).toBe(toDateKey(date));
  });
});

describe('normalizeText', () => {
  it('maps Arabic letter variants onto their Persian equivalents', () => {
    expect(normalizeText('كتاب')).toBe('کتاب');
    expect(normalizeText('علي')).toBe('علی');
    expect(normalizeText('أحمد')).toBe('احمد');
  });

  it('collapses whitespace and trims', () => {
    expect(normalizeText('  یوگا   باشگاه ')).toBe('یوگا باشگاه');
  });

  it('is case insensitive for latin text', () => {
    expect(normalizeText('CrossFit')).toBe('crossfit');
  });
});

describe('formatPersianNumber', () => {
  it('formats integers with Persian digits and thousands grouping', () => {
    expect(formatPersianNumber(1250)).toBe('۱٬۲۵۰');
    expect(formatPersianNumber(0)).toBe('۰');
    expect(formatPersianNumber(85)).toBe('۸۵');
  });

  it('formats decimals with specified fraction digits', () => {
    expect(formatPersianNumber(12.5, 1)).toBe('۱۲.۵');
  });

  it('handles strings and non-finite inputs gracefully', () => {
    expect(formatPersianNumber('500')).toBe('۵۰۰');
    expect(formatPersianNumber('')).toBe('');
    expect(formatPersianNumber(null)).toBe('');
    expect(formatPersianNumber(undefined)).toBe('');
  });
});
