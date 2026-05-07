import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Consultation interfaces
export interface Consultation {
  id: string;
  patientId: string;
  appointmentId?: string;
  temperature: number;
  bp: string;
  pulse: number;
  complaints: string;
  diagnosis: string;
  medications: Medication[];
  prescription?: {
    id: string;
    status: string;
  };
  vitalsWarnings?: VitalsWarnings;
  created_at: string;
}

export interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ConsultationInput {
  patientId: string;
  appointmentId?: string;
  temperature: number;
  bpSystolic: number;
  bpDiastolic: number;
  pulse: number;
  complaints: string;
  diagnosis: string;
  medications: Medication[];
}

export interface VitalsWarnings {
  temperature?: string;
  bpSystolic?: string;
  bpDiastolic?: string;
  pulse?: string;
}

export interface ConsultationHistoryItem {
  id: string;
  date: string;
  temperature: number;
  bp: string;
  pulse: number;
  diagnosis: string;
  medicationCount: number;
  prescriptionId: string;
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
 * Create new consultation
 */
export const createConsultation = async (consultationData: ConsultationInput): Promise<Consultation> => {
  try {
    const response = await axios.post(`${API_URL}/api/consultations`, consultationData, {
      headers: getAuthHeaders()
    });
    return response.data.consultation;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to create consultation';
    throw new Error(errorMessage);
  }
};

/**
 * Get consultation by ID
 */
export const getConsultationById = async (consultationId: string): Promise<Consultation> => {
  try {
    const response = await axios.get(`${API_URL}/api/consultations/${consultationId}`, {
      headers: getAuthHeaders()
    });
    return response.data.consultation;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch consultation');
  }
};

/**
 * Get patient consultation history
 */
export const getPatientConsultations = async (
  patientId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ consultations: ConsultationHistoryItem[]; total: number; pages: number }> => {
  try {
    const response = await axios.get(`${API_URL}/api/patients/${patientId}/consultations`, {
      params: { limit, offset },
      headers: getAuthHeaders()
    });
    return {
      consultations: response.data.consultations,
      total: response.data.total,
      pages: response.data.pages
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch consultation history');
  }
};
