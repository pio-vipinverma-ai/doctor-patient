import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Appointment interfaces
export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  phone?: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  reason: string;
  consultationSaved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentInput {
  patientId: string;
  scheduledTime: string;
  reason: string;
}

export interface AppointmentListItem {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  scheduledTime: string;
  status: string;
  reason: string;
  consultationSaved: boolean;
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
 * Create new appointment
 */
export const createAppointment = async (appointmentData: AppointmentInput): Promise<Appointment> => {
  try {
    const response = await axios.post(`${API_URL}/api/appointments`, appointmentData, {
      headers: getAuthHeaders()
    });
    return response.data.appointment;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to create appointment';
    throw new Error(errorMessage);
  }
};

/**
 * Get appointments for a specific date
 */
export const getAppointmentsByDate = async (
  date?: string,
  status?: string
): Promise<AppointmentListItem[]> => {
  try {
    const params: any = {};
    if (date) params.date = date;
    if (status) params.status = status;

    const response = await axios.get(`${API_URL}/api/appointments`, {
      params,
      headers: getAuthHeaders()
    });
    return response.data.appointments;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch appointments');
  }
};

/**
 * Get appointments for a specific patient
 */
export const getAppointmentsByPatient = async (
  patientId: string,
  status?: string
): Promise<AppointmentListItem[]> => {
  try {
    const params: any = { patientId };
    if (status) params.status = status;

    const response = await axios.get(`${API_URL}/api/appointments`, {
      params,
      headers: getAuthHeaders()
    });
    return response.data.appointments;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch appointments');
  }
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (appointmentId: string): Promise<Appointment> => {
  try {
    const response = await axios.get(`${API_URL}/api/appointments/${appointmentId}`, {
      headers: getAuthHeaders()
    });
    return response.data.appointment;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch appointment');
  }
};

/**
 * Update appointment status or details
 */
export const updateAppointment = async (
  appointmentId: string,
  updates: { status?: string; reason?: string }
): Promise<Appointment> => {
  try {
    const response = await axios.put(`${API_URL}/api/appointments/${appointmentId}`, updates, {
      headers: getAuthHeaders()
    });
    return response.data.appointment;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Failed to update appointment';
    throw new Error(errorMessage);
  }
};

/**
 * Get today's appointments
 */
export const getTodaysAppointments = async (): Promise<AppointmentListItem[]> => {
  const today = new Date().toISOString().split('T')[0];
  return getAppointmentsByDate(today);
};
