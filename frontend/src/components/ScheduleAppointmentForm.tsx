import React, { useState, useEffect } from 'react';
import { PatientSearchResult, searchPatients } from '../services/patientService';
import { createAppointment, AppointmentInput } from '../services/appointmentService';
import { useToast } from '../context/ToastContext';
import styles from './ScheduleAppointmentForm.module.scss';

interface ScheduleAppointmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultPatientId?: string;
}

export const ScheduleAppointmentForm: React.FC<ScheduleAppointmentFormProps> = ({
  onSuccess,
  onCancel,
  defaultPatientId
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<AppointmentInput>({
    patientId: defaultPatientId || '',
    scheduledTime: '',
    reason: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced patient search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPatients(searchQuery, 10);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePatientSelect = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setFormData({ ...formData, patientId: patient.id });
    setSearchQuery(patient.name);
    setShowResults(false);
    setErrors({ ...errors, patientId: '' });
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ ...formData, scheduledTime: value });
    
    // Validate date/time
    const selectedDate = new Date(value);
    const now = new Date();
    const nineAM = new Date(selectedDate);
    nineAM.setHours(9, 0, 0, 0);
    const sixPM = new Date(selectedDate);
    sixPM.setHours(18, 0, 0, 0);

    if (selectedDate < now) {
      setErrors({ ...errors, scheduledTime: 'Cannot schedule appointment in the past' });
    } else if (selectedDate.getHours() < 9 || selectedDate.getHours() >= 18) {
      setErrors({ ...errors, scheduledTime: 'Appointments must be between 9 AM and 6 PM' });
    } else {
      setErrors({ ...errors, scheduledTime: '' });
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, reason: e.target.value });
    setErrors({ ...errors, reason: '' });
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Please select a patient';
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Please select date and time';
    } else {
      const selectedDate = new Date(formData.scheduledTime);
      const now = new Date();
      
      if (selectedDate < now) {
        newErrors.scheduledTime = 'Cannot schedule appointment in the past';
      } else if (selectedDate.getHours() < 9 || selectedDate.getHours() >= 18) {
        newErrors.scheduledTime = 'Appointments must be between 9 AM and 6 PM';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide reason for appointment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createAppointment(formData);
      
      showToast('Appointment scheduled successfully!', 'success');
      
      // Reset form
      setFormData({ patientId: '', scheduledTime: '', reason: '' });
      setSearchQuery('');
      setSelectedPatient(null);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to schedule appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ patientId: '', scheduledTime: '', reason: '' });
    setSearchQuery('');
    setSelectedPatient(null);
    setErrors({});
    if (onCancel) {
      onCancel();
    }
  };

  // Get minimum date/time (now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // At least 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Schedule Appointment</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Patient Search */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Patient <span className={styles.required}>*</span>
          </label>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              className={`${styles.input} ${errors.patientId ? styles.error : ''}`}
              disabled={isSubmitting}
            />
            {isSearching && <div className={styles.searchLoader}>Searching...</div>}
            
            {showResults && searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className={styles.searchResultItem}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className={styles.patientName}>{patient.name}</div>
                    <div className={styles.patientInfo}>
                      {patient.age} years • {patient.gender} • {patient.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.patientId && <div className={styles.errorMessage}>{errors.patientId}</div>}
        </div>

        {/* Date & Time */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Date & Time <span className={styles.required}>*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledTime}
            onChange={handleDateTimeChange}
            min={getMinDateTime()}
            className={`${styles.input} ${errors.scheduledTime ? styles.error : ''}`}
            disabled={isSubmitting}
          />
          <div className={styles.helpText}>Clinic hours: 9 AM - 6 PM</div>
          {errors.scheduledTime && <div className={styles.errorMessage}>{errors.scheduledTime}</div>}
        </div>

        {/* Reason */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Reason for Visit <span className={styles.required}>*</span>
          </label>
          <textarea
            placeholder="Enter reason for appointment..."
            value={formData.reason}
            onChange={handleReasonChange}
            rows={4}
            className={`${styles.textarea} ${errors.reason ? styles.error : ''}`}
            disabled={isSubmitting}
          />
          {errors.reason && <div className={styles.errorMessage}>{errors.reason}</div>}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};
