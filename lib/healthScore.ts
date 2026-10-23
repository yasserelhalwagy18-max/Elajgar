import { UserProfile } from '../types';
import { toDateKey } from './utils';

export interface DailyHealthData {
  date: string; // Persian date string for display
  /** Null when the user recorded no data for that day. */
  weight: number | null;
  bmi: number | null;
  pain: number | null; // 0-10
  activity: number | null; // minutes
  calories: number | null;
  water: number | null; // liters
  sleepHours: number | null;
  sleepQuality: 'poor' | 'fair' | 'good' | null;
  healthScore?: number | null;
}

/** Targets used to score a day. Falls back to generic defaults. */
export interface HealthScoreTargets {
  /** Daily calorie target (kcal). */
  calories: number;
  /** Daily water target (liters). */
  water: number;
}

export const DEFAULT_HEALTH_TARGETS: HealthScoreTargets = {
  calories: 2000,
  water: 2.0,
};

/**
 * How much each component is worth.
 *
 * The defaults match the points each component could award. An admin can
 * change them from the panel, and the change applies to every user - the
 * weights live in the database, not in the browser.
 */
export interface HealthScoreWeights {
  bmi: number;
  activity: number;
  sleep: number;
  water: number;
  calories: number;
  pain: number;
}

export const DEFAULT_HEALTH_WEIGHTS: HealthScoreWeights = {
  bmi: 20,
  activity: 20,
  sleep: 15,
  water: 15,
  calories: 15,
  pain: 15,
};

export interface HealthScoreInput {
  bmi: number;
  activity: number;
  sleepHours: number;
  sleepQuality: 'poor' | 'fair' | 'good';
  /** Litres. */
  water: number;
  /** kcal. */
  calories: number;
  /** 0-10. */
  pain: number;
  targets?: Partial<HealthScoreTargets>;
  weights?: Partial<HealthScoreWeights>;
}

/**
 * Health score out of 100.
 *
 * Each component contributes a fixed number of points. A component whose input
 * is unknown (not merely zero) is **excluded** from the denominator rather than
 * scored as a failure, so the result is a fair percentage of what could
 * actually be assessed.
 */
export function calculateHealthScore(data: HealthScoreInput): number {
  const targets = { ...DEFAULT_HEALTH_TARGETS, ...data.targets };
  const weights = { ...DEFAULT_HEALTH_WEIGHTS, ...data.weights };

  let earned = 0;
  let available = 0;

  const award = (points: number, max: number) => {
    earned += points;
    available += max;
  };

  /**
   * Scale a component's raw score (0..rawMax) onto its configured weight.
   *
   * The raw score is computed against the component's built-in maximum; the
   * weight decides how many points that component is worth in total.
   */
  const scale = (raw: number, rawMax: number, weight: number) =>
    rawMax > 0 ? (raw / rawMax) * weight : 0;

  // 1. BMI Score (Max 20 points)
  if (data.bmi > 0) {
    let bmiScore = 0;
    if (data.bmi >= 18.5 && data.bmi <= 24.9) {
      bmiScore = 20;
    } else if ((data.bmi >= 17 && data.bmi < 18.5) || (data.bmi > 24.9 && data.bmi <= 29.9)) {
      bmiScore = 15;
    } else if ((data.bmi >= 16 && data.bmi < 17) || (data.bmi > 29.9 && data.bmi <= 34.9)) {
      bmiScore = 10;
    } else if ((data.bmi >= 15 && data.bmi < 16) || (data.bmi > 34.9 && data.bmi < 40)) {
      bmiScore = 5;
    } else {
      // Severely underweight or class II+ obesity: 0 points.
      bmiScore = 0;
    }
    award(scale(bmiScore, 20, weights.bmi), weights.bmi);
  }

  // 2. Activity Score (Max 20 points) - optimal is 45+ minutes
  if (Number.isFinite(data.activity) && data.activity >= 0) {
    let activityScore = 0;
    if (data.activity >= 45) {
      activityScore = 20;
    } else if (data.activity >= 30) {
      activityScore = 15;
    } else if (data.activity >= 15) {
      activityScore = 10;
    } else {
      activityScore = 5;
    }
    award(scale(activityScore, 20, weights.activity), weights.activity);
  }

  // 3. Sleep Score (Max 15 points)
  // sleepHours <= 0 means "not recorded", not "slept for zero hours".
  if (data.sleepHours > 0) {
    let sleepScore = 0;
    if (data.sleepQuality === 'good') {
      sleepScore += 10;
    } else if (data.sleepQuality === 'fair') {
      sleepScore += 5;
    }
    if (data.sleepHours >= 7 && data.sleepHours <= 9) {
      sleepScore += 5;
    } else if (data.sleepHours >= 6 || data.sleepHours <= 9.5) {
      // 6-6.9h or 9.1-9.5h: close enough to the optimal window.
      sleepScore += 2;
    }
    // > 9.5h is not rewarded - there is no upper "too much sleep" bonus.
    award(scale(Math.min(sleepScore, 15), 15, weights.sleep), weights.sleep);
  }

  // 4. Water Score (Max 15 points) - scored against the user's own target
  if (Number.isFinite(data.water) && data.water >= 0) {
    const ratio = targets.water > 0 ? data.water / targets.water : 0;
    let waterScore = 0;
    if (ratio >= 1) {
      waterScore = 15;
    } else if (ratio >= 0.75) {
      waterScore = 10;
    } else if (ratio >= 0.5) {
      waterScore = 5;
    }
    award(scale(waterScore, 15, weights.water), weights.water);
  }

  // 5. Calories Score (Max 15 points) - scored against the user's own target
  if (Number.isFinite(data.calories) && data.calories >= 0) {
    const ratio = targets.calories > 0 ? data.calories / targets.calories : 0;
    let caloriesScore = 0;
    if (ratio >= 0.9 && ratio <= 1.1) {
      caloriesScore = 15;
    } else if (ratio >= 0.8 && ratio <= 1.2) {
      caloriesScore = 10;
    } else if (ratio >= 0.6 && ratio <= 1.4) {
      caloriesScore = 5;
    }
    award(scale(caloriesScore, 15, weights.calories), weights.calories);
  }

  // 6. Pain Score (Max 15 points) - inverse relation: 0 pain = 15 pts
  if (Number.isFinite(data.pain) && data.pain >= 0) {
    const painScore = Math.max(0, 15 - data.pain * 1.5);
    award(scale(painScore, 15, weights.pain), weights.pain);
  }

  if (available === 0) return 0;
  return Math.round((earned / available) * 100);
}

