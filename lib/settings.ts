import 'server-only';

import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import {
  DEFAULT_HEALTH_TARGETS,
  DEFAULT_HEALTH_WEIGHTS,
  type HealthScoreTargets,
  type HealthScoreWeights,
} from './healthScore';
import {
  DEFAULT_NUTRITION_CONFIG,
  type NutritionConfig,
} from './nutrition-targets';

/**
 * The global settings an admin can change.
 *
 * The health score used to read hard-coded constants, and the admin panel
 * wrote its "weights" into `localStorage` - a key nothing ever read. Both
 * are now backed by the database, so a change applies to every user and
 * survives a cache clear.
 */
export type { HealthScoreTargets, HealthScoreWeights };
export type { NutritionConfig };

export { DEFAULT_HEALTH_TARGETS, DEFAULT_HEALTH_WEIGHTS };
export { DEFAULT_NUTRITION_CONFIG };

export const SETTING_KEYS = {
  'health.targets': 'اهداف روزانه سلامت',
  'health.weights': 'وزن مؤلفه‌های امتیاز سلامت',
  'nutrition.config': 'اهداف تغذیه‌ای و سهم درشت‌ماکروها',
  'program.steps': 'مراحل برنامه تمرینی روزانه',
} as const;

export type SettingKey = keyof typeof SETTING_KEYS;

/** One step of the daily corrective program. */
export interface ProgramStep {
  /** The day offset from today. Negative is in the past. */
  offset: number;
  text: string;
  status: 'completed' | 'pending' | 'skipped';
}

export const DEFAULT_PROGRAM_STEPS: ProgramStep[] = [
  { offset: -4, text: 'تمرینات گردن', status: 'completed' },
  { offset: -3, text: 'حرکات اصلاحی کمر', status: 'completed' },
  { offset: -2, text: 'مدیتیشن', status: 'skipped' },
  { offset: -1, text: 'تمرینات گردن', status: 'pending' },
  { offset: 0, text: 'حرکات اصلاحی کمر', status: 'pending' },
];

