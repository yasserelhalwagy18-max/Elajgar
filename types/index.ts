import type { HealthScoreWeights } from '@/lib/healthScore';
import type { NutritionConfig } from '@/lib/nutrition-targets';

export interface UserProfile {
  id?: string;
  phoneNumber?: string;
  fullName?: string;
  age?: number;
  gender?: 'male' | 'female';
  height?: number; // in cm
  weight?: number; // in kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active';
  jobTitle?: string;
  underlyingDiseases?: string[];
  medications?: string[];
  termsAccepted?: boolean;
  /** The account role. Only admins can open the admin panel. */
  role?: 'USER' | 'ADMIN';
  /**
   * The global weights of the health score, as set by an admin.
   *
   * The server sends these with the profile so the score the client shows
   * uses the same weights the server would.
   */
  healthWeights?: HealthScoreWeights;
  /**
   * The global nutrition configuration, as set by an admin.
   *
   * The daily calorie, macro and water targets are calculated from it, so
   * the nutrition screen and the dashboard agree with each other.
   */
  nutritionConfig?: NutritionConfig;
  /** A body region the user reported pain in. */
  painZones?: { zone: string; intensity: number; type: string }[];
  questionnaireAnswers?: {
    duration: string;
    aggravatedByActivity: string; // Persian boolean equivalents, e.g. "بله", "خیر"
    relievedByRest: string;
    injuryHistory: string;
    surgeryHistory: string;
    sleepQuality: string; // e.g. "بد", "متوسط", "خوب"
    stressLevel: string; // e.g. "کم", "متوسط", "زیاد"
    sittingHoursPerDay: number;
    exerciseDaysPerWeek: number;
  };
  currentWizardStep?: number; // For step-by-step Auto-save persistence
  nutritionGoal?: 'کاهش وزن' | 'افزایش وزن' | 'حفظ وزن' | 'سلامت عمومی';
  dailyLogs?: {
    date: string; // YYYY-MM-DD (local calendar day)
    foods: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }[];
    waterIntake: number; // in ml
    sleepHours?: number;
    sleepQuality?: 'poor' | 'fair' | 'good';
    activityMinutes?: number;
    /** Weight recorded for this specific day, in kg. */
    weight?: number;
    /** Average pain intensity for this specific day, 0-10. */
    painIntensity?: number;
  }[];
}
