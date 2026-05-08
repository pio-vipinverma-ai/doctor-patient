import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Export types
export type ExportType = 'patients' | 'consultations';
export type ExportFormat = 'csv' | 'pdf';

export interface ExportOptions {
  type: ExportType;
  format: ExportFormat;
  fromDate?: string;
  toDate?: string;
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
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Export patients data
 */
export const exportPatients = async (format: ExportFormat, fromDate?: string, toDate?: string): Promise<Blob> => {
  try {
    const params: any = { format };
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;

    const response = await axios.get(`${API_URL}/api/exports/patients`, {
      params,
      headers: getAuthHeaders(),
      responseType: 'blob'
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to export patients');
  }
};

/**
 * Export consultations data
 */
export const exportConsultations = async (format: ExportFormat, fromDate?: string, toDate?: string): Promise<Blob> => {
  try {
    const params: any = { format };
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;

    const response = await axios.get(`${API_URL}/api/exports/consultations`, {
      params,
      headers: getAuthHeaders(),
      responseType: 'blob'
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to export consultations');
  }
};

/**
 * Trigger file download from blob
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate filename for export
 */
export const generateFilename = (type: ExportType, format: ExportFormat): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const extension = format === 'csv' ? 'csv' : 'pdf';
  return `${type}_${date}.${extension}`;
};
