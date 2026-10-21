import { NextResponse } from 'next/server';
import {
  Prisma,
  Gender,
  ActivityLevel,
  NutritionGoal,
  SleepQuality,
  StressLevel,
} from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';
import { getHealthScoreWeights, getNutritionConfig } from '@/lib/settings';

/**
 * The client stores gender/activityLevel in lower case, while Prisma models
 * them as enums. Map explicitly rather than spreading the request body - that
 * also rejects unexpected values with a 400 instead of a 500 from Prisma.
 */
const GENDER_MAP: Record<string, Gender> = {
  male: 'MALE',
  female: 'FEMALE',
};

const ACTIVITY_LEVEL_MAP: Record<string, ActivityLevel> = {
  sedentary: 'SEDENTARY',
  light: 'LIGHT',
  moderate: 'MODERATE',
  active: 'ACTIVE',
};

const NUTRITION_GOAL_MAP: Record<string, NutritionGoal> = {
  'کاهش وزن': NutritionGoal.WEIGHT_LOSS,
  'افزایش وزن': NutritionGoal.WEIGHT_GAIN,
  'حفظ وزن': NutritionGoal.MAINTAIN,
  'سلامت عمومی': NutritionGoal.GENERAL_HEALTH,
};

/**
 * Reverse maps so the API speaks the same vocabulary as `types/index.ts`
 * (lower-case gender / activity level, Persian nutrition goal) instead of the
 * Prisma enum names.
 */
const GENDER_TO_CLIENT: Record<Gender, string> = { MALE: 'male', FEMALE: 'female' };
const ACTIVITY_LEVEL_TO_CLIENT: Record<ActivityLevel, string> = {
  SEDENTARY: 'sedentary',
  LIGHT: 'light',
  MODERATE: 'moderate',
  ACTIVE: 'active',
};
const NUTRITION_GOAL_TO_CLIENT: Record<NutritionGoal, string> = {
  WEIGHT_LOSS: 'کاهش وزن',
  WEIGHT_GAIN: 'افزایش وزن',
  MAINTAIN: 'حفظ وزن',
  GENERAL_HEALTH: 'سلامت عمومی',
};

/** The questionnaire uses Persian wording, the DB uses the SleepQuality enum. */
const QUESTIONNAIRE_SLEEP_QUALITY: Record<string, SleepQuality> = {
  'خوب': SleepQuality.GOOD,
  'متوسط': SleepQuality.FAIR,
  'بد': SleepQuality.POOR,
  'good': SleepQuality.GOOD,
  'fair': SleepQuality.FAIR,
  'poor': SleepQuality.POOR,
};

const SLEEP_QUALITY_TO_CLIENT: Record<SleepQuality, string> = {
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
};

/** The client sends lower-case sleep quality, the DB stores the enum name. */
const SLEEP_QUALITY_FROM_CLIENT: Record<string, SleepQuality> = {
  good: SleepQuality.GOOD,
  fair: SleepQuality.FAIR,
  poor: SleepQuality.POOR,
};

const QUESTIONNAIRE_SLEEP_QUALITY_TO_CLIENT: Record<SleepQuality, string> = {
  GOOD: 'خوب',
  FAIR: 'متوسط',
  POOR: 'بد',
};

const STRESS_LEVEL_TO_CLIENT: Record<StressLevel, string> = {
  LOW: 'کم',
  MEDIUM: 'متوسط',
  HIGH: 'زیاد',
};

const TRUE_WORDS = new Set(['بله', 'true', 'yes', '1']);

/** The questionnaire's yes/no fields are booleans in the DB and Persian words
 *  in the client vocabulary - see TRUE_WORDS / FALSE_WORDS below. */
/** The questionnaire's yes/no fields are booleans in the DB and Persian words
 *  in the client vocabulary - see TRUE_WORDS / FALSE_WORDS below. */
function booleanToClient(value: boolean): string {
  return value ? 'بله' : 'خیر';
}
const FALSE_WORDS = new Set(['خیر', 'false', 'no', '0']);

class InvalidProfileField extends Error {}

/** The profile fields a client may write to its own account. */
interface ProfileFields {
  fullName?: string;
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  activityLevel?: ActivityLevel;
  jobTitle?: string;
  underlyingDiseases?: string[];
  medications?: string[];
  termsAccepted?: boolean;
  currentWizardStep?: number;
  nutritionGoal?: NutritionGoal;
}

