import { describe, it, expect } from 'vitest';
import { calculateHealthScore, buildHealthDataFromLogs } from './healthScore';
import { toDateKey } from './utils';

const optimal = {
  bmi: 22,
  activity: 60,
  sleepHours: 8,
  sleepQuality: 'good' as const,
  water: 2.5,
  calories: 2000,
  pain: 0,
};

describe('calculateHealthScore', () => {
  it('returns 100 for a perfect day', () => {
    expect(calculateHealthScore(optimal)).toBe(100);
  });

  it('scores calories relative to the user target, not a fixed band', () => {
    const target = { calories: 2000, water: 2 };

    // 2000 kcal against a 2000 kcal target is a perfect score.
    expect(calculateHealthScore({ ...optimal, calories: 2000, targets: target })).toBe(100);

    // The same 2000 kcal against a 1400 kcal target is over target, so it
    // must score lower than a perfect day.
    const lowTarget = calculateHealthScore({
      ...optimal,
      calories: 2000,
      targets: { calories: 1400, water: 2 },
    });
    expect(lowTarget).toBeLessThan(100);

    // ...and against a 3200 kcal target it is under target.
    const highTarget = calculateHealthScore({
      ...optimal,
      calories: 2000,
      targets: { calories: 3200, water: 2 },
    });
    expect(highTarget).toBeLessThan(100);
  });

  it('scores water relative to the user target', () => {
    const target = { calories: 2000, water: 3 };

    // 2.5L against a 3L target is not a full score, but it is above 75%.
    const partial = calculateHealthScore({ ...optimal, water: 2.5, targets: target });
    const full = calculateHealthScore({ ...optimal, water: 3, targets: target });
    expect(partial).toBeLessThan(full);
    expect(full).toBe(100);
  });

  it('does not lump severe malnutrition in with mild cases', () => {
    // The original ladder scored BMI 12 the same as BMI 33 (5/20) because the
    // `else` branch caught everything below 16. Severe cases must score lower
    // than borderline ones.
    const severeUnderweight = calculateHealthScore({ ...optimal, bmi: 12 });
    const borderlineUnderweight = calculateHealthScore({ ...optimal, bmi: 16.5 });
    const borderlineObese = calculateHealthScore({ ...optimal, bmi: 33 });
    const severeObese = calculateHealthScore({ ...optimal, bmi: 41 });

    expect(severeUnderweight).toBeLessThan(borderlineUnderweight);
    expect(severeObese).toBeLessThan(borderlineObese);
  });

  it('is monotonic around the optimal BMI band', () => {
    const scores = [15, 16, 17, 18, 22, 26, 30, 35, 41].map(
      (bmi) => calculateHealthScore({ ...optimal, bmi })
    );
    // 18.5-24.9 is the best band, everything else is worse.
    const best = Math.max(...scores);
    expect(scores[4]).toBe(best);
  });

  it('has no discontinuity in the sleep score', () => {
    const justUnder = calculateHealthScore({ ...optimal, sleepHours: 9.9, sleepQuality: 'poor' });
    const justOver = calculateHealthScore({ ...optimal, sleepHours: 10.1, sleepQuality: 'poor' });
    expect(Math.abs(justUnder - justOver)).toBeLessThanOrEqual(3);
  });

  it('does not reward excessive sleep', () => {
    const eight = calculateHealthScore({ ...optimal, sleepHours: 8, sleepQuality: 'poor' });
    const fourteen = calculateHealthScore({ ...optimal, sleepHours: 14, sleepQuality: 'poor' });
    expect(fourteen).toBeLessThanOrEqual(eight);
  });

  it('excludes unknown inputs instead of scoring them as failures', () => {
    // No BMI recorded and no sleep recorded: the score is still 100 for the
    // components that *are* known.
    expect(calculateHealthScore({ ...optimal, bmi: 0, sleepHours: 0 })).toBe(100);
  });
});

describe('buildHealthDataFromLogs', () => {
  it('leaves days without a log empty instead of zero-filling them', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = toDateKey(today);

    const { data } = buildHealthDataFromLogs(
      {
        weight: 70,
        height: 175,
        dailyLogs: [
          {
            date: todayKey,
            foods: [{ id: '1', name: 'test', calories: 2000, protein: 100, carbs: 200, fat: 70 }],
            waterIntake: 2500,
            sleepHours: 8,
            sleepQuality: 'good',
            activityMinutes: 60,
          },
        ],
      },
      7
    );

    const todayPoint = data.find((d) => d.date === undefined);
    expect(todayPoint).toBeUndefined();

    // Exactly one day has a score; the other six are null.
    const scored = data.filter((d) => d.healthScore !== null);
    expect(scored).toHaveLength(1);
    expect(data.filter((d) => d.healthScore === null)).toHaveLength(6);
  });

  it('uses the per-day weight when the user recorded one', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = toDateKey(today);

    const { data } = buildHealthDataFromLogs(
      {
        weight: 80,
        height: 175,
        dailyLogs: [
          {
            date: todayKey,
            foods: [],
            waterIntake: 0,
            weight: 79.5,
            painIntensity: 3,
          },
        ],
      },
      7
    );

    const scored = data.filter((d) => d.healthScore !== null);
    expect(scored).toHaveLength(1);
    expect(scored[0].weight).toBe(79.5);
    expect(scored[0].pain).toBe(3);
  });

  it('requires at least three logs before showing the report', () => {
    const profile = { dailyLogs: [] as any[] };
    expect(buildHealthDataFromLogs(profile, 7).hasEnoughData).toBe(false);
  });
});