export const DEFAULT_SETTINGS: Record<SettingKey, Prisma.InputJsonValue> = {
  'health.targets': { ...DEFAULT_HEALTH_TARGETS },
  'health.weights': { ...DEFAULT_HEALTH_WEIGHTS },
  // The nested macro split has no index signature, so it needs a cast to be
  // accepted as a JSON column value.
  'nutrition.config': { ...DEFAULT_NUTRITION_CONFIG } as unknown as Prisma.InputJsonValue,
  'program.steps': DEFAULT_PROGRAM_STEPS as unknown as Prisma.InputJsonValue,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readFiniteNumber(
  source: Record<string, unknown>,
  field: string,
  fallback: number,
): number | null {
  const value = source[field];
  if (value === undefined || value === null) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;

  return parsed;
}

/**
 * Validate a value for a setting.
 *
 * Returns the normalised value on success and a message in Persian on
 * failure, so the panel can show what is wrong without re-implementing the
 * rules.
 */
export function validateSetting(
  key: string,
  value: unknown,
): { ok: true; value: Prisma.InputJsonValue } | { ok: false; error: string } {
  switch (key) {
    case 'health.targets': {
      if (!isRecord(value)) {
        return { ok: false, error: 'مقدار اهداف باید یک شیء باشد' };
      }

      const calories = readFiniteNumber(value, 'calories', DEFAULT_HEALTH_TARGETS.calories);
      const water = readFiniteNumber(value, 'water', DEFAULT_HEALTH_TARGETS.water);

      if (calories === null || calories <= 0 || calories > 20000) {
        return { ok: false, error: 'هدف کالری باید بین ۱ و ۲۰۰۰۰ باشد' };
      }
      if (water === null || water <= 0 || water > 20) {
        return { ok: false, error: 'هدف آب باید بین ۰٫۱ و ۲۰ لیتر باشد' };
      }

      return { ok: true, value: { calories, water } };
    }

    case 'health.weights': {
      if (!isRecord(value)) {
        return { ok: false, error: 'مقدار وزن‌ها باید یک شیء باشد' };
      }

      const weights: HealthScoreWeights = { ...DEFAULT_HEALTH_WEIGHTS };
      let total = 0;

      for (const field of Object.keys(DEFAULT_HEALTH_WEIGHTS) as Array<keyof HealthScoreWeights>) {
        const parsed = readFiniteNumber(value, field, DEFAULT_HEALTH_WEIGHTS[field]);
        if (parsed === null || parsed < 0 || parsed > 100) {
          return { ok: false, error: `وزن «${field}» باید بین ۰ و ۱۰۰ باشد` };
        }
        weights[field] = parsed;
        total += parsed;
      }

      if (total <= 0) {
        return { ok: false, error: 'مجموع وزن‌ها باید بزرگ‌تر از صفر باشد' };
      }

      return { ok: true, value: { ...weights } };
    }

    case 'nutrition.config': {
      if (!isRecord(value)) {
        return { ok: false, error: 'مقدار تنظیمات تغذیه باید یک شیء باشد' };
      }

      const defaults = DEFAULT_NUTRITION_CONFIG;

      const waterPerKgMl = readFiniteNumber(value, 'waterPerKgMl', defaults.waterPerKgMl);
      const defaultWaterMl = readFiniteNumber(value, 'defaultWaterMl', defaults.defaultWaterMl);

      if (waterPerKgMl === null || waterPerKgMl < 10 || waterPerKgMl > 100) {
        return { ok: false, error: 'مقدار آب به ازای هر کیلوگرم باید بین ۱۰ و ۱۰۰ میلی‌لیتر باشد' };
      }
      if (defaultWaterMl === null || defaultWaterMl < 500 || defaultWaterMl > 10000) {
        return { ok: false, error: 'هدف پیش‌فرض آب باید بین ۵۰۰ و ۱۰۰۰۰ میلی‌لیتر باشد' };
      }

      const adjustSource = isRecord(value.calorieAdjust) ? value.calorieAdjust : {};
      const calorieAdjust = {
        maintain: readFiniteNumber(adjustSource, 'maintain', defaults.calorieAdjust.maintain) ?? 0,
        cut: readFiniteNumber(adjustSource, 'cut', defaults.calorieAdjust.cut) ?? 0,
        bulk: readFiniteNumber(adjustSource, 'bulk', defaults.calorieAdjust.bulk) ?? 0,
      };

      for (const [name, amount] of Object.entries(calorieAdjust)) {
        if (amount < -2000 || amount > 2000) {
          return { ok: false, error: `تغییر کالری «${name}» باید بین ۲۰۰۰- و ۲۰۰۰ باشد` };
        }
      }

      const macrosSource = isRecord(value.macros) ? value.macros : {};
      const macros = { ...defaults.macros };

      for (const bucket of ['maintain', 'cut', 'bulk'] as const) {
        const splitSource = isRecord(macrosSource[bucket]) ? macrosSource[bucket] : {};
        const split = { ...defaults.macros[bucket] };

        for (const field of ['protein', 'carbs', 'fat'] as const) {
          const parsed = readFiniteNumber(splitSource, field, defaults.macros[bucket][field]);
          if (parsed === null || parsed < 0 || parsed > 100) {
            return { ok: false, error: `سهم «${field}» در «${bucket}» باید بین ۰ و ۱۰۰ باشد` };
          }
          split[field] = parsed;
        }

        const sum = split.protein + split.carbs + split.fat;
        if (Math.abs(sum - 100) > 1) {
          return {
            ok: false,
            error: `مجموع سهم پروتئین، کربوهیدرات و چربی در «${bucket}» باید ۱۰۰ درصد باشد (${sum} است)`,
          };
        }

        macros[bucket] = split;
      }

      return {
        ok: true,
        value: { waterPerKgMl, defaultWaterMl, calorieAdjust, macros } as unknown as Prisma.InputJsonValue,
      };
    }

    case 'program.steps': {
      if (!Array.isArray(value)) {
        return { ok: false, error: 'مراحل برنامه باید یک آرایه باشد' };
      }

      const steps: ProgramStep[] = [];

      for (const raw of value) {
        if (!isRecord(raw)) {
          return { ok: false, error: 'هر مرحله باید یک شیء باشد' };
        }

        const offset = Number(raw.offset);
        const text = typeof raw.text === 'string' ? raw.text.trim() : '';
        const status = raw.status;

        if (!Number.isFinite(offset) || offset < -30 || offset > 30) {
          return { ok: false, error: 'فاصله هر مرحله باید بین ۳۰- و ۳۰ روز باشد' };
        }
        if (!text) {
          return { ok: false, error: 'متن هر مرحله نمی‌تواند خالی باشد' };
        }
        if (status !== 'completed' && status !== 'pending' && status !== 'skipped') {
          return { ok: false, error: 'وضعیت هر مرحله نامعتبر است' };
        }

        steps.push({ offset, text, status });
      }

      if (steps.length === 0) {
        return { ok: false, error: 'برنامه باید حداقل یک مرحله داشته باشد' };
      }

      return { ok: true, value: steps as unknown as Prisma.InputJsonValue };
    }

    default:
      return { ok: false, error: `تنظیم ناشناخته: ${key}` };
  }
}

/**
 * Read every setting, falling back to the defaults for the ones that were
 * never written.
 */
export async function getSettings(): Promise<Record<string, unknown>> {
  const rows = await prisma.appSetting.findMany();

  const stored = new Map(rows.map((row) => [row.key, row.value]));

  const result: Record<string, unknown> = {};
  for (const [key, fallback] of Object.entries(DEFAULT_SETTINGS)) {
    result[key] = stored.get(key) ?? fallback;
  }

  return result;
}

/** Read the health targets, with the defaults applied. */
export async function getHealthScoreTargets(): Promise<HealthScoreTargets> {
  const settings = await getSettings();
  const targets = settings['health.targets'];

  if (!isRecord(targets)) return DEFAULT_HEALTH_TARGETS;

  return {
    calories: readFiniteNumber(targets, 'calories', DEFAULT_HEALTH_TARGETS.calories) ?? DEFAULT_HEALTH_TARGETS.calories,
    water: readFiniteNumber(targets, 'water', DEFAULT_HEALTH_TARGETS.water) ?? DEFAULT_HEALTH_TARGETS.water,
  };
}

/** Read the health score weights, with the defaults applied. */
export async function getHealthScoreWeights(): Promise<HealthScoreWeights> {
  const settings = await getSettings();
  const weights = settings['health.weights'];

  if (!isRecord(weights)) return DEFAULT_HEALTH_WEIGHTS;

  const result: HealthScoreWeights = { ...DEFAULT_HEALTH_WEIGHTS };
  for (const field of Object.keys(DEFAULT_HEALTH_WEIGHTS) as Array<keyof HealthScoreWeights>) {
    result[field] = readFiniteNumber(weights, field, DEFAULT_HEALTH_WEIGHTS[field]) ?? DEFAULT_HEALTH_WEIGHTS[field];
  }
  return result;
}

/** Read the daily program steps, with the defaults applied. */
export async function getProgramSteps(): Promise<ProgramStep[]> {
  const settings = await getSettings();
  const steps = settings['program.steps'];

  if (!Array.isArray(steps)) return DEFAULT_PROGRAM_STEPS;

  const valid = steps.filter(
    (step): step is ProgramStep =>
      isRecord(step) &&
      Number.isFinite(Number(step.offset)) &&
      typeof step.text === 'string' &&
      (step.status === 'completed' ||
        step.status === 'pending' ||
        step.status === 'skipped'),
  );

  return valid.length > 0 ? valid : DEFAULT_PROGRAM_STEPS;
}

/** Read the nutrition configuration, with the defaults applied. */
export async function getNutritionConfig(): Promise<NutritionConfig> {  const settings = await getSettings();
  const config = settings['nutrition.config'];

  if (!isRecord(config)) return DEFAULT_NUTRITION_CONFIG;

  const defaults = DEFAULT_NUTRITION_CONFIG;
  const adjustSource = isRecord(config.calorieAdjust) ? config.calorieAdjust : {};
  const macrosSource = isRecord(config.macros) ? config.macros : {};

  const macros = { ...defaults.macros };
  for (const bucket of ['maintain', 'cut', 'bulk'] as const) {
    const splitSource = isRecord(macrosSource[bucket]) ? macrosSource[bucket] : {};
    const split = { ...defaults.macros[bucket] };
    for (const field of ['protein', 'carbs', 'fat'] as const) {
      split[field] =
        readFiniteNumber(splitSource, field, defaults.macros[bucket][field]) ??
        defaults.macros[bucket][field];
    }
    macros[bucket] = split;
  }

  return {
    waterPerKgMl:
      readFiniteNumber(config, 'waterPerKgMl', defaults.waterPerKgMl) ?? defaults.waterPerKgMl,
    defaultWaterMl:
      readFiniteNumber(config, 'defaultWaterMl', defaults.defaultWaterMl) ?? defaults.defaultWaterMl,
    calorieAdjust: {
      maintain: readFiniteNumber(adjustSource, 'maintain', defaults.calorieAdjust.maintain) ?? 0,
      cut: readFiniteNumber(adjustSource, 'cut', defaults.calorieAdjust.cut) ?? 0,
      bulk: readFiniteNumber(adjustSource, 'bulk', defaults.calorieAdjust.bulk) ?? 0,
    },
    macros,
  };
}