interface ClientFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ClientDailyLog {
  date: string;
  foods: ClientFood[];
  waterIntake: number;
  sleepHours?: number;
  sleepQuality?: 'poor' | 'fair' | 'good';
  activityMinutes?: number;
  weight?: number;
  painIntensity?: number;
}

/**
 * Fields the client is allowed to write to its own profile.
 *
 * This is an explicit allow-list on purpose: spreading `...body` straight into
 * Prisma would let a caller set `role`, `id` or `email` on themselves.
 */
function buildProfileUpdate(body: Record<string, unknown>): ProfileFields {
  const data: ProfileFields = {};

  if (body.fullName !== undefined) {
    if (typeof body.fullName !== 'string') throw new InvalidProfileField('fullName');
    data.fullName = body.fullName;
  }

  if (body.age !== undefined) {
    const age = Number(body.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) throw new InvalidProfileField('age');
    data.age = age;
  }

  if (body.gender !== undefined) {
    const gender = GENDER_MAP[String(body.gender)];
    if (!gender) throw new InvalidProfileField('gender');
    data.gender = gender;
  }

  if (body.height !== undefined) {
    const height = Number(body.height);
    if (!Number.isFinite(height) || height < 50 || height > 250) throw new InvalidProfileField('height');
    data.height = height;
  }

  if (body.weight !== undefined) {
    const weight = Number(body.weight);
    if (!Number.isFinite(weight) || weight < 10 || weight > 300) throw new InvalidProfileField('weight');
    data.weight = weight;
  }

  if (body.activityLevel !== undefined) {
    const level = ACTIVITY_LEVEL_MAP[String(body.activityLevel)];
    if (!level) throw new InvalidProfileField('activityLevel');
    data.activityLevel = level;
  }

  if (body.jobTitle !== undefined) {
    if (typeof body.jobTitle !== 'string') throw new InvalidProfileField('jobTitle');
    data.jobTitle = body.jobTitle;
  }

  if (body.underlyingDiseases !== undefined) {
    if (!Array.isArray(body.underlyingDiseases) || body.underlyingDiseases.some((v) => typeof v !== 'string')) {
      throw new InvalidProfileField('underlyingDiseases');
    }
    data.underlyingDiseases = body.underlyingDiseases as string[];
  }

  if (body.medications !== undefined) {
    if (!Array.isArray(body.medications) || body.medications.some((v) => typeof v !== 'string')) {
      throw new InvalidProfileField('medications');
    }
    data.medications = body.medications as string[];
  }

  if (body.termsAccepted !== undefined) {
    if (typeof body.termsAccepted !== 'boolean') throw new InvalidProfileField('termsAccepted');
    data.termsAccepted = body.termsAccepted;
  }

  if (body.currentWizardStep !== undefined) {
    const step = Number(body.currentWizardStep);
    if (!Number.isInteger(step) || step < 0 || step > 6) throw new InvalidProfileField('currentWizardStep');
    data.currentWizardStep = step;
  }

  if (body.nutritionGoal !== undefined) {
    const goal = NUTRITION_GOAL_MAP[String(body.nutritionGoal)];
    if (!goal) throw new InvalidProfileField('nutritionGoal');
    data.nutritionGoal = goal;
  }

  return data;
}

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function buildDailyLogs(body: Record<string, unknown>): ClientDailyLog[] {
  if (body.dailyLogs === undefined) return [];
  if (!Array.isArray(body.dailyLogs)) throw new InvalidProfileField('dailyLogs');

  return body.dailyLogs.map((raw) => {
    const log = raw as Record<string, unknown>;
    const date = String(log.date ?? '');
    if (!DATE_KEY_PATTERN.test(date)) throw new InvalidProfileField('dailyLogs.date');

    const foods = Array.isArray(log.foods) ? log.foods : [];
    if (
      foods.some(
        (f) =>
          typeof f !== 'object' ||
          f === null ||
          typeof (f as ClientFood).name !== 'string' ||
          !Number.isFinite(Number((f as ClientFood).calories))
      )
    ) {
      throw new InvalidProfileField('dailyLogs.foods');
    }

    const waterIntake = Number(log.waterIntake ?? 0);
    if (!Number.isFinite(waterIntake) || waterIntake < 0) throw new InvalidProfileField('dailyLogs.waterIntake');

    const sleepHours = log.sleepHours === undefined ? undefined : Number(log.sleepHours);
    if (sleepHours !== undefined && (!Number.isFinite(sleepHours) || sleepHours < 0 || sleepHours > 24)) {
      throw new InvalidProfileField('dailyLogs.sleepHours');
    }

    const activityMinutes = log.activityMinutes === undefined ? undefined : Number(log.activityMinutes);
    if (
      activityMinutes !== undefined &&
      (!Number.isFinite(activityMinutes) || activityMinutes < 0 || activityMinutes > 1440)
    ) {
      throw new InvalidProfileField('dailyLogs.activityMinutes');
    }

    const weight = log.weight === undefined ? undefined : Number(log.weight);
    if (weight !== undefined && (!Number.isFinite(weight) || weight < 20 || weight > 300)) {
      throw new InvalidProfileField('dailyLogs.weight');
    }

    const painIntensity = log.painIntensity === undefined ? undefined : Number(log.painIntensity);
    if (painIntensity !== undefined && (!Number.isFinite(painIntensity) || painIntensity < 0 || painIntensity > 10)) {
      throw new InvalidProfileField('dailyLogs.painIntensity');
    }

    let sleepQuality: 'poor' | 'fair' | 'good' | undefined;
    if (log.sleepQuality !== undefined && log.sleepQuality !== null) {
      const mapped = SLEEP_QUALITY_FROM_CLIENT[String(log.sleepQuality)];
      if (!mapped) throw new InvalidProfileField('dailyLogs.sleepQuality');
      sleepQuality = SLEEP_QUALITY_TO_CLIENT[mapped] as 'good' | 'fair' | 'poor';
    }

    return {
      date,
      foods: foods.map((f) => {
        const food = f as ClientFood;
        return {
          id: String(food.id ?? ''),
          name: food.name,
          calories: Number(food.calories) || 0,
          protein: Number(food.protein) || 0,
          carbs: Number(food.carbs) || 0,
          fat: Number(food.fat) || 0,
        };
      }),
      waterIntake: Math.round(waterIntake),
      sleepHours,
      sleepQuality,
      activityMinutes,
      weight,
      painIntensity,
    };
  });
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  if (TRUE_WORDS.has(value.trim().toLowerCase())) return true;
  if (FALSE_WORDS.has(value.trim().toLowerCase())) return false;
  return undefined;
}

