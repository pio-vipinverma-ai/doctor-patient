import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/layout/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import * as prescriptionService from '../services/prescriptionService';
import html2pdf from 'html2pdf.js';
import styles from './PrescriptionPage.module.scss';

export const PrescriptionPage: React.FC = () => {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const prescriptionRef = useRef<HTMLDivElement>(null);
  
  const [prescription, setPrescription] = useState<prescriptionService.PrescriptionData | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadPDF = async () => {
    try {
      if (!prescriptionId || !prescriptionRef.current) return;

      setDownloading(true);
      showToast('Generating PDF...', 'info');

      // Mark as printed
      await prescriptionService.markAsPrinted(prescriptionId);

      // Clone the element
      const element = prescriptionRef.current;

      // Configure PDF options with better style preservation
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `prescription_${prescriptionId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 3,
          useCORS: true,
          logging: false,
          letterRendering: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          scrollY: 0,
          scrollX: 0,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          onclone: (clonedDoc: Document) => {
            // Get the cloned element
            const clonedElement = clonedDoc.querySelector('[class*="prescriptionContent"]') as HTMLElement;
            if (clonedElement) {
              // Force styles to be visible
              clonedElement.style.display = 'block';
              clonedElement.style.visibility = 'visible';
              clonedElement.style.opacity = '1';
            }
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: '.no-break'
        }
      };

      // Generate and download PDF
      await html2pdf().set(opt).from(element).save();

      showToast('PDF downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      showToast('Failed to download PDF', 'error');
    } finally {
      setDownloading(false);
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
              className={styles.downloadBtn} 
              onClick={handleDownloadPDF}
              disabled={downloading}
              title="Download prescription as PDF"
            >
              {downloading ? 'Downloading...' : 'Download PDF'}
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
        <div 
          ref={prescriptionRef} 
          className={styles.prescriptionContent}
          style={{
            background: 'white',
            padding: '40px',
            border: '2px solid #333',
            maxWidth: '900px',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            colorAdjust: 'exact'
          } as React.CSSProperties}
        >
          {/* Clinic Header */}
          <div 
            className={styles.clinicHeader}
            style={{
              textAlign: 'center',
              borderBottom: '2px solid #333',
              paddingBottom: '15px',
              marginBottom: '20px'
            } as React.CSSProperties}
          >
            <h1 style={{
              fontSize: '26px',
              color: '#0066cc',
              marginBottom: '5px',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            } as React.CSSProperties}>{prescription.clinicHeader.name}</h1>
            <p style={{ fontSize: '13px', color: '#666', margin: '3px 0' }}>{prescription.clinicHeader.address}</p>
            <p style={{ fontSize: '13px', color: '#666', margin: '3px 0' }}>Phone: {prescription.clinicHeader.phone}</p>
          </div>

          {/* Prescription Title */}
          <div 
            className={styles.prescriptionTitle}
            style={{
              textAlign: 'center',
              fontSize: '22px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginBottom: '20px',
              color: '#333',
              letterSpacing: '2px'
            } as React.CSSProperties}
          >PRESCRIPTION</div>

          {/* Patient Info */}
          <div 
            className={styles.patientInfo}
            style={{
              marginBottom: '20px',
              padding: '15px',
              background: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '4px',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            } as React.CSSProperties}
          >
            <div className={styles.infoRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
              <div className={styles.infoItem} style={{ fontSize: '14px' }}>
                <strong style={{ fontWeight: 600, color: '#333' }}>Patient Name:</strong> {prescription.patientName}
              </div>
              <div className={styles.infoItem} style={{ fontSize: '14px' }}>
                <strong style={{ fontWeight: 600, color: '#333' }}>Date:</strong> {formatDate(prescription.date)}
              </div>
            </div>
            <div className={styles.infoRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className={styles.infoItem} style={{ fontSize: '14px' }}>
                <strong style={{ fontWeight: 600, color: '#333' }}>Age:</strong> {prescription.patientAge} years
              </div>
              <div className={styles.infoItem} style={{ fontSize: '14px' }}>
                <strong style={{ fontWeight: 600, color: '#333' }}>DOB:</strong> {formatDate(prescription.patientDOB)}
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div className={styles.section} style={{ marginBottom: '20px' }}>
            <h2 
              className={styles.sectionTitle}
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#0066cc',
                borderBottom: '2px solid #0066cc',
                paddingBottom: '5px',
                marginBottom: '12px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              } as React.CSSProperties}
            >Vitals</h2>
            <div 
              className={styles.vitalsGrid}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                padding: '15px',
                background: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '4px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              } as React.CSSProperties}
            >
              <div className={styles.vitalItem} style={{ textAlign: 'center' }}>
                <strong style={{ display: 'block', color: '#666', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>Temperature</strong>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{prescription.vitals.temperature}°F</span>
              </div>
              <div className={styles.vitalItem} style={{ textAlign: 'center' }}>
                <strong style={{ display: 'block', color: '#666', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>Blood Pressure</strong>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{prescription.vitals.bp} mmHg</span>
              </div>
              <div className={styles.vitalItem} style={{ textAlign: 'center' }}>
                <strong style={{ display: 'block', color: '#666', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>Pulse</strong>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{prescription.vitals.pulse} BPM</span>
              </div>
            </div>
          </div>

          {/* Complaints */}
          <div className={styles.section} style={{ marginBottom: '20px' }}>
            <h2 
              className={styles.sectionTitle}
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#0066cc',
                borderBottom: '2px solid #0066cc',
                paddingBottom: '5px',
                marginBottom: '12px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              } as React.CSSProperties}
            >Complaints</h2>
            <div 
              className={styles.textContent}
              style={{
                padding: '12px',
                background: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                lineHeight: '1.6',
                minHeight: '50px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              } as React.CSSProperties}
            >{prescription.complaints}</div>
          </div>

          {/* Diagnosis */}
          <div className={styles.section} style={{ marginBottom: '20px' }}>
            <h2 
              className={styles.sectionTitle}
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#0066cc',
                borderBottom: '2px solid #0066cc',
                paddingBottom: '5px',
                marginBottom: '12px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              } as React.CSSProperties}
            >Diagnosis</h2>
            <div 
              className={styles.textContent}
              style={{
                padding: '12px',
                background: '#f9f9f9',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                lineHeight: '1.6',
                minHeight: '50px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              } as React.CSSProperties}
            >{prescription.diagnosis}</div>
          </div>

          {/* Medications */}
          <div className={styles.section} style={{ marginBottom: '20px' }}>
            <h2 
              className={styles.sectionTitle}
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#0066cc',
                borderBottom: '2px solid #0066cc',
                paddingBottom: '5px',
                marginBottom: '12px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              } as React.CSSProperties}
            >Medications</h2>
            <div className={styles.medicationsList}>
              {prescription.medications.map((med, index) => (
                <div 
                  key={index} 
                  className={styles.medicationItem}
                  style={{
                    padding: '15px',
                    marginBottom: '12px',
                    background: '#f9f9f9',
                    border: '1px solid #ddd',
                    borderLeft: '4px solid #0066cc',
                    borderRadius: '4px',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  } as React.CSSProperties}
                >
                  <div className={styles.medName} style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                    {index + 1}. {med.name} {med.dosage}
                  </div>
                  <div className={styles.medDetails} style={{ fontSize: '13px', color: '#666', margin: '4px 0' }}>
                    <strong style={{ color: '#333' }}>Frequency:</strong> {med.frequency}
                  </div>
                  <div className={styles.medDetails} style={{ fontSize: '13px', color: '#666', margin: '4px 0' }}>
                    <strong style={{ color: '#333' }}>Duration:</strong> {med.duration}
                  </div>
                  <div className={styles.medDetails} style={{ fontSize: '13px', color: '#666', margin: '4px 0' }}>
                    <strong style={{ color: '#333' }}>Instructions:</strong> {med.instructions}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Section */}
          <div 
            className={styles.signatureSection}
            style={{
              marginTop: '50px',
              paddingTop: '20px',
              borderTop: '1px solid #ddd'
            } as React.CSSProperties}
          >
            <div 
              className={styles.signatureBox}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '60px'
              } as React.CSSProperties}
            >
              <div 
                className={styles.signatureLine}
                style={{
                  width: '200px',
                  borderBottom: '2px solid #333',
                  paddingTop: '50px',
                  textAlign: 'center'
                } as React.CSSProperties}
              >
                <div className={styles.signatureLabel} style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Doctor's Signature</div>
              </div>
              <div 
                className={styles.signatureLine}
                style={{
                  width: '200px',
                  borderBottom: '2px solid #333',
                  paddingTop: '50px',
                  textAlign: 'center'
                } as React.CSSProperties}
              >
                <div className={styles.signatureLabel} style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Date</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className={styles.footer}
            style={{
              marginTop: '30px',
              paddingTop: '15px',
              borderTop: '1px solid #ddd',
              textAlign: 'center',
              fontSize: '11px',
              color: '#999'
            } as React.CSSProperties}
          >
            <p style={{ margin: '5px 0' }}>This is a computer-generated prescription.</p>
            <p style={{ margin: '5px 0' }}>Prescription ID: {prescription.id}</p>
            {prescription.printedAt && (
              <p style={{ margin: '5px 0' }}>Printed: {formatDate(prescription.printedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
