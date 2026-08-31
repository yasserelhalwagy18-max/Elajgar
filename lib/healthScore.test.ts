import { describe, it, expect } from 'vitest';
import { calculateHealthScore, buildHealthDataFromLogs } from './healthScore';

describe('healthScore', () => {
  describe('calculateHealthScore', () => {
    it('returns a high score for optimal inputs', () => {
      const data = {
        weight: 70,
        bmi: 22,
        pain: 0,
        activity: 45,
        calories: 2000,
        water: 2.5,
        sleepHours: 8,
        sleepQuality: 'good' as const,
      };
      const score = calculateHealthScore(data);
      expect(score).toBeGreaterThan(90);
    });

    it('handles edge case inputs like zeros', () => {
      const data = {
        weight: 0,
        bmi: 0,
        pain: 10,
        activity: 0,
        calories: 0,
        water: 0,
        sleepHours: 0,
        sleepQuality: 'poor' as const,
      };
      const score = calculateHealthScore(data);
      // BMI: 5, Activity: 5, Sleep: 0, Water: 0, Calories: 0, Pain: 0 => 10
      expect(score).toBe(10);
    });

    it('calculates boundary values correctly', () => {
      const data = {
        weight: 85,
        bmi: 25.0, // boundary for BMI 15pts
        pain: 5, // 15 - 7.5 = 7.5
        activity: 29, // boundary for Activity 10pts
        calories: 1499, // boundary for Calories 5pts
        water: 1.4, // boundary for Water 5pts
        sleepHours: 6.5, // boundary for Sleep 2pts
        sleepQuality: 'fair' as const, // Sleep 5pts
      };
      const score = calculateHealthScore(data);
      // BMI(15) + Activity(10) + Sleep(7) + Water(5) + Calories(5) + Pain(7.5) = 49.5 -> rounded to 50
      expect(score).toBe(50);
    });
  });

  describe('buildHealthDataFromLogs', () => {
    it('returns empty array if userProfile is null', () => {
      const result = buildHealthDataFromLogs(null, 7);
      expect(result.data).toEqual([]);
      expect(result.hasEnoughData).toBe(false);
    });

    it('returns false for hasEnoughData if logs are less than 3', () => {
      const userProfile = {
        weight: 70,
        height: 175,
        painZones: [],
        dailyLogs: [
          {
            date: new Date().toISOString().split('T')[0],
            waterIntake: 2000,
            activityMinutes: 30,
            sleepHours: 7,
            sleepQuality: 'good' as const,
            foods: [{ calories: 500 }],
          },
        ],
      };
      const result = buildHealthDataFromLogs(userProfile, 7);
      expect(result.data.length).toBe(7);
      expect(result.hasEnoughData).toBe(false);
    });

    it('returns true for hasEnoughData if logs are 3 or more', () => {
      const today = new Date();
      const getFormattedDate = (daysAgo: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const userProfile = {
        weight: 70,
        height: 175,
        painZones: [{ id: '1', name: 'Back', intensity: 5 }],
        dailyLogs: [
          {
            date: getFormattedDate(0),
            waterIntake: 2000,
            activityMinutes: 30,
            sleepHours: 7,
            sleepQuality: 'good' as const,
            foods: [{ calories: 500 }],
          },
          {
            date: getFormattedDate(1),
            waterIntake: 1500,
            activityMinutes: 45,
            sleepHours: 8,
            sleepQuality: 'good' as const,
            foods: [{ calories: 600 }],
          },
          {
            date: getFormattedDate(2),
            waterIntake: 2500,
            activityMinutes: 20,
            sleepHours: 6,
            sleepQuality: 'fair' as const,
            foods: [{ calories: 400 }],
          },
        ],
      };
      const result = buildHealthDataFromLogs(userProfile, 7);
      expect(result.data.length).toBe(7);
      expect(result.hasEnoughData).toBe(true);
      // Pain logic check: intensity 5 -> pain 5
      expect(result.data[0].pain).toBe(5);
    });
  });
});
