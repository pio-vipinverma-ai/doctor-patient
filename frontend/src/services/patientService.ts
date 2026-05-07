import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Patient interfaces
export interface Patient {
  id: string;
  name: string;
  dob: string;
  age?: number;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  email?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientSearchResult {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  lastVisit: string | null;
}

export interface PatientInput {
  name: string;
  dob: string;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  email?: string;
  address?: string;
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Get authorization headers
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Search patients by name or phone
 */
export const searchPatients = async (query: string, limit: number = 10): Promise<PatientSearchResult[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/patients/search`, {
      params: { q: query, limit },
      headers: getAuthHeaders()
    });
    return response.data.patients;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to search patients');
  }
};

/**
 * Get patient by ID
 */
export const getPatientById = async (patientId: string): Promise<Patient> => {
  try {
    const response = await axios.get(`${API_URL}/api/patients/${patientId}`, {
      headers: getAuthHeaders()
    });
    return response.data.patient;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch patient');
  }
};

/**
 * Create new patient
 */
export const createPatient = async (patientData: PatientInput): Promise<Patient> => {
  try {
    const response = await axios.post(`${API_URL}/api/patients`, patientData, {
      headers: getAuthHeaders()
    });
    return response.data.patient;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to create patient';
    throw new Error(errorMessage);
  }
};

/**
 * Update patient
 */
export const updatePatient = async (patientId: string, updates: Partial<PatientInput>): Promise<Patient> => {
  try {
    const response = await axios.put(`${API_URL}/api/patients/${patientId}`, updates, {
      headers: getAuthHeaders()
    });
    return response.data.patient;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to update patient');
  }
};

/**
 * Get all patients (paginated)
 */
export const getAllPatients = async (limit: number = 50, offset: number = 0): Promise<{ patients: Patient[]; total: number }> => {
  try {
    const response = await axios.get(`${API_URL}/api/patients`, {
      params: { limit, offset },
      headers: getAuthHeaders()
    });
    return {
      patients: response.data.patients,
      total: response.data.total
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch patients');
  }
};

/**
 * Validate patient input
 */
export const validatePatientInput = (data: Partial<PatientInput>): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be 100 characters or less';
  } else if (!/^[a-zA-Z\s]+$/.test(data.name)) {
    errors.name = 'Name must contain only letters and spaces';
  }

  // DOB validation
  if (!data.dob) {
    errors.dob = 'Date of birth is required';
  } else {
    const dob = new Date(data.dob);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    
    if (isNaN(dob.getTime())) {
      errors.dob = 'Invalid date of birth';
    } else if (age < 0 || age > 150) {
      errors.dob = 'Invalid age (must be between 0 and 150)';
    }
  }

  // Gender validation
  if (!data.gender || !['M', 'F', 'Other'].includes(data.gender)) {
    errors.gender = 'Gender must be M, F, or Other';
  }

  // Phone validation
  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = 'Phone number is required';
  } else if (!/^\+?[0-9\s\-\(\)]{10,}$/.test(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  // Email validation (optional)
  if (data.email && data.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
