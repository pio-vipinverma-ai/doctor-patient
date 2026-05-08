import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { getPatientById, Patient } from '../services/patientService';
import { getPatientConsultations, ConsultationHistoryItem } from '../services/consultationService';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { ConsultationTable } from '../components/ConsultationTable';
import styles from './PatientHistoryPage.module.scss';

export const PatientHistoryPage: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<ConsultationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Date filter state (default: last 90 days)
  const getDefaultFromDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString().split('T')[0];
  };
  
  const getDefaultToDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  const [fromDate, setFromDate] = useState<string>(getDefaultFromDate());
  const [toDate, setToDate] = useState<string>(getDefaultToDate());
  const [isFiltering, setIsFiltering] = useState(false);
  
  const limit = 10;

  // Load patient data
  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) {
        setError('No patient ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const patientData = await getPatientById(patientId);
        setPatient(patientData);
      } catch (err: any) {
        setError(err.message);
      }
    };

    loadPatient();
  }, [patientId]);

  // Load consultations
  useEffect(() => {
    loadConsultations();
  }, [patientId, currentPage, fromDate, toDate]);

  const loadConsultations = async () => {
    if (!patientId) return;

    setIsLoading(true);
    setError(null);

    try {
      const offset = (currentPage - 1) * limit;
      const result = await getPatientConsultations(
        patientId,
        limit,
        offset,
        fromDate,
        toDate
      );

      setConsultations(result.consultations);
      setTotal(result.total);
      setPages(result.pages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateFilterApply = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDateFilterReset = () => {
    setFromDate(getDefaultFromDate());
    setToDate(getDefaultToDate());
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrintPrescription = (consultationId: string, prescriptionId: string) => {
    if (prescriptionId) {
      navigate(`/prescription/${prescriptionId}`);
    }
  };

  const handleReuseDiagnosis = (diagnosis: string) => {
    // Store the diagnosis in localStorage to be picked up by consultation form
    localStorage.setItem('reusedDiagnosis', diagnosis);
    navigate(`/consultation/${patientId}`);
  };

  if (error) {
    return (
      <Layout>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>Patient Visit History</h1>
        </div>

        {/* Patient Info */}
        {patient && (
          <div className={styles.patientInfo}>
            <div className={styles.patientDetails}>
              <h2>{patient.name}</h2>
              <div className={styles.patientMeta}>
                <span>Age: {patient.age}</span>
                <span>•</span>
                <span>Gender: {patient.gender}</span>
                <span>•</span>
                <span>Phone: {patient.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Date Range Filter */}
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onApply={handleDateFilterApply}
          onReset={handleDateFilterReset}
          isLoading={isLoading}
        />

        {/* Consultations Table */}
        {isLoading && consultations.length === 0 ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading consultation history...</p>
          </div>
        ) : consultations.length === 0 ? (
          <div className={styles.noResults}>
            <p>No consultations found for the selected date range.</p>
            <button onClick={handleDateFilterReset}>Reset Filter</button>
          </div>
        ) : (
          <>
            <ConsultationTable
              consultations={consultations}
              patientId={patientId || ''}
              onPrintPrescription={handlePrintPrescription}
              onReuseDiagnosis={handleReuseDiagnosis}
              isLoading={isLoading}
            />

            {/* Pagination */}
            {pages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className={styles.pageButton}
                >
                  Previous
                </button>
                
                <span className={styles.pageInfo}>
                  Page {currentPage} of {pages} ({total} total consultations)
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pages || isLoading}
                  className={styles.pageButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