function buildQuestionnaire(body: Record<string, unknown>): Prisma.QuestionnaireAnswerUncheckedCreateInput | null {
  if (body.questionnaireAnswers === undefined) return null;
  if (typeof body.questionnaireAnswers !== 'object' || body.questionnaireAnswers === null) {
    throw new InvalidProfileField('questionnaireAnswers');
  }

  const q = body.questionnaireAnswers as Record<string, unknown>;

  const aggravatedByActivity = toBoolean(q.aggravatedByActivity);
  const relievedByRest = toBoolean(q.relievedByRest);
  const injuryHistory = toBoolean(q.injuryHistory);
  const surgeryHistory = toBoolean(q.surgeryHistory);

  const sleepQuality = QUESTIONNAIRE_SLEEP_QUALITY[String(q.sleepQuality ?? '')];
  const stressLevel =
    Object.values(StressLevel).find((value) => STRESS_LEVEL_TO_CLIENT[value] === String(q.stressLevel ?? '')) ??
    (String(q.stressLevel ?? '').toLowerCase() === 'low'
      ? StressLevel.LOW
      : String(q.stressLevel ?? '').toLowerCase() === 'medium'
        ? StressLevel.MEDIUM
        : String(q.stressLevel ?? '').toLowerCase() === 'high'
          ? StressLevel.HIGH
          : undefined);

  // Every column of `QuestionnaireAnswer` is not nullable, so a partially
  // answered questionnaire cannot be stored at all. Skip it instead of
  // rejecting the request: throwing here used to fail the *whole* profile
  // save, so a user who left one yes/no question unanswered silently lost
  // every other change they made.
  if (
    aggravatedByActivity === undefined ||
    relievedByRest === undefined ||
    injuryHistory === undefined ||
    surgeryHistory === undefined ||
    !sleepQuality ||
    !stressLevel
  ) {
    return null;
  }

  const sittingHoursPerDay = Number(q.sittingHoursPerDay ?? 0);
  const exerciseDaysPerWeek = Number(q.exerciseDaysPerWeek ?? 0);

  if (
    !Number.isFinite(sittingHoursPerDay) ||
    sittingHoursPerDay < 0 ||
    sittingHoursPerDay > 24 ||
    !Number.isFinite(exerciseDaysPerWeek) ||
    exerciseDaysPerWeek < 0 ||
    exerciseDaysPerWeek > 7
  ) {
    return null;
  }

  return {
    userId: '', // filled in by the caller
    duration: String(q.duration ?? ''),
    aggravatedByActivity,
    relievedByRest,
    injuryHistory,
    surgeryHistory,
    sleepQuality,
    stressLevel,
    sittingHoursPerDay: Math.round(sittingHoursPerDay),
    exerciseDaysPerWeek: Math.round(exerciseDaysPerWeek),
  };
}

