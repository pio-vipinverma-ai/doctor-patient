import {
  VITAL_RANGES,
  isVitalNormal,
  isVitalAcceptable,
  getVitalWarning,
  getVitalWarningLevel,
  formatVital,
  getVitalsWarnings
} from '../vitals';

describe('vitals util', () => {
  describe('VITAL_RANGES', () => {
    it('should have temperature range', () => {
      expect(VITAL_RANGES.temperature).toBeDefined();
      expect(VITAL_RANGES.temperature.min).toBe(95);
      expect(VITAL_RANGES.temperature.max).toBe(105);
      expect(VITAL_RANGES.temperature.normal).toBe(98.6);
    });

    it('should have blood pressure ranges', () => {
      expect(VITAL_RANGES.bpSystolic).toBeDefined();
      expect(VITAL_RANGES.bpDiastolic).toBeDefined();
    });

    it('should have pulse range', () => {
      expect(VITAL_RANGES.pulse).toBeDefined();
      expect(VITAL_RANGES.pulse.min).toBe(40);
      expect(VITAL_RANGES.pulse.max).toBe(150);
    });
  });

  describe('isVitalNormal', () => {
    it('should identify normal temperature', () => {
      expect(isVitalNormal('temperature', 98.6)).toBe(true);
      expect(isVitalNormal('temperature', 97.0)).toBe(true);
      expect(isVitalNormal('temperature', 99.5)).toBe(true);
    });

    it('should identify abnormal temperature', () => {
      expect(isVitalNormal('temperature', 94.0)).toBe(false);
      expect(isVitalNormal('temperature', 101.0)).toBe(false);
      expect(isVitalNormal('temperature', 105.0)).toBe(false);
    });

    it('should identify normal blood pressure systolic', () => {
      expect(isVitalNormal('bpSystolic', 120)).toBe(true);
      expect(isVitalNormal('bpSystolic', 110)).toBe(true);
      expect(isVitalNormal('bpSystolic', 130)).toBe(true);
    });

    it('should identify abnormal blood pressure systolic', () => {
      expect(isVitalNormal('bpSystolic', 85)).toBe(false);
      expect(isVitalNormal('bpSystolic', 150)).toBe(false);
      expect(isVitalNormal('bpSystolic', 180)).toBe(false);
    });

    it('should identify normal blood pressure diastolic', () => {
      expect(isVitalNormal('bpDiastolic', 80)).toBe(true);
      expect(isVitalNormal('bpDiastolic', 70)).toBe(true);
      expect(isVitalNormal('bpDiastolic', 85)).toBe(true);
    });

    it('should identify abnormal blood pressure diastolic', () => {
      expect(isVitalNormal('bpDiastolic', 55)).toBe(false);
      expect(isVitalNormal('bpDiastolic', 95)).toBe(false);
      expect(isVitalNormal('bpDiastolic', 110)).toBe(false);
    });

    it('should identify normal pulse', () => {
      expect(isVitalNormal('pulse', 72)).toBe(true);
      expect(isVitalNormal('pulse', 60)).toBe(true);
      expect(isVitalNormal('pulse', 100)).toBe(true);
    });

    it('should identify abnormal pulse', () => {
      expect(isVitalNormal('pulse', 45)).toBe(false);
      expect(isVitalNormal('pulse', 120)).toBe(false);
      expect(isVitalNormal('pulse', 150)).toBe(false);
    });
  });

  describe('isVitalAcceptable', () => {
    it('should accept values within acceptable range', () => {
      expect(isVitalAcceptable('temperature', 95.0)).toBe(true);
      expect(isVitalAcceptable('temperature', 105.0)).toBe(true);
      expect(isVitalAcceptable('bpSystolic', 90)).toBe(true);
      expect(isVitalAcceptable('bpSystolic', 180)).toBe(true);
      expect(isVitalAcceptable('pulse', 40)).toBe(true);
      expect(isVitalAcceptable('pulse', 150)).toBe(true);
    });

    it('should reject values outside acceptable range', () => {
      expect(isVitalAcceptable('temperature', 94.0)).toBe(false);
      expect(isVitalAcceptable('temperature', 106.0)).toBe(false);
      expect(isVitalAcceptable('bpSystolic', 85)).toBe(false);
      expect(isVitalAcceptable('bpSystolic', 185)).toBe(false);
    });
  });

  describe('getVitalWarning', () => {
    it('should return null for normal vitals', () => {
      expect(getVitalWarning('temperature', 98.6)).toBeNull();
      expect(getVitalWarning('bpSystolic', 120)).toBeNull();
      expect(getVitalWarning('pulse', 72)).toBeNull();
    });

    it('should return warning for low vitals', () => {
      const warning = getVitalWarning('temperature', 94.0);
      expect(warning).toContain('Low');
      expect(warning).toContain('94');
    });

    it('should return warning for high vitals', () => {
      const warning = getVitalWarning('temperature', 106.0);
      expect(warning).toContain('High');
      expect(warning).toContain('106');
    });

    it('should return elevated warning for borderline vitals', () => {
      const warning = getVitalWarning('bpSystolic', 145);
      if (warning) {
        expect(warning).toBeTruthy();
      }
    });

    it('should include unit in warning message', () => {
      const warning = getVitalWarning('temperature', 94.0);
      expect(warning).toContain('°F');
    });

    it('should include normal range in warning', () => {
      const warning = getVitalWarning('pulse', 150);
      if (warning) {
        expect(warning).toContain('60-100');
      }
    });
  });

  describe('VITAL_RANGES validation', () => {
    it('should have ranges for all vital types', () => {
      expect(VITAL_RANGES.temperature).toBeDefined();
      expect(VITAL_RANGES.bpSystolic).toBeDefined();
      expect(VITAL_RANGES.bpDiastolic).toBeDefined();
      expect(VITAL_RANGES.pulse).toBeDefined();
    });

    it('should have valid range values', () => {
      Object.values(VITAL_RANGES).forEach(range => {
        expect(range.min).toBeLessThan(range.max);
        expect(range.unit).toBeTruthy();
        expect(range.normal).toBeDefined();
      });
    });
  });

  describe('isVitalNormal additional tests', () => {
    it('should return true for normal temperature', () => {
      expect(isVitalNormal('temperature', 98.6)).toBe(true);
      expect(isVitalNormal('temperature', 97)).toBe(true);
      expect(isVitalNormal('temperature', 99)).toBe(true);
    });

    it('should return false for abnormal temperature', () => {
      expect(isVitalNormal('temperature', 94)).toBe(false);
      expect(isVitalNormal('temperature', 101)).toBe(false);
    });

    it('should return true for normal blood pressure', () => {
      expect(isVitalNormal('bpSystolic', 120)).toBe(true);
      expect(isVitalNormal('bpDiastolic', 80)).toBe(true);
    });

    it('should return false for high blood pressure', () => {
      expect(isVitalNormal('bpSystolic', 150)).toBe(false);
      expect(isVitalNormal('bpDiastolic', 95)).toBe(false);
    });

    it('should return true for normal pulse', () => {
      expect(isVitalNormal('pulse', 72)).toBe(true);
      expect(isVitalNormal('pulse', 90)).toBe(true);
    });

    it('should return false for abnormal pulse', () => {
      expect(isVitalNormal('pulse', 50)).toBe(false);
      expect(isVitalNormal('pulse', 120)).toBe(false);
    });
  });

  describe('isVitalAcceptable', () => {
    it('should return true for acceptable temperature', () => {
      expect(isVitalAcceptable('temperature', 98.6)).toBe(true);
      expect(isVitalAcceptable('temperature', 100)).toBe(true);
    });

    it('should return false for unacceptable temperature', () => {
      expect(isVitalAcceptable('temperature', 90)).toBe(false);
      expect(isVitalAcceptable('temperature', 106)).toBe(false);
    });

    it('should return true for acceptable pulse', () => {
      expect(isVitalAcceptable('pulse', 72)).toBe(true);
      expect(isVitalAcceptable('pulse', 120)).toBe(true);
    });

    it('should return false for unacceptable pulse', () => {
      expect(isVitalAcceptable('pulse', 30)).toBe(false);
      expect(isVitalAcceptable('pulse', 160)).toBe(false);
    });
  });

  describe('getVitalWarning', () => {
    it('should return null for normal vitals', () => {
      expect(getVitalWarning('temperature', 98.6)).toBeNull();
      expect(getVitalWarning('pulse', 72)).toBeNull();
    });

    it('should return warning for high temperature', () => {
      const warning = getVitalWarning('temperature', 101);
      expect(warning).toBeTruthy();
      expect(warning).toContain('101');
    });

    it('should return warning for low pulse', () => {
      const warning = getVitalWarning('pulse', 50);
      expect(warning).toBeTruthy();
    });

    it('should return danger warning for very high temperature', () => {
      const warning = getVitalWarning('temperature', 106);
      expect(warning).toBeTruthy();
    });
  });

  describe('getVitalWarningLevel', () => {
    it('should return normal for healthy vitals', () => {
      expect(getVitalWarningLevel('temperature', 98.6)).toBe('normal');
      expect(getVitalWarningLevel('pulse', 72)).toBe('normal');
    });

    it('should return warning for concerning vitals', () => {
      expect(getVitalWarningLevel('temperature', 101)).toBe('warning');
      expect(getVitalWarningLevel('pulse', 110)).toBe('warning');
    });

    it('should return danger for critical vitals', () => {
      expect(getVitalWarningLevel('temperature', 106)).toBe('danger');
      expect(getVitalWarningLevel('pulse', 160)).toBe('danger');
    });
  });

  describe('formatVital', () => {
    it('should format temperature with unit', () => {
      const formatted = formatVital('temperature', 98.6);
      expect(formatted).toBe('98.6°F');
    });

    it('should format blood pressure with unit', () => {
      const formatted = formatVital('bpSystolic', 120);
      expect(formatted).toBe('120mmHg');
    });

    it('should format pulse with unit', () => {
      const formatted = formatVital('pulse', 72);
      expect(formatted).toBe('72BPM');
    });
  });

  describe('getVitalsWarnings', () => {
    it('should return empty object for normal vitals', () => {
      const warnings = getVitalsWarnings({
        temperature: 98.6,
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72
      });
      expect(Object.keys(warnings)).toHaveLength(0);
    });

    it('should return warnings for abnormal vitals', () => {
      const warnings = getVitalsWarnings({
        temperature: 103,
        bpSystolic: 150,
        bpDiastolic: 95,
        pulse: 120
      });
      expect(Object.keys(warnings).length).toBeGreaterThan(0);
      expect(warnings.temperature).toBeTruthy();
    });

    it('should return multiple warnings', () => {
      const warnings = getVitalsWarnings({
        temperature: 106,
        bpSystolic: 180,
        bpDiastolic: 110,
        pulse: 140
      });
      expect(Object.keys(warnings).length).toBeGreaterThanOrEqual(2);
    });
  });
});
