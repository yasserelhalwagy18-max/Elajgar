import type { Prisma } from '@prisma/client';
import { resolveBucket } from './body-regions';

/**
 * How much attention a user's record needs.
 *
 * The risk is derived from what the user actually reported - the intensity of
 * their pain and their stress level - so the admin can triage the list
 * instead of reading every record.
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export interface RiskAssessment {
  level: RiskLevel;
  /** The number of regions the user reported. */
  painZones: number;
  /** The highest intensity the user reported, 0-10. */
  maxIntensity: number;
  /** Why this level was chosen, in Persian, for the admin to read. */
  reason: string;
}

interface RiskInput {
  painRegions?: Prisma.JsonValue | null;
  questionnaire?: {
    stressLevel?: string | null;
    sleepQuality?: string | null;
  } | null;
}

const HIGH_STRESS = new Set(['HIGH', 'high', 'زیاد']);

/**
 * Assess a user from their reported pain and their questionnaire.
 *
 * A user who has not filled in the questionnaire yet is `unknown` rather than
 * `low`: "no data" and "no problem" are different things, and showing an
 * empty record as low risk would hide it.
 */
export function assessUserRisk(input: RiskInput): RiskAssessment {
  const zones = Array.isArray(input.painRegions) ? input.painRegions : [];

  const resolved = zones
    .filter((zone): zone is Prisma.JsonObject => Boolean(zone) && typeof zone === 'object')
    .map((zone) => ({
      bucket: resolveBucket(typeof zone.zone === 'string' ? zone.zone : null),
      intensity: Number(zone.intensity),
      type: typeof zone.type === 'string' ? zone.type : null,
    }))
    .filter((zone) => zone.bucket !== null);

  if (resolved.length === 0) {
    return {
      level: 'unknown',
      painZones: 0,
      maxIntensity: 0,
      reason: 'کاربر هنوز ناحیه دردی ثبت نکرده است',
    };
  }

  const intensities = resolved
    .map((zone) => zone.intensity)
    .filter((value) => Number.isFinite(value));

  const maxIntensity = intensities.length > 0 ? Math.max(...intensities) : 0;
  const painZones = resolved.length;

  const highStress = input.questionnaire?.stressLevel
    ? HIGH_STRESS.has(input.questionnaire.stressLevel)
    : false;

  if (maxIntensity >= 7 || highStress) {
    return {
      level: 'high',
      painZones,
      maxIntensity,
      reason: highStress
        ? 'استرس بالا در پرسشنامه'
        : 'شدت درد گزارش‌شده ۷ یا بیشتر',
    };
  }

  if (maxIntensity >= 4 || painZones >= 3) {
    return {
      level: 'medium',
      painZones,
      maxIntensity,
      reason: painZones >= 3
        ? `${painZones.toLocaleString('fa-IR')} ناحیه درد گزارش شده`
        : 'شدت درد متوسط گزارش شده',
    };
  }

  return {
    level: 'low',
    painZones,
    maxIntensity,
    reason: 'شدت درد پایین گزارش شده',
  };
}
