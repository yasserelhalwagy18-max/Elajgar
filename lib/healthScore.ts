import { UserProfile } from "../types";

export interface DailyHealthData {
  date: string; // Persian date string for display
  weight: number;
  bmi: number;
  pain: number; // 0-10
  activity: number; // minutes
  calories: number;
  water: number; // liters
  sleepHours: number;
  sleepQuality: 'poor' | 'fair' | 'good';
  healthScore?: number;
}
// Health Score Calculation
export function calculateHealthScore(data: Omit<DailyHealthData, 'healthScore' | 'date'>): number {
  let score = 0;

  // 1. BMI Score (Max 20 points)
  // Optimal: 18.5 - 24.9
  let bmiScore = 0;
  if (data.bmi >= 18.5 && data.bmi <= 24.9) {
    bmiScore = 20;
  } else if ((data.bmi >= 17 && data.bmi < 18.5) || (data.bmi > 24.9 && data.bmi <= 29.9)) {
    bmiScore = 15;
  } else if (data.bmi >= 16 && data.bmi < 17 || (data.bmi > 29.9 && data.bmi <= 34.9)) {
    bmiScore = 10;
  } else {
    bmiScore = 5;
  }
  score += bmiScore;

  // 2. Activity Score (Max 20 points)
  // Optimal: 45+ mins
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
  score += activityScore;

  // 3. Sleep Score (Max 15 points)
  let sleepScore = 0;
  if (data.sleepQuality === 'good') {
    sleepScore += 10;
  } else if (data.sleepQuality === 'fair') {
    sleepScore += 5;
  } else {
    sleepScore += 0;
  }
  if (data.sleepHours >= 7 && data.sleepHours <= 9) {
    sleepScore += 5;
  } else if (data.sleepHours >= 6 || data.sleepHours === 10) {
    sleepScore += 2;
  }
  // Cap at 15
  score += Math.min(sleepScore, 15);

  // 4. Water Score (Max 15 points)
  // Optimal: >= 2.0 L
  let waterScore = 0;
  if (data.water >= 2.0) {
    waterScore = 15;
  } else if (data.water >= 1.5) {
    waterScore = 10;
  } else if (data.water >= 1.0) {
    waterScore = 5;
  } else {
    waterScore = 0;
  }
  score += waterScore;

  // 5. Calories Score (Max 15 points)
  // Optimal: close to 2000 (1800 - 2200)
  let caloriesScore = 0;
  if (data.calories >= 1800 && data.calories <= 2200) {
    caloriesScore = 15;
  } else if (data.calories >= 1500 && data.calories <= 2500) {
    caloriesScore = 10;
  } else if (data.calories >= 1200 && data.calories <= 3000) {
    caloriesScore = 5;
  } else {
    caloriesScore = 0;
  }
  score += caloriesScore;

  // 6. Pain Score (Max 15 points)
  // Inverse relation: 0 pain = 15 pts, 10 pain = 0 pts
  let painScore = Math.max(0, 15 - (data.pain * 1.5));
  score += painScore;

  return Math.round(score);
}

// Simple seeded random to fix hydration mismatch
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate Mock Data
function generateMockData(days: number): DailyHealthData[] {
  const result: DailyHealthData[] = [];

  // Use a fixed date to avoid hydration mismatches
  const today = new Date('2024-06-23T12:00:00Z');

  let currentWeight = 76;
  let currentPain = 6;
  let seed = 12345;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    // Hardcode Persian months for consistent output
    const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    // Very simplified fixed mapping for demonstration
    // Just using a static string pattern to avoid timezone/locale inconsistencies between server and client
    const dateStr = `${Math.max(1, (d.getDate() % 30))} تیر`;

    // Simulate slight improvements over time
    currentWeight -= seededRandom(seed++) * 0.1;
    currentPain = Math.max(1, currentPain - seededRandom(seed++) * 0.3);

    const height = 1.75; // 175cm
    const bmi = currentWeight / (height * height);

    const activity = Math.floor(seededRandom(seed++) * 40) + 20; // 20-60 mins
    const calories = Math.floor(seededRandom(seed++) * 800) + 1400; // 1400-2200
    const water = Math.round((seededRandom(seed++) * 1.5 + 1.0) * 10) / 10; // 1.0 - 2.5 L
    const sleepHours = Math.round((seededRandom(seed++) * 3 + 5) * 10) / 10; // 5 - 8

    const sleepQualityRnd = seededRandom(seed++);
    const sleepQuality = sleepQualityRnd > 0.6 ? 'good' : sleepQualityRnd > 0.2 ? 'fair' : 'poor';

    const dataPoint: DailyHealthData = {
      date: dateStr,
      weight: parseFloat(currentWeight.toFixed(1)),
      bmi: parseFloat(bmi.toFixed(1)),
      pain: Math.round(currentPain),
      activity,
      calories,
      water,
      sleepHours,
      sleepQuality,
    };

    dataPoint.healthScore = calculateHealthScore(dataPoint);
    result.push(dataPoint);
  }

  return result;
}

export const mockData7Days = generateMockData(7);
export const mockData30Days = generateMockData(30);

export function buildHealthDataFromLogs(userProfile: Partial<UserProfile> | null, days: number): { data: DailyHealthData[], hasEnoughData: boolean } {
  if (!userProfile) return { data: [], hasEnoughData: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let weight = userProfile.weight || 0;
  let heightMeters = (userProfile.height || 170) / 100;
  let bmi = weight > 0 ? Number((weight / (heightMeters * heightMeters)).toFixed(1)) : 0;

  let pain = 0;
  if (userProfile.painZones && userProfile.painZones.length > 0) {
    const totalPain = userProfile.painZones.reduce((sum, zone) => sum + zone.intensity, 0);
    pain = Math.round(totalPain / userProfile.painZones.length);
  }

  const generatedData: DailyHealthData[] = [];
  let validEntriesCount = 0;

  const formatter = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'short' });

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dateLabel = formatter.format(d);

    const log = userProfile.dailyLogs?.find((l: any) => l.date === dateStr);

    if (log) {
      validEntriesCount++;
    }

    const calories = log?.foods ? log.foods.reduce((sum: number, food: any) => sum + food.calories, 0) : 0;
    const water = log?.waterIntake ? Number((log.waterIntake / 1000).toFixed(1)) : 0;
    const activity = log?.activityMinutes || 0;
    const sleepHours = log?.sleepHours || 0;
    const sleepQuality = log?.sleepQuality || 'poor';

    const dataPoint: DailyHealthData = {
      date: dateLabel,
      weight,
      bmi,
      pain,
      activity,
      calories,
      water,
      sleepHours,
      sleepQuality
    };

    dataPoint.healthScore = calculateHealthScore(dataPoint);
    generatedData.push(dataPoint);
  }

  return { data: generatedData, hasEnoughData: validEntriesCount >= 3 };
}
