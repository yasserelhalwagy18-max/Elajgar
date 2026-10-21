import { describe, it, expect } from 'vitest';
import { calculateHealthScore, DEFAULT_HEALTH_WEIGHTS } from './healthScore';

const optimal = {
  bmi: 22,
  activity: 60,
  sleepHours: 8,
  sleepQuality: 'good' as const,
  water: 2.5,
  calories: 2000,
  pain: 0,
};

describe('calculateHealthScore with admin-controlled weights', () => {
  it('scores a perfect day at 100 with the default weights', () => {
    expect(calculateHealthScore(optimal)).toBe(100);
  });

  it('still scores a perfect day at 100 with custom weights', () => {
    const score = calculateHealthScore({
      ...optimal,
      weights: { bmi: 40, activity: 30, sleep: 10, water: 10, calories: 5, pain: 5 },
    });

    expect(score).toBe(100);
  });

  it('gives a component more influence when its weight is higher', () => {
    // The pain component is the only thing wrong in both runs.
    const painful = { ...optimal, pain: 10 };

    const painHeavy = calculateHealthScore({
      ...painful,
      weights: { ...DEFAULT_HEALTH_WEIGHTS, pain: 60 },
    });
    const painLight = calculateHealthScore({
      ...painful,
      weights: { ...DEFAULT_HEALTH_WEIGHTS, pain: 2 },
    });

    // A heavy pain weight drags the score down much further.
    expect(painHeavy).toBeLessThan(painLight);
  });

  it('ignores a component whose weight is zero', () => {
    // With no pain weight the pain component does not count at all, so a
    // painful day scores the same as a painless one.
    const withoutPain = { ...DEFAULT_HEALTH_WEIGHTS, pain: 0 };

    expect(calculateHealthScore({ ...optimal, pain: 10, weights: withoutPain })).toBe(100);
  });

  it('does not divide by zero when every weight is zero', () => {
    const score = calculateHealthScore({
      ...optimal,
      weights: { bmi: 0, activity: 0, sleep: 0, water: 0, calories: 0, pain: 0 },
    });

    expect(score).toBe(0);
  });

  it('drops an unknown component from the denominator instead of scoring it zero', () => {
    // BMI and sleep are "not recorded" here, so they do not count at all.
    // The components that *are* known are all perfect, so the score is 100.
    const score = calculateHealthScore({
      ...optimal,
      bmi: 0,
      sleepHours: 0,
    });

    expect(score).toBe(100);
  });

  it('counts a known but poor component against the score', () => {
    // A BMI of 30 is not "unknown" - it is recorded and it is poor. It scores
    // 10 of the 20 points the BMI component can contribute, so the day comes
    // out at 90 instead of 100.
    const score = calculateHealthScore({ ...optimal, bmi: 30 });

    expect(score).toBe(90);
  });
});
