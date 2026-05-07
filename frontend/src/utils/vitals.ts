/**
 * Vitals Utility Functions
 * For validating and checking vital signs ranges
 */

export interface VitalRange {
  min: number;
  max: number;
  normal: number | string;
  unit: string;
}

export interface VitalRanges {
  temperature: VitalRange;
  bpSystolic: VitalRange;
  bpDiastolic: VitalRange;
  pulse: VitalRange;
}

// Normal vital sign ranges
export const VITAL_RANGES: VitalRanges = {
  temperature: {
    min: 95,
    max: 105,
    normal: 98.6,
    unit: '°F'
  },
  bpSystolic: {
    min: 90,
    max: 180,
    normal: 120,
    unit: 'mmHg'
  },
  bpDiastolic: {
    min: 60,
    max: 120,
    normal: 80,
    unit: 'mmHg'
  },
  pulse: {
    min: 40,
    max: 150,
    normal: '60-100',
    unit: 'BPM'
  }
};

export type VitalType = 'temperature' | 'bpSystolic' | 'bpDiastolic' | 'pulse';

/**
 * Check if a vital value is within normal range
 */
export const isVitalNormal = (type: VitalType, value: number): boolean => {
  const range = VITAL_RANGES[type];
  
  if (type === 'temperature') {
    return value >= 95 && value <= 100.4;
  } else if (type === 'bpSystolic') {
    return value >= 90 && value <= 140;
  } else if (type === 'bpDiastolic') {
    return value >= 60 && value <= 90;
  } else if (type === 'pulse') {
    return value >= 60 && value <= 100;
  }
  
  return value >= range.min && value <= range.max;
};

/**
 * Check if a vital value is within acceptable range (wider than normal)
 */
export const isVitalAcceptable = (type: VitalType, value: number): boolean => {
  const range = VITAL_RANGES[type];
  return value >= range.min && value <= range.max;
};

/**
 * Get warning message for abnormal vital
 */
export const getVitalWarning = (type: VitalType, value: number): string | null => {
  const range = VITAL_RANGES[type];
  
  if (!isVitalAcceptable(type, value)) {
    if (value < range.min) {
      return `Low (${value}${range.unit}, normal: ${range.normal}${range.unit}, range: ${range.min}-${range.max}${range.unit})`;
    } else {
      return `High (${value}${range.unit}, normal: ${range.normal}${range.unit}, range: ${range.min}-${range.max}${range.unit})`;
    }
  } else if (!isVitalNormal(type, value)) {
    if (value < range.min) {
      return `Low (${value}${range.unit}, normal: ${range.normal}${range.unit})`;
    } else {
      return `Elevated (${value}${range.unit}, normal: ${range.normal}${range.unit})`;
    }
  }
  
  return null;
};

/**
 * Get warning level for vital (normal, warning, danger)
 */
export const getVitalWarningLevel = (type: VitalType, value: number): 'normal' | 'warning' | 'danger' => {
  if (!isVitalAcceptable(type, value)) {
    return 'danger';
  } else if (!isVitalNormal(type, value)) {
    return 'warning';
  }
  return 'normal';
};

/**
 * Format vital display with unit
 */
export const formatVital = (type: VitalType, value: number): string => {
  const range = VITAL_RANGES[type];
  return `${value}${range.unit}`;
};

/**
 * Get all vital warnings for a set of vitals
 */
export const getVitalsWarnings = (vitals: {
  temperature: number;
  bpSystolic: number;
  bpDiastolic: number;
  pulse: number;
}): { [key: string]: string } => {
  const warnings: { [key: string]: string } = {};
  
  const tempWarning = getVitalWarning('temperature', vitals.temperature);
  if (tempWarning) warnings.temperature = tempWarning;
  
  const sysWarning = getVitalWarning('bpSystolic', vitals.bpSystolic);
  if (sysWarning) warnings.bpSystolic = sysWarning;
  
  const diaWarning = getVitalWarning('bpDiastolic', vitals.bpDiastolic);
  if (diaWarning) warnings.bpDiastolic = diaWarning;
  
  const pulseWarning = getVitalWarning('pulse', vitals.pulse);
  if (pulseWarning) warnings.pulse = pulseWarning;
  
  return warnings;
};
