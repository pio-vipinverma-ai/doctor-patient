import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { createConsultation, ConsultationInput, Medication } from '../services/consultationService';
import { getPatientById } from '../services/patientService';
import { VITAL_RANGES, getVitalWarning, getVitalWarningLevel } from '../utils/vitals';
import { COMMON_MEDICATIONS, FREQUENCY_OPTIONS } from '../utils/medications';
import styles from './ConsultationPage.module.scss';

interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  phone: string;
  lastVisit?: string;
}

export const ConsultationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId } = useParams<{ patientId: string }>();
  const { showToast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);

  // Form state
  const [temperature, setTemperature] = useState<string>('');
  const [bpSystolic, setBpSystolic] = useState<string>('');
  const [bpDiastolic, setBpDiastolic] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [complaints, setComplaints] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [medications, setMedications] = useState<Medication[]>([]);

  // Medication form state
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [medicationName, setMedicationName] = useState<string>('');
  const [medicationDosage, setMedicationDosage] = useState<string>('');
  const [medicationFrequency, setMedicationFrequency] = useState<string>('Twice daily');
  const [medicationDuration, setMedicationDuration] = useState<string>('');
  const [medicationInstructions, setMedicationInstructions] = useState<string>('After food');

  // Autocomplete state
  const [showMedicationSuggestions, setShowMedicationSuggestions] = useState(false);
  const [filteredMedications, setFilteredMedications] = useState<string[]>([]);

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get appointment ID from location state if available
  const appointmentId = location.state?.appointmentId;

  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  const loadPatient = async () => {
    if (!patientId) return;
    
    setIsLoadingPatient(true);
    try {
      const data = await getPatientById(patientId);
      setPatient(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load patient', 'error');
      navigate('/dashboard');
    } finally {
      setIsLoadingPatient(false);
    }
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleMedicationNameChange = (value: string) => {
    setMedicationName(value);
    
    if (value.length >= 2) {
      const filtered = COMMON_MEDICATIONS.filter(med =>
        med.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMedications(filtered);
      setShowMedicationSuggestions(filtered.length > 0);
    } else {
      setShowMedicationSuggestions(false);
    }
  };

  const selectMedication = (med: string) => {
    setMedicationName(med);
    setShowMedicationSuggestions(false);
  };

  const handleAddMedication = () => {
    if (!medicationName.trim()) {
      showToast('Please enter medication name', 'error');
      return;
    }
    if (!medicationDosage.trim()) {
      showToast('Please enter dosage', 'error');
      return;
    }
    if (!medicationDuration.trim()) {
      showToast('Please enter duration', 'error');
      return;
    }

    const newMedication: Medication = {
      name: medicationName.trim(),
      dosage: medicationDosage.trim(),
      frequency: medicationFrequency,
      duration: medicationDuration.trim(),
      instructions: medicationInstructions.trim()
    };

    setMedications([...medications, newMedication]);
    
    // Reset form
    setMedicationName('');
    setMedicationDosage('');
    setMedicationFrequency('Twice daily');
    setMedicationDuration('');
    setMedicationInstructions('After food');
    setShowMedicationForm(false);
    
    showToast('Medication added', 'success');
  };

  const handleRemoveMedication = (index: number) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);
    showToast('Medication removed', 'info');
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Vitals validation
    if (!temperature) {
      newErrors.temperature = 'Temperature is required';
    } else if (isNaN(parseFloat(temperature)) || parseFloat(temperature) <= 0) {
      newErrors.temperature = 'Invalid temperature value';
    }

    if (!bpSystolic) {
      newErrors.bpSystolic = 'BP Systolic is required';
    } else if (isNaN(parseFloat(bpSystolic)) || parseFloat(bpSystolic) <= 0) {
      newErrors.bpSystolic = 'Invalid BP Systolic value';
    }

    if (!bpDiastolic) {
      newErrors.bpDiastolic = 'BP Diastolic is required';
    } else if (isNaN(parseFloat(bpDiastolic)) || parseFloat(bpDiastolic) <= 0) {
      newErrors.bpDiastolic = 'Invalid BP Diastolic value';
    }

    if (!pulse) {
      newErrors.pulse = 'Pulse is required';
    } else if (isNaN(parseFloat(pulse)) || parseFloat(pulse) <= 0) {
      newErrors.pulse = 'Invalid pulse value';
    }

    // Complaints and diagnosis
    if (!complaints.trim()) {
      newErrors.complaints = 'Complaints are required';
    }

    if (!diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }

    // Medications
    if (medications.length === 0) {
      newErrors.medications = 'At least 1 medication is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (!patientId) {
      showToast('Patient ID is missing', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const consultationData: ConsultationInput = {
        patientId,
        appointmentId,
        temperature: parseFloat(temperature),
        bpSystolic: parseFloat(bpSystolic),
        bpDiastolic: parseFloat(bpDiastolic),
        pulse: parseFloat(pulse),
        complaints,
        diagnosis,
        medications
      };

      const consultation = await createConsultation(consultationData);
      
      showToast('Consultation saved successfully!', 'success');
      
      // Navigate to prescription page
      if (consultation.prescription?.id) {
        navigate(`/prescription/${consultation.prescription.id}`, {
          state: { consultationId: consultation.id }
        });
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save consultation', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoadingPatient) {
    return (
      <Layout>
        <div className={styles.loading}>Loading patient information...</div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className={styles.error}>Patient not found</div>
      </Layout>
    );
  }

  // Get vital warnings
  const tempWarning = temperature ? getVitalWarning('temperature', parseFloat(temperature)) : null;
  const sysWarning = bpSystolic ? getVitalWarning('bpSystolic', parseFloat(bpSystolic)) : null;
  const diaWarning = bpDiastolic ? getVitalWarning('bpDiastolic', parseFloat(bpDiastolic)) : null;
  const pulseWarning = pulse ? getVitalWarning('pulse', parseFloat(pulse)) : null;

  const tempLevel = temperature ? getVitalWarningLevel('temperature', parseFloat(temperature)) : 'normal';
  const sysLevel = bpSystolic ? getVitalWarningLevel('bpSystolic', parseFloat(bpSystolic)) : 'normal';
  const diaLevel = bpDiastolic ? getVitalWarningLevel('bpDiastolic', parseFloat(bpDiastolic)) : 'normal';
  const pulseLevel = pulse ? getVitalWarningLevel('pulse', parseFloat(pulse)) : 'normal';

  return (
    <Layout>
      <div className={styles.consultationPage}>
        {/* Fixed Patient Header */}
        <div className={styles.patientHeader}>
          <div className={styles.patientInfo}>
            <h2>{patient.name}</h2>
            <div className={styles.patientDetails}>
              <span>Age: {calculateAge(patient.dob)}</span>
              <span>•</span>
              <span>Gender: {patient.gender}</span>
              <span>•</span>
              <span>Phone: {patient.phone}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.consultationForm}>
          {/* Section 1: Vitals */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Vitals</h3>
            <div className={styles.vitalsGrid}>
              <div className={styles.vitalField}>
                <label>Temperature ({VITAL_RANGES.temperature.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className={`${styles.vitalInput} ${tempLevel === 'warning' ? styles.warning : ''} ${tempLevel === 'danger' ? styles.danger : ''}`}
                  placeholder="98.6"
                />
                <div className={styles.normalRange}>Normal: {VITAL_RANGES.temperature.normal}°F</div>
                {tempWarning && (
                  <div className={`${styles.vitalWarning} ${styles[tempLevel]}`}>
                    ⚠ {tempWarning}
                  </div>
                )}
                {errors.temperature && <div className={styles.error}>{errors.temperature}</div>}
              </div>

              <div className={styles.vitalField}>
                <label>BP Systolic ({VITAL_RANGES.bpSystolic.unit})</label>
                <input
                  type="number"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className={`${styles.vitalInput} ${sysLevel === 'warning' ? styles.warning : ''} ${sysLevel === 'danger' ? styles.danger : ''}`}
                  placeholder="120"
                />
                <div className={styles.normalRange}>Normal: {VITAL_RANGES.bpSystolic.normal} mmHg</div>
                {sysWarning && (
                  <div className={`${styles.vitalWarning} ${styles[sysLevel]}`}>
                    ⚠ {sysWarning}
                  </div>
                )}
                {errors.bpSystolic && <div className={styles.error}>{errors.bpSystolic}</div>}
              </div>

              <div className={styles.vitalField}>
                <label>BP Diastolic ({VITAL_RANGES.bpDiastolic.unit})</label>
                <input
                  type="number"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className={`${styles.vitalInput} ${diaLevel === 'warning' ? styles.warning : ''} ${diaLevel === 'danger' ? styles.danger : ''}`}
                  placeholder="80"
                />
                <div className={styles.normalRange}>Normal: {VITAL_RANGES.bpDiastolic.normal} mmHg</div>
                {diaWarning && (
                  <div className={`${styles.vitalWarning} ${styles[diaLevel]}`}>
                    ⚠ {diaWarning}
                  </div>
                )}
                {errors.bpDiastolic && <div className={styles.error}>{errors.bpDiastolic}</div>}
              </div>

              <div className={styles.vitalField}>
                <label>Pulse ({VITAL_RANGES.pulse.unit})</label>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className={`${styles.vitalInput} ${pulseLevel === 'warning' ? styles.warning : ''} ${pulseLevel === 'danger' ? styles.danger : ''}`}
                  placeholder="72"
                />
                <div className={styles.normalRange}>Normal: {VITAL_RANGES.pulse.normal} BPM</div>
                {pulseWarning && (
                  <div className={`${styles.vitalWarning} ${styles[pulseLevel]}`}>
                    ⚠ {pulseWarning}
                  </div>
                )}
                {errors.pulse && <div className={styles.error}>{errors.pulse}</div>}
              </div>
            </div>
          </div>

          {/* Section 2: Complaints */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Complaints</h3>
            <textarea
              value={complaints}
              onChange={(e) => setComplaints(e.target.value)}
              className={styles.textarea}
              placeholder="e.g., Fever, cough, body ache for 3 days"
              rows={4}
            />
            {errors.complaints && <div className={styles.error}>{errors.complaints}</div>}
          </div>

          {/* Section 3: Diagnosis */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Diagnosis</h3>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className={styles.textarea}
              placeholder="e.g., Viral fever with URI symptoms"
              rows={4}
            />
            {errors.diagnosis && <div className={styles.error}>{errors.diagnosis}</div>}
          </div>

          {/* Section 4: Medications */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Medications</h3>
              <button
                type="button"
                className={styles.addMedicationBtn}
                onClick={() => setShowMedicationForm(true)}
              >
                + Add Medication
              </button>
            </div>

            {errors.medications && <div className={styles.error}>{errors.medications}</div>}

            {/* Medication List */}
            {medications.length > 0 && (
              <div className={styles.medicationList}>
                {medications.map((med, index) => (
                  <div key={index} className={styles.medicationItem}>
                    <div className={styles.medicationInfo}>
                      <div className={styles.medicationName}>
                        {index + 1}. {med.name} - {med.dosage}
                      </div>
                      <div className={styles.medicationDetails}>
                        {med.frequency} for {med.duration}
                        {med.instructions && ` • ${med.instructions}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.removeMedicationBtn}
                      onClick={() => handleRemoveMedication(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Medication Form */}
            {showMedicationForm && (
              <div className={styles.medicationForm}>
                <div className={styles.medicationFormGrid}>
                  <div className={styles.medicationFormField}>
                    <label>Medication Name *</label>
                    <div className={styles.autocompleteWrapper}>
                      <input
                        type="text"
                        value={medicationName}
                        onChange={(e) => handleMedicationNameChange(e.target.value)}
                        placeholder="e.g., Paracetamol"
                        autoFocus
                      />
                      {showMedicationSuggestions && (
                        <div className={styles.suggestions}>
                          {filteredMedications.map((med, index) => (
                            <div
                              key={index}
                              className={styles.suggestionItem}
                              onClick={() => selectMedication(med)}
                            >
                              {med}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.medicationFormField}>
                    <label>Dosage *</label>
                    <input
                      type="text"
                      value={medicationDosage}
                      onChange={(e) => setMedicationDosage(e.target.value)}
                      placeholder="e.g., 500mg"
                    />
                  </div>

                  <div className={styles.medicationFormField}>
                    <label>Frequency *</label>
                    <select
                      value={medicationFrequency}
                      onChange={(e) => setMedicationFrequency(e.target.value)}
                    >
                      {FREQUENCY_OPTIONS.map((freq, index) => (
                        <option key={index} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.medicationFormField}>
                    <label>Duration *</label>
                    <input
                      type="text"
                      value={medicationDuration}
                      onChange={(e) => setMedicationDuration(e.target.value)}
                      placeholder="e.g., 5 days"
                    />
                  </div>

                  <div className={styles.medicationFormField}>
                    <label>Instructions</label>
                    <input
                      type="text"
                      value={medicationInstructions}
                      onChange={(e) => setMedicationInstructions(e.target.value)}
                      placeholder="e.g., After food"
                    />
                  </div>
                </div>

                <div className={styles.medicationFormActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowMedicationForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={handleAddMedication}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save & Generate Prescription'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
