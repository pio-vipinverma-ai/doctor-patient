import React, { useState, useEffect } from 'react';
import { ConsultationHistoryItem, getConsultationById, Consultation } from '../services/consultationService';
import styles from './ConsultationTable.module.scss';

interface ConsultationTableProps {
  consultations: ConsultationHistoryItem[];
  patientId: string;
  onPrintPrescription: (consultationId: string, prescriptionId: string) => void;
  onReuseDiagnosis: (diagnosis: string) => void;
  isLoading?: boolean;
}

export const ConsultationTable: React.FC<ConsultationTableProps> = ({
  consultations,
  patientId,
  onPrintPrescription,
  onReuseDiagnosis,
  isLoading = false
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [consultationDetails, setConsultationDetails] = useState<Map<string, Consultation>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  const toggleRow = async (consultationId: string) => {
    const newExpandedRows = new Set(expandedRows);
    
    if (expandedRows.has(consultationId)) {
      newExpandedRows.delete(consultationId);
    } else {
      newExpandedRows.add(consultationId);
      
      // Load full consultation details if not already loaded
      if (!consultationDetails.has(consultationId)) {
        setLoadingDetails(new Set(loadingDetails).add(consultationId));
        
        try {
          const fullConsultation = await getConsultationById(consultationId);
          setConsultationDetails(new Map(consultationDetails).set(consultationId, fullConsultation));
        } catch (error) {
          console.error('Failed to load consultation details:', error);
        } finally {
          const newLoadingDetails = new Set(loadingDetails);
          newLoadingDetails.delete(consultationId);
          setLoadingDetails(newLoadingDetails);
        }
      }
    }
    
    setExpandedRows(newExpandedRows);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTruncatedText = (text: string, maxLength: number = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.expandCol}></th>
              <th>Date</th>
              <th>Temp (°F)</th>
              <th>BP</th>
              <th>Pulse</th>
              <th>Diagnosis</th>
              <th>Medications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((consultation) => (
              <React.Fragment key={consultation.id}>
                {/* Main Row */}
                <tr 
                  className={`${styles.row} ${expandedRows.has(consultation.id) ? styles.expanded : ''}`}
                  onClick={() => toggleRow(consultation.id)}
                >
                  <td className={styles.expandCol}>
                    <button className={styles.expandButton}>
                      {expandedRows.has(consultation.id) ? '▼' : '▶'}
                    </button>
                  </td>
                  <td>{formatDate(consultation.date)}</td>
                  <td>{consultation.temperature.toFixed(1)}</td>
                  <td>{consultation.bp}</td>
                  <td>{consultation.pulse}</td>
                  <td className={styles.diagnosisCell}>
                    {getTruncatedText(consultation.diagnosis, 40)}
                  </td>
                  <td>{consultation.medicationCount}</td>
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrintPrescription(consultation.id, consultation.prescriptionId);
                      }}
                      disabled={!consultation.prescriptionId}
                      title="Print Prescription"
                    >
                      Print
                    </button>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedRows.has(consultation.id) && (
                  <tr className={styles.detailsRow}>
                    <td colSpan={8}>
                      {loadingDetails.has(consultation.id) ? (
                        <div className={styles.loadingDetails}>
                          <div className={styles.spinner}></div>
                          <p>Loading details...</p>
                        </div>
                      ) : (
                        <ConsultationDetails
                          consultation={consultationDetails.get(consultation.id)}
                          onReuseDiagnosis={onReuseDiagnosis}
                          onPrintPrescription={() => onPrintPrescription(consultation.id, consultation.prescriptionId)}
                        />
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {consultations.length === 0 && !isLoading && (
          <div className={styles.noData}>
            <p>No consultations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Consultation Details Component (shown when row is expanded)
interface ConsultationDetailsProps {
  consultation?: Consultation;
  onReuseDiagnosis: (diagnosis: string) => void;
  onPrintPrescription: () => void;
}

const ConsultationDetails: React.FC<ConsultationDetailsProps> = ({
  consultation,
  onReuseDiagnosis,
  onPrintPrescription
}) => {
  if (!consultation) {
    return <div className={styles.detailsContent}>No details available</div>;
  }

  return (
    <div className={styles.detailsContent}>
      <div className={styles.detailsGrid}>
        {/* Vitals Section */}
        <div className={styles.detailSection}>
          <h4>Vitals</h4>
          <div className={styles.vitalsList}>
            <div className={styles.vitalItem}>
              <span className={styles.vitalLabel}>Temperature:</span>
              <span className={styles.vitalValue}>{consultation.temperature}°F</span>
            </div>
            <div className={styles.vitalItem}>
              <span className={styles.vitalLabel}>Blood Pressure:</span>
              <span className={styles.vitalValue}>{consultation.bp}</span>
            </div>
            <div className={styles.vitalItem}>
              <span className={styles.vitalLabel}>Pulse:</span>
              <span className={styles.vitalValue}>{consultation.pulse} BPM</span>
            </div>
          </div>

          {consultation.vitalsWarnings && Object.keys(consultation.vitalsWarnings).length > 0 && (
            <div className={styles.warnings}>
              <h5>⚠️ Vital Warnings</h5>
              {consultation.vitalsWarnings.temperature && <p>{consultation.vitalsWarnings.temperature}</p>}
              {consultation.vitalsWarnings.bpSystolic && <p>{consultation.vitalsWarnings.bpSystolic}</p>}
              {consultation.vitalsWarnings.bpDiastolic && <p>{consultation.vitalsWarnings.bpDiastolic}</p>}
              {consultation.vitalsWarnings.pulse && <p>{consultation.vitalsWarnings.pulse}</p>}
            </div>
          )}
        </div>

        {/* Complaints Section */}
        <div className={styles.detailSection}>
          <h4>Complaints</h4>
          <p className={styles.detailText}>{consultation.complaints || 'No complaints recorded'}</p>
        </div>

        {/* Diagnosis Section */}
        <div className={styles.detailSection}>
          <h4>Diagnosis</h4>
          <p className={styles.detailText}>{consultation.diagnosis || 'No diagnosis recorded'}</p>
          <button
            className={styles.reuseButton}
            onClick={() => onReuseDiagnosis(consultation.diagnosis)}
            title="Copy diagnosis to new consultation"
          >
            Reuse Diagnosis
          </button>
        </div>

        {/* Medications Section */}
        <div className={styles.detailSection}>
          <h4>Medications ({consultation.medications.length})</h4>
          {consultation.medications.length > 0 ? (
            <div className={styles.medicationsList}>
              {consultation.medications.map((medication, index) => (
                <div key={index} className={styles.medicationItem}>
                  <div className={styles.medicationHeader}>
                    <span className={styles.medicationNumber}>{index + 1}.</span>
                    <span className={styles.medicationName}>{medication.name}</span>
                  </div>
                  <div className={styles.medicationDetails}>
                    <span><strong>Dosage:</strong> {medication.dosage}</span>
                    <span><strong>Frequency:</strong> {medication.frequency}</span>
                    <span><strong>Duration:</strong> {medication.duration}</span>
                    {medication.instructions && (
                      <span><strong>Instructions:</strong> {medication.instructions}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No medications prescribed</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.detailsActions}>
        <button
          className={styles.printButton}
          onClick={onPrintPrescription}
        >
          📄 Print Prescription
        </button>
      </div>
    </div>
  );
};
