import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientById, updatePatient, Patient, PatientInput } from '../services/patientService';
import { PatientForm } from '../components/PatientForm';
import { Layout } from '../components/layout/Layout';
import styles from './PatientProfilePage.module.scss';

type TabType = 'profile' | 'appointments' | 'history';

export const PatientProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showEditForm, setShowEditForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadPatient = async () => {
      if (!id) {
        setError('No patient ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const patientData = await getPatientById(id);
        setPatient(patientData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [id]);

  const handleUpdatePatient = async (updates: PatientInput) => {
    if (!id) return;

    setIsUpdating(true);
    try {
      const updatedPatient = await updatePatient(id, updates);
      setPatient(updatedPatient);
      setShowEditForm(false);
    } catch (err: any) {
      throw err; // Re-throw to let PatientForm handle the error
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className={styles.profilePage}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading patient...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !patient) {
    return (
      <Layout>
        <div className={styles.profilePage}>
          <div className={styles.error}>
            <h2>Error</h2>
            <p>{error || 'Patient not found'}</p>
            <button onClick={() => navigate('/patients/search')} className={styles.backButton}>
              Back to Search
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (showEditForm) {
    return (
      <Layout>
        <div className={styles.profilePage}>
          <div className={styles.formContainer}>
            <PatientForm
              patient={patient}
              onSubmit={handleUpdatePatient}
              onCancel={() => setShowEditForm(false)}
              isLoading={isUpdating}
            />
          </div>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderDisplay = (gender: string): string => {
    switch (gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      default: return gender;
    }
  };

  return (
    <Layout>
      <div className={styles.profilePage}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate('/patients/search')} className={styles.backLink}>
          ← Back to Search
        </button>
        <div className={styles.headerContent}>
          <div className={styles.patientInfo}>
            <h1 className={styles.patientName}>{patient.name}</h1>
            <div className={styles.badges}>
              <span className={styles.badge}>{patient.age} years</span>
              <span className={styles.badge}>{getGenderDisplay(patient.gender)}</span>
            </div>
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.editButton}
              onClick={() => setShowEditForm(true)}
            >
              Edit
            </button>
            <button className={styles.actionButton}>
              Schedule Appointment
            </button>
            <button 
              className={`${styles.actionButton} ${styles.primaryButton}`}
              onClick={() => navigate(`/consultation/${patient.id}`)}
            >
              Start Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'appointments' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'profile' && (
          <div className={styles.profileTab}>
            <div className={styles.infoSection}>
              <h2>Personal Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Date of Birth</span>
                  <span className={styles.value}>{formatDate(patient.dob)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Age</span>
                  <span className={styles.value}>{patient.age} years</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Gender</span>
                  <span className={styles.value}>{getGenderDisplay(patient.gender)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Phone</span>
                  <span className={styles.value}>{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Email</span>
                    <span className={styles.value}>{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Address</span>
                    <span className={styles.value}>{patient.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoSection}>
              <h2>Registration Details</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Patient ID</span>
                  <span className={styles.value}>{patient.id}</span>
                </div>
                {patient.created_at && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Registered On</span>
                    <span className={styles.value}>{formatDate(patient.created_at)}</span>
                  </div>
                )}
                {patient.updated_at && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Last Updated</span>
                    <span className={styles.value}>{formatDate(patient.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className={styles.comingSoon}>
            <p>Appointments feature coming soon...</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className={styles.comingSoon}>
            <p>Consultation history feature coming soon...</p>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};
