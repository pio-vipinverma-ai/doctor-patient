import { COMMON_MEDICATIONS, FREQUENCY_OPTIONS } from '../medications';

describe('medications util', () => {
  describe('COMMON_MEDICATIONS', () => {
    it('should contain common pain medications', () => {
      expect(COMMON_MEDICATIONS).toContain('Paracetamol');
      expect(COMMON_MEDICATIONS).toContain('Ibuprofen');
      expect(COMMON_MEDICATIONS).toContain('Aspirin');
    });

    it('should contain antibiotics', () => {
      expect(COMMON_MEDICATIONS).toContain('Amoxicillin');
      expect(COMMON_MEDICATIONS).toContain('Azithromycin');
      expect(COMMON_MEDICATIONS).toContain('Ciprofloxacin');
    });

    it('should contain cold and cough medicines', () => {
      expect(COMMON_MEDICATIONS).toContain('Cough Syrup');
      expect(COMMON_MEDICATIONS).toContain('Cetirizine');
    });

    it('should contain stomach medicines', () => {
      expect(COMMON_MEDICATIONS).toContain('Omeprazole');
      expect(COMMON_MEDICATIONS).toContain('Pantoprazole');
    });

    it('should contain diabetes medications', () => {
      expect(COMMON_MEDICATIONS).toContain('Metformin');
      expect(COMMON_MEDICATIONS).toContain('Insulin');
    });

    it('should contain blood pressure medications', () => {
      expect(COMMON_MEDICATIONS).toContain('Amlodipine');
      expect(COMMON_MEDICATIONS).toContain('Losartan');
    });

    it('should contain vitamins and supplements', () => {
      expect(COMMON_MEDICATIONS).toContain('Multivitamin');
      expect(COMMON_MEDICATIONS).toContain('Vitamin D');
      expect(COMMON_MEDICATIONS).toContain('Calcium');
    });

    it('should be sorted alphabetically', () => {
      const sorted = [...COMMON_MEDICATIONS].sort();
      expect(COMMON_MEDICATIONS).toEqual(sorted);
    });

    it('should have no duplicates', () => {
      const unique = [...new Set(COMMON_MEDICATIONS)];
      expect(COMMON_MEDICATIONS).toHaveLength(unique.length);
    });
  });

  describe('FREQUENCY_OPTIONS', () => {
    it('should contain standard frequency options', () => {
      expect(FREQUENCY_OPTIONS).toContain('Once daily');
      expect(FREQUENCY_OPTIONS).toContain('Twice daily');
      expect(FREQUENCY_OPTIONS).toContain('Thrice daily');
    });

    it('should contain hourly intervals', () => {
      expect(FREQUENCY_OPTIONS).toContain('Every 4 hours');
      expect(FREQUENCY_OPTIONS).toContain('Every 6 hours');
      expect(FREQUENCY_OPTIONS).toContain('Every 8 hours');
    });

    it('should contain meal-related options', () => {
      expect(FREQUENCY_OPTIONS).toContain('Before meals');
      expect(FREQUENCY_OPTIONS).toContain('After meals');
    });

    it('should contain conditional option', () => {
      expect(FREQUENCY_OPTIONS).toContain('As needed');
    });

    it('should have at least 10 options', () => {
      expect(FREQUENCY_OPTIONS.length).toBeGreaterThanOrEqual(10);
    });
  });
});
