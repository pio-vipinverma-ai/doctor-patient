import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { useToast } from '../context/ToastContext';
import {
  exportPatients,
  exportConsultations,
  downloadFile,
  generateFilename,
  ExportType,
  ExportFormat
} from '../services/exportService';
import styles from './ExportPage.module.scss';

export const ExportPage: React.FC = () => {
  const { showToast } = useToast();

  // State
  const [exportType, setExportType] = useState<ExportType>('consultations');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

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

  const handleDateFilterApply = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
  };

  const handleDateFilterReset = () => {
    setFromDate(getDefaultFromDate());
    setToDate(getDefaultToDate());
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let blob: Blob;

      // Call appropriate export function
      if (exportType === 'patients') {
        blob = await exportPatients(exportFormat, fromDate, toDate);
      } else {
        blob = await exportConsultations(exportFormat, fromDate, toDate);
      }

      // Generate filename and download
      const filename = generateFilename(exportType, exportFormat);
      downloadFile(blob, filename);

      // Show success message
      showToast(`Successfully exported ${exportType} as ${exportFormat.toUpperCase()}`, 'success');
      showToast(`File saved: ${filename}`, 'info', 6000);
    } catch (error: any) {
      showToast(error.message || 'Failed to export data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Get description based on export type
  const getTypeDescription = (type: ExportType): string => {
    if (type === 'patients') {
      return 'Export patient demographics including name, age, gender, contact information, and registration date.';
    }
    return 'Export consultation records including patient details, vitals, diagnosis, and medications.';
  };

  // Get format description
  const getFormatDescription = (format: ExportFormat): string => {
    if (format === 'csv') {
      return 'Comma-separated values file that opens in Excel, Google Sheets, or any spreadsheet application.';
    }
    return 'PDF document with formatted table and summary statistics (consultations only).';
  };

  // Check if PDF is available for selected type
  const isPdfAvailable = exportType === 'consultations';

  return (
    <Layout>
      <div className={styles.exportPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>Export Data</h1>
          <p className={styles.subtitle}>
            Export patient or consultation data in CSV or PDF format
          </p>
        </div>

        <div className={styles.exportContainer}>
          {/* Export Type Selection */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Select Export Type</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="exportType"
                  value="patients"
                  checked={exportType === 'patients'}
                  onChange={(e) => {
                    setExportType(e.target.value as ExportType);
                    // Reset to CSV if switching to patients (PDF not available)
                    if (e.target.value === 'patients' && exportFormat === 'pdf') {
                      setExportFormat('csv');
                    }
                  }}
                />
                <div className={styles.radioContent}>
                  <span className={styles.radioLabel}>Export Patients</span>
                  <span className={styles.radioDescription}>
                    {getTypeDescription('patients')}
                  </span>
                </div>
              </label>

              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="exportType"
                  value="consultations"
                  checked={exportType === 'consultations'}
                  onChange={(e) => setExportType(e.target.value as ExportType)}
                />
                <div className={styles.radioContent}>
                  <span className={styles.radioLabel}>Export Consultations</span>
                  <span className={styles.radioDescription}>
                    {getTypeDescription('consultations')}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Format Selection */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Select Format</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                />
                <div className={styles.radioContent}>
                  <span className={styles.radioLabel}>CSV (Comma-Separated Values)</span>
                  <span className={styles.radioDescription}>
                    {getFormatDescription('csv')}
                  </span>
                </div>
              </label>

              <label className={`${styles.radioOption} ${!isPdfAvailable ? styles.disabled : ''}`}>
                <input
                  type="radio"
                  name="exportFormat"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  disabled={!isPdfAvailable}
                />
                <div className={styles.radioContent}>
                  <span className={styles.radioLabel}>
                    PDF (Portable Document Format)
                    {!isPdfAvailable && <span className={styles.badge}>Consultations Only</span>}
                  </span>
                  <span className={styles.radioDescription}>
                    {getFormatDescription('pdf')}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Select Date Range</h2>
            <DateRangeFilter
              fromDate={fromDate}
              toDate={toDate}
              onApply={handleDateFilterApply}
              onReset={handleDateFilterReset}
            />
            <p className={styles.dateHint}>
              Default: Last 90 days (from {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()})
            </p>
          </div>

          {/* Export Button */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Export Data</h2>
            <div className={styles.exportActions}>
              <button
                className={styles.exportButton}
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <span className={styles.downloadIcon}>⬇</span>
                    Export Data
                  </>
                )}
              </button>
              <p className={styles.exportHint}>
                {isExporting
                  ? 'Generating your export file...'
                  : `Click to export ${exportType} as ${exportFormat.toUpperCase()}`}
              </p>
            </div>
          </div>

          {/* Export Info */}
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>Export Information</h3>
            <div className={styles.infoContent}>
              <div className={styles.infoItem}>
                <strong>Export Type:</strong> {exportType === 'patients' ? 'Patients' : 'Consultations'}
              </div>
              <div className={styles.infoItem}>
                <strong>Format:</strong> {exportFormat.toUpperCase()}
              </div>
              <div className={styles.infoItem}>
                <strong>Date Range:</strong> {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
              </div>
              <div className={styles.infoItem}>
                <strong>Filename:</strong> {generateFilename(exportType, exportFormat)}
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className={styles.helpSection}>
            <h3 className={styles.helpTitle}>Need Help?</h3>
            <ul className={styles.helpList}>
              <li>CSV files can be opened in Microsoft Excel, Google Sheets, or any spreadsheet application</li>
              <li>PDF files include formatted tables and are suitable for printing or sharing</li>
              <li>Exports are generated on-demand and are not stored on the server</li>
              <li>Date filtering applies to the creation/consultation date</li>
              <li>Large exports may take a few seconds to generate</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};
