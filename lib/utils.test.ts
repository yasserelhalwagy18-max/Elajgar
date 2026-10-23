import { describe, it, expect } from 'vitest';
import { toDateKey, fromDateKey, normalizeText, normalizeDigits, formatNumber } from './utils';

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

describe('normalizeDigits', () => {
  it('maps Persian and Arabic digits onto Latin digits', () => {
    expect(normalizeDigits('۱۶۴')).toBe('164');
    expect(normalizeDigits('١٢٣')).toBe('123');
  });

  it('turns the Arabic decimal mark into a dot, so parseFloat sees the fraction', () => {
    expect(normalizeDigits('۱۶۴٫۵')).toBe('164.5');
    expect(parseFloat(normalizeDigits('۶۴٫۹'))).toBe(64.9);
  });

  it('drops the Arabic thousands separator, which is grouping punctuation', () => {
    expect(normalizeDigits('۱٬۲۳۴٫۵')).toBe('1234.5');
  });

  it('strips spaces and hyphens', () => {
    expect(normalizeDigits('0912-345 6789')).toBe('09123456789');
  });
});

describe('formatNumber', () => {
  it('groups thousands and uses Persian digits', () => {
    expect(formatNumber(12345)).toBe('۱۲٬۳۴۵');
  });

  it('caps fraction digits with the Arabic decimal mark', () => {
    expect(formatNumber(72.46, 1)).toBe('۷۲٫۵');
  });

  it('trims trailing zeros, so an integer never renders with a stranded decimal', () => {
    expect(formatNumber(72, 1)).toBe('۷۲');
    expect(formatNumber(64.0, 1)).toBe('۶۴');
  });

  it('shows a whole number without grouping marks', () => {
    expect(formatNumber(100, 1)).toBe('۱۰۰');
  });
});
