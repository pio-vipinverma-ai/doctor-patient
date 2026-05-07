// Patient model types
export interface Patient {
  id: string;
  name: string;
  dob: string; // ISO date string
  gender: 'M' | 'F' | 'Other';
  phone: string;
  email?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PatientInput {
  name: string;
  dob: string;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  email?: string;
  address?: string;
}

export interface PatientSearchResult {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  lastVisit: string | null;
}

export interface PatientUpdateInput {
  name?: string;
  dob?: string;
  gender?: 'M' | 'F' | 'Other';
  phone?: string;
  email?: string;
  address?: string;
}

// Appointment model types
export interface Appointment {
  id: string;
  patient_id: string;
  scheduled_time: Date;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  reason?: string;
  created_at: Date;
  updated_at: Date;
}

// Consultation model types
export interface Consultation {
  id: string;
  patient_id: string;
  appointment_id?: string;
  temperature?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  pulse?: number;
  complaints?: string;
  diagnosis?: string;
  created_at: Date;
  updated_at: Date;
}
