import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import * as prescriptionService from '../services/prescriptionService';
import styles from './PrescriptionPage.module.scss';

export const PrescriptionPage: React.FC = () => {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [prescription, setPrescription] = useState<prescriptionService.PrescriptionData | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      if (!prescriptionId) {
        showToast('Prescription ID is missing', 'error');
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch prescription data
        const data = await prescriptionService.getPrescriptionById(prescriptionId);
        setPrescription(data);

        // Fetch HTML content for display
        const html = await prescriptionService.getPrescriptionHTML(prescriptionId);
        setHtmlContent(html);
      } catch (error: any) {
        console.error('Error fetching prescription:', error);
        showToast(error.response?.data?.error || 'Failed to load prescription', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId, navigate, showToast]);

  const handlePrint = async () => {
    try {
      setPrinting(true);
      
      // Mark as printed
      if (prescriptionId) {
        await prescriptionService.markAsPrinted(prescriptionId);
      }

      // Open print dialog
      window.print();
      
      showToast('Prescription marked as printed', 'success');
    } catch (error: any) {
      console.error('Error printing prescription:', error);
      showToast('Failed to mark prescription as printed', 'error');
    } finally {
      setPrinting(false);
    }
  };

  const handleViewHTML = () => {
    // Open prescription HTML in new window
    if (prescriptionId) {
      const url = `http://localhost:5000/api/prescriptions/${prescriptionId}/print?format=html`;
      window.open(url, '_blank');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.prescriptionPage}>
          <div className={styles.loading}>Loading prescription...</div>
        </div>
      </Layout>
    );
  }

  if (!prescription) {
    return (
      <Layout>
        <div className={styles.prescriptionPage}>
          <div className={styles.error}>Prescription not found</div>
          <button onClick={handleBackToDashboard}>Back to Dashboard</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.prescriptionPage}>
        {/* Header with actions - hide on print */}
        <div className={`${styles.header} ${styles.noPrint}`}>
          <h1>Prescription Generated</h1>
          <div className={styles.actions}>
            <button 
              className={styles.viewBtn} 
              onClick={handleViewHTML}
              title="View prescription in new window"
            >
              View Full Page
            </button>
            <button 
              className={styles.printBtn} 
              onClick={handlePrint}
              disabled={printing}
            >
              {printing ? 'Printing...' : 'Print Prescription'}
            </button>
            <button 
              className={styles.backBtn} 
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Success message - hide on print */}
        <div className={`${styles.successMessage} ${styles.noPrint}`}>
          ✅ Consultation saved successfully! Prescription ready to print.
        </div>

        {/* Prescription content - print-optimized */}
        <div className={styles.prescriptionContent}>
          {/* Clinic Header */}
          <div className={styles.clinicHeader}>
            <h1>{prescription.clinicHeader.name}</h1>
            <p>{prescription.clinicHeader.address}</p>
            <p>Phone: {prescription.clinicHeader.phone}</p>
          </div>

          {/* Prescription Title */}
          <div className={styles.prescriptionTitle}>PRESCRIPTION</div>

          {/* Patient Info */}
          <div className={styles.patientInfo}>
            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <strong>Patient Name:</strong> {prescription.patientName}
              </div>
              <div className={styles.infoItem}>
                <strong>Date:</strong> {formatDate(prescription.date)}
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <strong>Age:</strong> {prescription.patientAge} years
              </div>
              <div className={styles.infoItem}>
                <strong>DOB:</strong> {formatDate(prescription.patientDOB)}
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Vitals</h2>
            <div className={styles.vitalsGrid}>
              <div className={styles.vitalItem}>
                <strong>Temperature</strong>
                <span>{prescription.vitals.temperature}°F</span>
              </div>
              <div className={styles.vitalItem}>
                <strong>Blood Pressure</strong>
                <span>{prescription.vitals.bp} mmHg</span>
              </div>
              <div className={styles.vitalItem}>
                <strong>Pulse</strong>
                <span>{prescription.vitals.pulse} BPM</span>
              </div>
            </div>
          </div>

          {/* Complaints */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Complaints</h2>
            <div className={styles.textContent}>{prescription.complaints}</div>
          </div>

          {/* Diagnosis */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Diagnosis</h2>
            <div className={styles.textContent}>{prescription.diagnosis}</div>
          </div>

          {/* Medications */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Medications</h2>
            <div className={styles.medicationsList}>
              {prescription.medications.map((med, index) => (
                <div key={index} className={styles.medicationItem}>
                  <div className={styles.medName}>
                    {index + 1}. {med.name} {med.dosage}
                  </div>
                  <div className={styles.medDetails}>
                    <strong>Frequency:</strong> {med.frequency}
                  </div>
                  <div className={styles.medDetails}>
                    <strong>Duration:</strong> {med.duration}
                  </div>
                  <div className={styles.medDetails}>
                    <strong>Instructions:</strong> {med.instructions}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Section */}
          <div className={styles.signatureSection}>
            <div className={styles.signatureBox}>
              <div className={styles.signatureLine}>
                <div className={styles.signatureLabel}>Doctor's Signature</div>
              </div>
              <div className={styles.signatureLine}>
                <div className={styles.signatureLabel}>Date</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p>This is a computer-generated prescription.</p>
            <p>Prescription ID: {prescription.id}</p>
            {prescription.printedAt && (
              <p>Printed: {formatDate(prescription.printedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
