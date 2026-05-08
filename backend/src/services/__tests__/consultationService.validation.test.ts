import { validateConsultationInput, validateVitals } from '../consultationService';

describe('ConsultationService - Validation', () => {
  describe('validateVitals', () => {
    it('should return warnings for low temperature', () => {
      const warnings = validateVitals(94, 120, 80, 72);
      expect(warnings.temperature).toContain('Low');
    });

    it('should return warnings for high temperature', () => {
      const warnings = validateVitals(106, 120, 80, 72);
      expect(warnings.temperature).toContain('High');
    });

    it('should return warnings for elevated temperature', () => {
      const warnings = validateVitals(101, 120, 80, 72);
      expect(warnings.temperature).toContain('Elevated');
    });

    it('should return no warnings for normal temperature', () => {
      const warnings = validateVitals(98.6, 120, 80, 72);
      expect(warnings.temperature).toBeUndefined();
    });

    it('should return warnings for low BP systolic', () => {
      const warnings = validateVitals(98.6, 85, 80, 72);
      expect(warnings.bpSystolic).toContain('Low');
    });

    it('should return warnings for high BP systolic', () => {
      const warnings = validateVitals(98.6, 185, 80, 72);
      expect(warnings.bpSystolic).toContain('High');
    });

    it('should return warnings for elevated BP systolic', () => {
      const warnings = validateVitals(98.6, 145, 80, 72);
      expect(warnings.bpSystolic).toContain('Elevated');
    });

    it('should return no warnings for normal BP systolic', () => {
      const warnings = validateVitals(98.6, 120, 80, 72);
      expect(warnings.bpSystolic).toBeUndefined();
    });

    it('should return warnings for low BP diastolic', () => {
      const warnings = validateVitals(98.6, 120, 55, 72);
      expect(warnings.bpDiastolic).toContain('Low');
    });

    it('should return warnings for high BP diastolic', () => {
      const warnings = validateVitals(98.6, 120, 125, 72);
      expect(warnings.bpDiastolic).toContain('High');
    });

    it('should return warnings for elevated BP diastolic', () => {
      const warnings = validateVitals(98.6, 120, 95, 72);
      expect(warnings.bpDiastolic).toContain('Elevated');
    });

    it('should return no warnings for normal BP diastolic', () => {
      const warnings = validateVitals(98.6, 120, 80, 72);
      expect(warnings.bpDiastolic).toBeUndefined();
    });

    it('should return warnings for low pulse (< 40)', () => {
      const warnings = validateVitals(98.6, 120, 80, 35);
      expect(warnings.pulse).toContain('Low');
    });

    it('should return warnings for high pulse', () => {
      const warnings = validateVitals(98.6, 120, 80, 155);
      expect(warnings.pulse).toContain('High');
    });

    it('should return warnings for elevated pulse', () => {
      const warnings = validateVitals(98.6, 120, 80, 105);
      expect(warnings.pulse).toContain('Elevated');
    });

    it('should return warnings for low pulse (< 60 but >= 40)', () => {
      const warnings = validateVitals(98.6, 120, 80, 55);
      expect(warnings.pulse).toContain('Low');
    });

    it('should return no warnings for normal pulse', () => {
      const warnings = validateVitals(98.6, 120, 80, 72);
      expect(warnings.pulse).toBeUndefined();
    });

    it('should return multiple warnings for multiple abnormal vitals', () => {
      const warnings = validateVitals(106, 200, 130, 160);
      expect(warnings.temperature).toContain('High');
      expect(warnings.bpSystolic).toContain('High');
      expect(warnings.bpDiastolic).toContain('High');
      expect(warnings.pulse).toContain('High');
    });
  });

  describe('validateConsultationInput', () => {
    const validInput = {
      patientId: 'p1',
      appointmentId: 'a1',
      temperature: 98.6,
      bpSystolic: 120,
      bpDiastolic: 80,
      pulse: 72,
      complaints: 'Headache',
      diagnosis: 'Migraine',
      medications: [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days',
          instructions: 'Take after meals'
        }
      ]
    };

    it('should validate correct input', () => {
      const result = validateConsultationInput(validInput);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error for missing patientId', () => {
      const result = validateConsultationInput({ ...validInput, patientId: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Patient ID is required');
    });

    it('should return error for missing temperature', () => {
      const result = validateConsultationInput({ ...validInput, temperature: undefined as any });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Temperature is required');
    });

    it('should return error for null temperature', () => {
      const result = validateConsultationInput({ ...validInput, temperature: null as any });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Temperature is required');
    });

    it('should return error for missing bpSystolic', () => {
      const result = validateConsultationInput({ ...validInput, bpSystolic: undefined as any });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('BP Systolic is required');
    });

    it('should return error for null bpSystolic', () => {
      const result = validateConsultationInput({ ...validInput, bpSystolic: null as any });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('BP Systolic is required');
    });

    it('should return error for missing bpDiastolic', () => {
      const result = validateConsultationInput({ ...validInput, bpDiastolic: undefined as any });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('BP Diastolic is required');
    });

    it('should return error for null bpDiastolic', () => {
      const result = validateConsultationInput({ ...validInput, bpDiastolic: null as any });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('BP Diastolic is required');
    });

    it('should return error for missing pulse', () => {
      const result = validateConsultationInput({ ...validInput, pulse: undefined as any });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Pulse is required');
    });

    it('should return error for null pulse', () => {
      const result = validateConsultationInput({ ...validInput, pulse: null as any });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Pulse is required');
    });

    it('should return error for missing complaints', () => {
      const result = validateConsultationInput({ ...validInput, complaints: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Complaints are required');
    });

    it('should return error for missing diagnosis', () => {
      const result = validateConsultationInput({ ...validInput, diagnosis: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Diagnosis is required');
    });

    it('should return error for no medications', () => {
      const result = validateConsultationInput({ ...validInput, medications: [] });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least 1 medication is required');
    });

    it('should return error for missing medication name', () => {
      const result = validateConsultationInput({
        ...validInput,
        medications: [{ ...validInput.medications[0], name: '' }]
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Medication 1: Name is required');
    });

    it('should return error for missing medication dosage', () => {
      const result = validateConsultationInput({
        ...validInput,
        medications: [{ ...validInput.medications[0], dosage: '' }]
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Medication 1: Dosage is required');
    });

    it('should return error for missing medication frequency', () => {
      const result = validateConsultationInput({
        ...validInput,
        medications: [{ ...validInput.medications[0], frequency: '' }]
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Medication 1: Frequency is required');
    });

    it('should return error for missing medication duration', () => {
      const result = validateConsultationInput({
        ...validInput,
        medications: [{ ...validInput.medications[0], duration: '' }]
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Medication 1: Duration is required');
    });

    it('should return multiple errors for invalid input', () => {
      const result = validateConsultationInput({
        ...validInput,
        patientId: '',
        temperature: undefined as any,
        complaints: '',
        medications: []
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Patient ID is required');
      expect(result.errors).toContain('Temperature is required');
      expect(result.errors).toContain('Complaints are required');
      expect(result.errors).toContain('At least 1 medication is required');
    });
  });
});
