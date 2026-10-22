import { describe, it, expect } from 'vitest';
import { resolveBucket, migrateZoneKey, REGION_BY_ID, BODY_REGIONS, BODY_BUCKETS } from './body-regions';

describe('resolveBucket', () => {
  it('resolves a region id to its coarse bucket', () => {
    expect(resolveBucket('lower_back')).toBe('back');
    expect(resolveBucket('neck_front')).toBe('neck');
    expect(resolveBucket('knee_l_front')).toBe('knees_l');
    expect(resolveBucket('ankle_r_front')).toBe('feet_r');
    expect(resolveBucket('shoulders_front')).toBe('shoulders');
    expect(resolveBucket('pelvis_front')).toBe('hips');
  });

  it('resolves the plain words the wizard may store', () => {
    expect(resolveBucket('گردن')).toBe('neck');
    expect(resolveBucket('کمر')).toBe('back');
    expect(resolveBucket('زانو')).toBe('knees_r');
    expect(resolveBucket('زانوی چپ')).toBe('knees_l');
    expect(resolveBucket('شانه')).toBe('shoulders');
  });

  it('resolves the thigh to the leg rather than to the back', () => {
    // "پشت ران چپ" contains both "پشت" (back) and "ران" (thigh); the more
    // specific family has to win.
    expect(resolveBucket('پشت ران چپ')).toBe('knees_l');
  });

  it('resolves the ankle and heel to the feet', () => {
    expect(resolveBucket('پاشنه پای راست')).toBe('feet_r');
    expect(resolveBucket('مچ پا')).toBe('feet_r');
  });

  it('returns null for a region it does not know', () => {
    expect(resolveBucket('somewhere else')).toBeNull();
    expect(resolveBucket('')).toBeNull();
    expect(resolveBucket(null)).toBeNull();
    expect(resolveBucket(undefined)).toBeNull();
  });

  it('gives every registered region a bucket', () => {
    for (const region of BODY_REGIONS) {
      expect(BODY_BUCKETS).toContain(region.bucket);
    }
  });
});

describe('migrateZoneKey', () => {
  it('turns the labels the v0 store held into region ids', () => {
    expect(migrateZoneKey('کمر')).toBe('lower_back');
    expect(migrateZoneKey('قفسه سینه')).toBe('chest');
    expect(migrateZoneKey('گردن')).toBe('neck_front');
  });

  it('resolves a label shared by both views to exactly one region', () => {
    // The front and the back maps reuse the elbow labels; the migration has
    // to pick a single deterministic region instead of flapping between the
    // two.
    expect(migrateZoneKey('آرنج راست')).toBe('elbow_r_front');
    expect(migrateZoneKey('آرنج چپ')).toBe('elbow_l_front');
    expect(migrateZoneKey('مچ دست چپ')).toBe('wrist_l_front');
  });

  it('passes ids and unknown strings through untouched', () => {
    expect(migrateZoneKey('elbow_r_back')).toBe('elbow_r_back');
    expect(migrateZoneKey('legacy-with-no-region')).toBe('legacy-with-no-region');
    expect(migrateZoneKey('')).toBe('');
    expect(migrateZoneKey(undefined)).toBe('');
  });

  it('maps every region label onto a known region id', () => {
    for (const region of BODY_REGIONS) {
      expect(REGION_BY_ID.get(migrateZoneKey(region.label))).toBeDefined();
    }
  });
});
