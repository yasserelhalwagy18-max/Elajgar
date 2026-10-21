import { describe, it, expect } from 'vitest';
import { assessUserRisk } from './user-risk';

describe('assessUserRisk', () => {
  it('reports "unknown" for a user who reported nothing', () => {
    const risk = assessUserRisk({ painRegions: null, questionnaire: null });

    expect(risk.level).toBe('unknown');
    expect(risk.painZones).toBe(0);
  });

  it('treats an empty region list as unknown, not as low risk', () => {
    const risk = assessUserRisk({ painRegions: [], questionnaire: null });

    expect(risk.level).toBe('unknown');
  });

  it('reports low risk for a mild complaint', () => {
    const risk = assessUserRisk({
      painRegions: [{ zone: 'neck_front', intensity: 3, type: 'مبهم' }],
      questionnaire: null,
    });

    expect(risk.level).toBe('low');
    expect(risk.maxIntensity).toBe(3);
    expect(risk.painZones).toBe(1);
  });

  it('reports medium risk for a moderate intensity', () => {
    const risk = assessUserRisk({
      painRegions: [{ zone: 'knee_r_front', intensity: 5, type: 'مبهم' }],
      questionnaire: null,
    });

    expect(risk.level).toBe('medium');
  });

  it('reports medium risk for several mild regions', () => {
    const risk = assessUserRisk({
      painRegions: [
        { zone: 'neck_front', intensity: 2, type: 'مبهم' },
        { zone: 'lower_back', intensity: 2, type: 'مبهم' },
        { zone: 'knee_l_front', intensity: 2, type: 'مبهم' },
      ],
      questionnaire: null,
    });

    expect(risk.level).toBe('medium');
    expect(risk.painZones).toBe(3);
  });

  it('reports high risk for a severe complaint', () => {
    const risk = assessUserRisk({
      painRegions: [{ zone: 'lower_back', intensity: 8, type: 'تیر کشنده' }],
      questionnaire: null,
    });

    expect(risk.level).toBe('high');
    expect(risk.maxIntensity).toBe(8);
  });

  it('reports high risk for a high stress level even with mild pain', () => {
    const risk = assessUserRisk({
      painRegions: [{ zone: 'neck_front', intensity: 2, type: 'مبهم' }],
      questionnaire: { stressLevel: 'HIGH' },
    });

    expect(risk.level).toBe('high');
  });

  it('ignores regions it does not recognise rather than counting them', () => {
    const risk = assessUserRisk({
      painRegions: [{ zone: 'somewhere-unknown', intensity: 9, type: 'مبهم' }],
      questionnaire: null,
    });

    expect(risk.level).toBe('unknown');
  });
});
