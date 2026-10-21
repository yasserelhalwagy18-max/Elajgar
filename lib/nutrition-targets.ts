/**
 * The nutrition targets.
 *
 * The calculation used to be written out twice - once on the nutrition
 * screen and once on the dashboard - and the two copies drifted apart. It
 * lives here now, and the numbers an admin can change are read from the
 * database through `getNutritionConfig()`.
 *
 * The module is deliberately free of server-only imports so the client can
 * use the same calculation.
 */

/** The share of the calories that comes from each macro, in percent. */
export interface MacroSplit {
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionConfig {
  /** Millilitres of water per kilogram of body weight. */
  waterPerKgMl: number;
  /** The water target when the user has not entered a weight. */
  defaultWaterMl: number;
  /** The calorie adjustment applied for each goal. */
  calorieAdjust: {
    maintain: number;
    cut: number;
    bulk: number;
  };
  /** The macro split for each goal. */
  macros: {
    maintain: MacroSplit;
    cut: MacroSplit;
    bulk: MacroSplit;
  };
}

export const DEFAULT_NUTRITION_CONFIG: NutritionConfig = {
  waterPerKgMl: 30,
  defaultWaterMl: 2000,
  calorieAdjust: {
    maintain: 0,
    cut: -500,
    bulk: 500,
  },
  macros: {
    maintain: { protein: 30, carbs: 40, fat: 30 },
    cut: { protein: 40, carbs: 30, fat: 30 },
    bulk: { protein: 25, carbs: 50, fat: 25 },
  },
};

/** The client's goal vocabulary. */
export type NutritionGoalKey = 'کاهش وزن' | 'افزایش وزن' | 'حفظ وزن' | 'سلامت عمومی';

/** Which configuration bucket a goal belongs to. */
export type GoalBucket = 'maintain' | 'cut' | 'bulk';

export function goalBucket(goal: string | null | undefined): GoalBucket {
  if (goal === 'کاهش وزن') return 'cut';
  if (goal === 'افزایش وزن') return 'bulk';
  return 'maintain';
}

/** The activity multipliers for the Mifflin-St Jeor estimate. */
export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export interface NutritionProfile {
  weight?: number | null;
  height?: number | null;
  age?: number | null;
  gender?: 'male' | 'female' | null;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | null;
  nutritionGoal?: string | null;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** The water target in millilitres. */
  waterMl: number;
}

/**
 * The daily targets for a user.
 *
 * The basal metabolic rate uses the Mifflin-St Jeor equation; the activity
 * multiplier and the goal adjustment turn it into a daily energy target, and
 * the macro split turns that into grams of protein, carbohydrate and fat.
 */
export function calculateNutritionTargets(
  config: NutritionConfig,
  profile: NutritionProfile | null | undefined,
): NutritionTargets {
  const weight = profile?.weight ?? 0;
  const height = profile?.height ?? 0;
  const age = profile?.age ?? 0;
  const gender = profile?.gender ?? null;
  const activityLevel = profile?.activityLevel ?? null;
  const bucket = goalBucket(profile?.nutritionGoal);

  let calories = 2000;

  if (weight > 0 && height > 0 && age > 0 && gender) {
    const bmr =
      10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);

    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel ?? 'sedentary'] ?? 1.2;

    calories = Math.round(bmr * multiplier + config.calorieAdjust[bucket]);
  }

  const split = config.macros[bucket];

  // 1g protein = 4 kcal, 1g carbohydrate = 4 kcal, 1g fat = 9 kcal.
  const protein = Math.round((calories * (split.protein / 100)) / 4);
  const carbs = Math.round((calories * (split.carbs / 100)) / 4);
  const fat = Math.round((calories * (split.fat / 100)) / 9);

  const waterMl =
    weight > 0
      ? Math.round(weight * config.waterPerKgMl)
      : config.defaultWaterMl;

  return { calories, protein, carbs, fat, waterMl };
}
