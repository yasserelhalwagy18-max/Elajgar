import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  default: { appSetting: { findMany: vi.fn(async () => []) } },
}));

const { validateSetting } = await import('./settings');

describe('validateSetting', () => {
  it('rejects an unknown setting', () => {
    const result = validateSetting('nope', {});

    expect(result.ok).toBe(false);
  });

  it('accepts valid health targets', () => {
    const result = validateSetting('health.targets', { calories: 2400, water: 2.5 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ calories: 2400, water: 2.5 });
    }
  });

  it('fills in the missing targets with the defaults', () => {
    const result = validateSetting('health.targets', { calories: 1800 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ calories: 1800, water: 2 });
    }
  });

  it('rejects a non-positive calorie target', () => {
    expect(validateSetting('health.targets', { calories: 0, water: 2 }).ok).toBe(false);
    expect(validateSetting('health.targets', { calories: -100, water: 2 }).ok).toBe(false);
  });

  it('rejects a water target that is not a number', () => {
    const result = validateSetting('health.targets', { calories: 2000, water: 'a lot' });

    expect(result.ok).toBe(false);
  });

  it('accepts valid health weights', () => {
    const result = validateSetting('health.weights', {
      bmi: 30,
      activity: 20,
      sleep: 10,
      water: 10,
      calories: 15,
      pain: 15,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        bmi: 30,
        activity: 20,
        sleep: 10,
        water: 10,
        calories: 15,
        pain: 15,
      });
    }
  });

  it('rejects a negative weight', () => {
    const result = validateSetting('health.weights', { bmi: -5 });

    expect(result.ok).toBe(false);
  });

  it('rejects a weight above 100', () => {
    const result = validateSetting('health.weights', { bmi: 500 });

    expect(result.ok).toBe(false);
  });

  it('rejects a set of weights that all sum to zero', () => {
    const result = validateSetting('health.weights', {
      bmi: 0,
      activity: 0,
      sleep: 0,
      water: 0,
      calories: 0,
      pain: 0,
    });

    expect(result.ok).toBe(false);
  });
});
