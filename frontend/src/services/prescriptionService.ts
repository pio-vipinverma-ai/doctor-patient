import axios from 'axios';

const API_URL = 'http://localhost:5000';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
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
 * Prescription Service - API calls for prescription operations
 */

export interface PrescriptionData {
  id: string;
  patientName: string;
  patientAge: number;
  patientDOB: string;
  date: string;
  vitals: {
    temperature: number;
    bp: string;
    pulse: number;
  };
  diagnosis: string;
  complaints: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  clinicHeader: {
    name: string;
    address: string;
    phone: string;
  };
  status: string;
  generatedAt: string;
  printedAt: string | null;
}

export interface PrescriptionResponse {
  success: boolean;
  prescription: PrescriptionData;
}

/**
 * Get prescription by ID
 */
export const getPrescriptionById = async (prescriptionId: string): Promise<PrescriptionData> => {
  const response = await axios.get<PrescriptionResponse>(
    `${API_URL}/api/prescriptions/${prescriptionId}`,
    { headers: getAuthHeaders() }
  );
  return response.data.prescription;
};

/**
 * Get prescription HTML for printing
 */
export const getPrescriptionHTML = async (prescriptionId: string): Promise<string> => {
  const response = await axios.get<string>(
    `${API_URL}/api/prescriptions/${prescriptionId}/print?format=html`,
    { 
      headers: getAuthHeaders(),
      responseType: 'text' as any 
    }
  );
  return response.data;
};

/**
 * Mark prescription as printed
 */
export const markAsPrinted = async (prescriptionId: string): Promise<void> => {
  await axios.put(
    `${API_URL}/api/prescriptions/${prescriptionId}/mark-printed`,
    {},
    { headers: getAuthHeaders() }
  );
};