const USER_SELECT = {
  id: true,
  phoneNumber: true,
  fullName: true,
  age: true,
  gender: true,
  height: true,
  weight: true,
  activityLevel: true,
  jobTitle: true,
  underlyingDiseases: true,
  medications: true,
  termsAccepted: true,
  currentWizardStep: true,
  nutritionGoal: true,
  role: true,
  painRegions: true,
} satisfies Prisma.UserSelect;

type SelectedUser = Prisma.UserGetPayload<{ select: typeof USER_SELECT }>;

/** Convert a Prisma user row into the shape the client expects. */
function serializeUser(user: SelectedUser) {
  return {
    ...user,
    gender: user.gender ? GENDER_TO_CLIENT[user.gender] : null,
    activityLevel: user.activityLevel ? ACTIVITY_LEVEL_TO_CLIENT[user.activityLevel] : null,
    nutritionGoal: user.nutritionGoal ? NUTRITION_GOAL_TO_CLIENT[user.nutritionGoal] : null,
  };
}

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...USER_SELECT,
        questionnaire: true,
        dailyLogs: {
          orderBy: { date: 'asc' },
          include: { foods: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dailyLogs = (user.dailyLogs ?? []).map((log) => ({
      date: log.date.toISOString().slice(0, 10),
      foods: log.foods.map((food) => ({
        id: food.foodId ?? food.id,
        name: food.foodName ?? '',
        calories: food.calories ?? 0,
        protein: food.protein ?? 0,
        carbs: food.carbs ?? 0,
        fat: food.fat ?? 0,
      })),
      waterIntake: log.waterIntake,
      sleepHours: log.sleepHours ?? undefined,
      sleepQuality: log.sleepQuality ? (SLEEP_QUALITY_TO_CLIENT[log.sleepQuality] as 'good' | 'fair' | 'poor') : undefined,
      activityMinutes: log.activityMinutes ?? undefined,
      weight: log.weight ?? undefined,
      painIntensity: log.painIntensity ?? undefined,
    }));

    const questionnaire = user.questionnaire
      ? {
          duration: user.questionnaire.duration,
          aggravatedByActivity: booleanToClient(user.questionnaire.aggravatedByActivity),
          relievedByRest: booleanToClient(user.questionnaire.relievedByRest),
          injuryHistory: booleanToClient(user.questionnaire.injuryHistory),
          surgeryHistory: booleanToClient(user.questionnaire.surgeryHistory),
          sleepQuality: QUESTIONNAIRE_SLEEP_QUALITY_TO_CLIENT[user.questionnaire.sleepQuality],
          stressLevel: STRESS_LEVEL_TO_CLIENT[user.questionnaire.stressLevel],
          sittingHoursPerDay: user.questionnaire.sittingHoursPerDay,
          exerciseDaysPerWeek: user.questionnaire.exerciseDaysPerWeek,
        }
      : null;

    // The health score weights are global and set by an admin. They travel
    // with the profile so the score the client renders uses exactly the
    // weights the server would use.
    const healthWeights = await getHealthScoreWeights();
    // The same goes for the nutrition targets: the calculation used to be
    // written out twice on the client, and an admin could not change it.
    const nutritionConfig = await getNutritionConfig();

    return NextResponse.json({
      ...serializeUser(user),
      painZones: Array.isArray(user.painRegions) ? user.painRegions : [],
      dailyLogs,
      questionnaireAnswers: questionnaire,
      healthWeights,
      nutritionConfig,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    let data: ProfileFields;
    let dailyLogs: ClientDailyLog[];
    let questionnaire: Prisma.QuestionnaireAnswerUncheckedCreateInput | null;
    let painRegions: unknown;

    try {
      data = buildProfileUpdate(body);
      dailyLogs = buildDailyLogs(body);
      questionnaire = buildQuestionnaire(body);

      if (body.painZones !== undefined) {
        if (!Array.isArray(body.painZones)) throw new InvalidProfileField('painZones');
        painRegions = body.painZones;
      }
    } catch (error) {
      if (error instanceof InvalidProfileField) {
        return NextResponse.json(
          { error: `Invalid value for field: ${error.message}` },
          { status: 400 }
        );
      }
      throw error;
    }

    const hasScalars = Object.keys(data).length > 0;
    const hasAnything =
      hasScalars || dailyLogs.length > 0 || questionnaire !== null || painRegions !== undefined;

    // Nothing to write is a valid no-op: the client syncs its whole profile
    // on every change, and a brand new user may have nothing but a phone
    // number (which the server already knows).
    if (!hasAnything) {
      const existing = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, phoneNumber: true },
      });
      return NextResponse.json(existing ?? { id: userId });
    }

    // `upsert` on id: the session guarantees the row already exists, but upsert
    // keeps this endpoint working for a user created before the profile fields
    // were migrated in.
    const update: Prisma.UserUncheckedUpdateInput = { ...data };
    const create: Prisma.UserUncheckedCreateInput = { id: userId, ...data };

    if (painRegions !== undefined) {
      update.painRegions = painRegions as Prisma.InputJsonValue;
      create.painRegions = painRegions as Prisma.InputJsonValue;
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({ where: { id: userId }, update, create });

      for (const log of dailyLogs) {
        const date = new Date(`${log.date}T00:00:00.000Z`);

        const dailyLog = await tx.dailyLog.upsert({
          where: { userId_date: { userId, date } },
          update: {
            waterIntake: log.waterIntake,
            sleepHours: log.sleepHours ?? null,
            sleepQuality: log.sleepQuality ? (log.sleepQuality.toUpperCase() as SleepQuality) : null,
            activityMinutes: log.activityMinutes ?? 0,
            weight: log.weight ?? null,
            painIntensity: log.painIntensity ?? null,
          },
          create: {
            userId,
            date,
            waterIntake: log.waterIntake,
            sleepHours: log.sleepHours ?? null,
            sleepQuality: log.sleepQuality ? (log.sleepQuality.toUpperCase() as SleepQuality) : null,
            activityMinutes: log.activityMinutes ?? 0,
            weight: log.weight ?? null,
            painIntensity: log.painIntensity ?? null,
          },
        });

        // Replace the day's food entries with the client's current list.
        await tx.foodLog.deleteMany({ where: { dailyLogId: dailyLog.id } });

        if (log.foods.length > 0) {
          const knownFoodIds = log.foods.map((food) => food.id).filter(Boolean);
          const known = knownFoodIds.length
            ? await tx.food.findMany({ where: { id: { in: knownFoodIds } }, select: { id: true } })
            : [];
          const knownIds = new Set(known.map((food) => food.id));

          await tx.foodLog.createMany({
            data: log.foods.map((food) => ({
              dailyLogId: dailyLog.id,
              foodId: knownIds.has(food.id) ? food.id : null,
              foodName: food.name,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
            })),
          });
        }
      }

      if (questionnaire) {
        await tx.questionnaireAnswer.upsert({
          where: { userId },
          update: {
            duration: questionnaire.duration,
            aggravatedByActivity: questionnaire.aggravatedByActivity,
            relievedByRest: questionnaire.relievedByRest,
            injuryHistory: questionnaire.injuryHistory,
            surgeryHistory: questionnaire.surgeryHistory,
            sleepQuality: questionnaire.sleepQuality,
            stressLevel: questionnaire.stressLevel,
            sittingHoursPerDay: questionnaire.sittingHoursPerDay,
            exerciseDaysPerWeek: questionnaire.exerciseDaysPerWeek,
          },
          create: { ...questionnaire, userId },
        });
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phoneNumber: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
