import React, { useState, useEffect } from 'react';
import { Patient, PatientInput, validatePatientInput } from '../services/patientService';
import styles from './PatientForm.module.scss';

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({ 
  patient, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<PatientInput>({
    name: '',
    dob: '',
    gender: 'M',
    phone: '',
    email: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Populate form if editing existing patient
  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        dob: patient.dob,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email || '',
        address: patient.address || ''
      });
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate single field on blur
    const validation = validatePatientInput({ ...formData, [field]: formData[field as keyof PatientInput] });
    if (validation.errors[field]) {
      setErrors(prev => ({ ...prev, [field]: validation.errors[field] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const validation = validatePatientInput(formData);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      // Handle server-side errors
      if (error.message.includes('Phone number already exists')) {
        setErrors({ phone: error.message });
      } else {
        setErrors({ form: error.message });
      }
    }
  };

  return (
    <form className={styles.patientForm} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <h2>{patient ? 'Edit Patient' : 'New Patient'}</h2>
      </div>

      {errors.form && (
        <div className={styles.formError}>
          {errors.form}
        </div>
      )}

      <div className={styles.formBody}>
        {/* Name */}
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Name <span className={styles.required}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            className={`${styles.input} ${touched.name && errors.name ? styles.inputError : ''}`}
            disabled={isLoading}
            placeholder="Enter patient name"
          />
          {touched.name && errors.name && (
            <span className={styles.errorText}>{errors.name}</span>
          )}
        </div>

        {/* Date of Birth */}
        <div className={styles.formGroup}>
          <label htmlFor="dob" className={styles.label}>
            Date of Birth <span className={styles.required}>*</span>
          </label>
          <input
            id="dob"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            onBlur={() => handleBlur('dob')}
            className={`${styles.input} ${touched.dob && errors.dob ? styles.inputError : ''}`}
            disabled={isLoading}
            max={new Date().toISOString().split('T')[0]}
          />
          {touched.dob && errors.dob && (
            <span className={styles.errorText}>{errors.dob}</span>
          )}
        </div>

        {/* Gender */}
        <div className={styles.formGroup}>
          <label htmlFor="gender" className={styles.label}>
            Gender <span className={styles.required}>*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            onBlur={() => handleBlur('gender')}
            className={`${styles.input} ${touched.gender && errors.gender ? styles.inputError : ''}`}
            disabled={isLoading}
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="Other">Other</option>
          </select>
          {touched.gender && errors.gender && (
            <span className={styles.errorText}>{errors.gender}</span>
          )}
        </div>

        {/* Phone */}
        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>
            Phone <span className={styles.required}>*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={() => handleBlur('phone')}
            className={`${styles.input} ${touched.phone && errors.phone ? styles.inputError : ''}`}
            disabled={isLoading}
            placeholder="Enter phone number"
          />
          {touched.phone && errors.phone && (
            <span className={styles.errorText}>{errors.phone}</span>
          )}
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            className={`${styles.input} ${touched.email && errors.email ? styles.inputError : ''}`}
            disabled={isLoading}
            placeholder="Enter email address"
          />
          {touched.email && errors.email && (
            <span className={styles.errorText}>{errors.email}</span>
          )}
        </div>

        {/* Address */}
        <div className={styles.formGroup}>
          <label htmlFor="address" className={styles.label}>
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            onBlur={() => handleBlur('address')}
            className={`${styles.textarea} ${touched.address && errors.address ? styles.inputError : ''}`}
            disabled={isLoading}
            placeholder="Enter address"
            rows={3}
          />
          {touched.address && errors.address && (
            <span className={styles.errorText}>{errors.address}</span>
          )}
        </div>
      </div>

      <div className={styles.formFooter}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (patient ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
};
