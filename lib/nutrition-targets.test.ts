import { describe, it, expect } from 'vitest';
import {
  calculateNutritionTargets,
  DEFAULT_NUTRITION_CONFIG,
  goalBucket,
  type NutritionConfig,
} from './nutrition-targets';

const profile = {
  weight: 71,
  height: 172,
  age: 34,
  gender: 'female' as const,
  activityLevel: 'light' as const,
  nutritionGoal: 'حفظ وزن',
};

describe('calculateNutritionTargets', () => {
  it('uses the Mifflin-St Jeor equation with the activity multiplier', () => {
    // bmr = 10*71 + 6.25*172 - 5*34 - 161 = 1454
    // tdee = 1454 * 1.375 = 1999.25 -> 1999
    const targets = calculateNutritionTargets(DEFAULT_NUTRITION_CONFIG, profile);

    expect(targets.calories).toBe(1999);
  });

  it('splits the calories into the configured macro ratios', () => {
    const targets = calculateNutritionTargets(DEFAULT_NUTRITION_CONFIG, profile);

    // 30% protein, 40% carbs, 30% fat
    expect(targets.protein).toBe(Math.round((1999 * 0.3) / 4));
    expect(targets.carbs).toBe(Math.round((1999 * 0.4) / 4));
    expect(targets.fat).toBe(Math.round((1999 * 0.3) / 9));
  });

  it('applies the goal adjustment', () => {
    const cut = calculateNutritionTargets(DEFAULT_NUTRITION_CONFIG, {
      ...profile,
      nutritionGoal: 'کاهش وزن',
    });
    const bulk = calculateNutritionTargets(DEFAULT_NUTRITION_CONFIG, {
      ...profile,
      nutritionGoal: 'افزایش وزن',
    });
    const maintain = calculateNutritionTargets(DEFAULT_NUTRITION_CONFIG, profile);

    expect(cut.calories).toBe(maintain.calories - 500);
    expect(bulk.calories).toBe(maintain.calories + 500);
  });

  it('uses the macro split of the goal', () => {
    const cut = calculateNutritionTargets(DEFAULT_NUTRITION_CONFIG, {
      ...profile,
      nutritionGoal: 'کاهش وزن',
    });

    // A cut is 40% protein and 30% carbs, against 30% and 40% for
    // maintenance - so the carbohydrate target drops by a third.
    expect(cut.calories).toBe(1499);
    expect(cut.protein).toBe(Math.round((1499 * 0.4) / 4));
    expect(cut.carbs).toBe(Math.round((1499 * 0.3) / 4));
  });

  it('honours a water target that an admin changed', () => {
    const config: NutritionConfig = {
      ...DEFAULT_NUTRITION_CONFIG,
      waterPerKgMl: 40,
    };

    const targets = calculateNutritionTargets(config, profile);

    expect(targets.waterMl).toBe(2840);
  });

  it('falls back to the default water target without a weight', () => {
    const config: NutritionConfig = {
      ...DEFAULT_NUTRITION_CONFIG,
      defaultWaterMl: 2500,
    };

    const targets = calculateNutritionTargets(config, { weight: 0, height: 0, age: 0 });

    expect(targets.waterMl).toBe(2500);
  });

  it('falls back to 2000 calories without a complete profile', () => {
    const targets = calculateNutritionTargets(DEFAULT_NUTRITION_CONFIG, { weight: 71 });

    expect(targets.calories).toBe(2000);
  });
});

describe('goalBucket', () => {
  it('maps the client goal vocabulary onto the configuration buckets', () => {
    expect(goalBucket('کاهش وزن')).toBe('cut');
    expect(goalBucket('افزایش وزن')).toBe('bulk');
    expect(goalBucket('حفظ وزن')).toBe('maintain');
    expect(goalBucket('سلامت عمومی')).toBe('maintain');
    expect(goalBucket(null)).toBe('maintain');
  });
});
