import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPatients, PatientSearchResult, createPatient, PatientInput } from '../services/patientService';
import { useDebounce } from '../hooks/useDebounce';
import { PatientCard } from '../components/PatientCard';
import { PatientForm } from '../components/PatientForm';
import { Layout } from '../components/layout/Layout';
import styles from './PatientSearchPage.module.scss';

export const PatientSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search patients when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length === 0) {
        setPatients([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await searchPatients(debouncedQuery, 10);
        setPatients(results);
      } catch (err: any) {
        setError(err.message);
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleCreatePatient = async (patientData: PatientInput) => {
    setIsCreating(true);
    try {
      const newPatient = await createPatient(patientData);
      setShowCreateForm(false);
      // Navigate to the new patient's profile
      navigate(`/patients/${newPatient.id}`);
    } catch (err: any) {
      throw err; // Re-throw to let PatientForm handle the error
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Layout>
      <div className={styles.searchPage}>
      <div className={styles.header}>
        <h1>Patient Search</h1>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateForm(true)}
        >
          + New Patient
        </button>
      </div>

      {!showCreateForm ? (
        <>
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <svg 
                className={styles.searchIcon}
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none"
              >
                <path 
                  d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by name or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {isLoading && (
                <div className={styles.spinner}></div>
              )}
            </div>
            <p className={styles.hint}>
              Type at least 1 character to search
            </p>
          </div>

          <div className={styles.results}>
            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}

            {!error && searchQuery && patients.length === 0 && !isLoading && (
              <div className={styles.noResults}>
                <p>No patients found matching "{searchQuery}"</p>
                <button 
                  className={styles.createFromSearchButton}
                  onClick={() => setShowCreateForm(true)}
                >
                  Create New Patient
                </button>
              </div>
            )}

            {!error && patients.length > 0 && (
              <div className={styles.patientList}>
                <p className={styles.resultCount}>
                  Found {patients.length} patient{patients.length !== 1 ? 's' : ''}
                </p>
                {patients.map(patient => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            )}

            {!searchQuery && !error && (
              <div className={styles.emptyState}>
                <svg 
                  width="64" 
                  height="64" 
                  viewBox="0 0 64 64" 
                  fill="none"
                  className={styles.emptyIcon}
                >
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="30" 
                    stroke="#ccc" 
                    strokeWidth="2"
                  />
                  <path 
                    d="M32 20v24M20 32h24" 
                    stroke="#ccc" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                </svg>
                <p>Enter a patient name or phone number to search</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={styles.formContainer}>
          <PatientForm
            onSubmit={handleCreatePatient}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isCreating}
          />
        </div>
      )}
      </div>
    </Layout>
  );
};
