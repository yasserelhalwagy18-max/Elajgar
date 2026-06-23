export type PainIntensity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type PainType = 'stabbing' | 'burning' | 'vague' | 'cramp' | 'inflammation';
export type BodySection = 'neck' | 'shoulder' | 'elbow' | 'wrist' | 'back' | 'pelvis' | 'knee' | 'calf' | 'ankle' | 'chest' | 'abdomen';

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
  nutritionGoal?: 'کاهش وزن' | 'افزایش وزن' | 'حفظ وزن';
  dailyLogs?: {
    date: string; // YYYY-MM-DD
    foods: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }[];
    waterIntake: number; // in ml
  }[];
}

export interface PainAssessment {
  userId: string;
  selectedZones: {
    zone: BodySection;
    intensity: PainIntensity;
    type: PainType;
  }[];
  questionnaireAnswers: {
    duration: string;
    aggravatedByActivity: boolean;
    relievedByRest: boolean;
    injuryHistory: boolean;
    surgeryHistory: boolean;
    sleepQuality: 'poor' | 'fair' | 'good';
    stressLevel: 'low' | 'medium' | 'high';
    sittingHoursPerDay: number;
    exerciseDaysPerWeek: number;
  };
  generatedAnalysisId: string;
}

export interface VideoContent {
  id: string;
  title: string;
  url: string;
  isPremium: boolean;
  associatedPainTags: BodySection[]; // Dynamic relation array
  durationInMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface HealthScoreWeights {
  weightWeight: number;      // default: 0.30
  exerciseWeight: number;    // default: 0.30
  painReductionWeight: number;// default: 0.25
  waterIntakeWeight: number;  // default: 0.15
}

export interface GymPartner {
  id: string;
  name: string;
  location: string;
  category: 'yoga' | 'pool' | 'crossfit' | 'martial_arts' | 'general';
  rating: number;
  isPremium: boolean;
  discountPercentage: number;
  amenities: string[];
  imageUrl: string;
}