/**
 * The optional inputs to the scoring functions.
 *
 * `weights` come from the global settings an admin controls, `targets` from
 * the user's own goal.
 */
export interface HealthScoreOptions {
  targets?: Partial<HealthScoreTargets>;
  weights?: Partial<HealthScoreWeights>;
}

/**
 * Build a per-day series from the user's daily logs.
 *
 * Days the user has no log for are returned with `null` metrics so the charts
 * show a gap instead of a fabricated zero.
 */
export function buildHealthDataFromLogs(
  userProfile: Partial<UserProfile> | null,
  days: number,
  options: HealthScoreOptions = {}
): { data: DailyHealthData[]; hasEnoughData: boolean } {
  if (!userProfile) return { data: [], hasEnoughData: false };

  const resolvedTargets = { ...DEFAULT_HEALTH_TARGETS, ...options.targets };
  const resolvedWeights = { ...DEFAULT_HEALTH_WEIGHTS, ...options.weights };

  const profileWeight = userProfile.weight || 0;
  const heightMeters = (userProfile.height || 170) / 100;
  const profileBmi = profileWeight > 0 ? Number((profileWeight / (heightMeters * heightMeters)).toFixed(1)) : 0;

  let profilePain: number | null = null;
  if (userProfile.painZones && userProfile.painZones.length > 0) {
    const totalPain = userProfile.painZones.reduce((sum, zone) => sum + zone.intensity, 0);
    profilePain = Math.round(totalPain / userProfile.painZones.length);
  }

  const generatedData: DailyHealthData[] = [];
  let validEntriesCount = 0;

  const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric', month: 'short' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    // Local calendar day - must match the key used when writing logs.
    const dateStr = toDateKey(d);
    const dateLabel = formatter.format(d);

    const log = userProfile.dailyLogs?.find((l) => l.date === dateStr);

    if (log) {
      validEntriesCount++;
    }

    // Per-day weight, when the user recorded one. Otherwise null: repeating
    // the current profile weight on every day produces a fake flat trend line.
    const dayWeight = log?.weight ?? null;
    const dayBmi =
      dayWeight !== null && userProfile.height
        ? Number((dayWeight / (heightMeters * heightMeters)).toFixed(1))
        : null;

    const dayPain = log?.painIntensity ?? null;

    const calories = log?.foods?.length
      ? log.foods.reduce((sum: number, food) => sum + food.calories, 0)
      : null;
    const water = log && typeof log.waterIntake === 'number' ? Number((log.waterIntake / 1000).toFixed(1)) : null;
    const activity = log && typeof log.activityMinutes === 'number' ? log.activityMinutes : null;
    const sleepHours = log?.sleepHours ?? null;
    const sleepQuality = log?.sleepQuality ?? null;

    const dataPoint: DailyHealthData = {
      date: dateLabel,
      weight: dayWeight,
      bmi: dayBmi,
      pain: dayPain,
      activity,
      calories,
      water,
      sleepHours,
      sleepQuality,
    };

    // Only score days that actually have a log - otherwise the score would be
    // fabricated from zeros.
    dataPoint.healthScore = log
      ? calculateHealthScore({
          bmi: dayBmi ?? profileBmi,
          activity: activity ?? 0,
          sleepHours: sleepHours ?? 0,
          sleepQuality: sleepQuality ?? 'poor',
          water: water ?? 0,
          calories: calories ?? 0,
          pain: dayPain ?? profilePain ?? 0,
          targets: resolvedTargets,
          weights: resolvedWeights,
        })
      : null;

    generatedData.push(dataPoint);
  }

  return { data: generatedData, hasEnoughData: validEntriesCount >= 3 };
}
