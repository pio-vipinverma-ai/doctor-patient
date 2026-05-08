import { pool } from '../config/database';
import { stringify } from 'csv-stringify/sync';
import PDFDocument = require('pdfkit');

/**
 * Export Service - Generate CSV and PDF reports
 */

interface PatientExportRow {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: Date;
}

interface ConsultationExportRow {
  date: Date;
  patient: string;
  age: number;
  temperature: number;
  bp: string;
  pulse: number;
  diagnosis: string;
  medications: string;
}

/**
 * Export patients to CSV
 */
export const exportPatientsToCSV = async (fromDate?: string, toDate?: string): Promise<string> => {
  let query = `
    SELECT 
      p.name,
      EXTRACT(YEAR FROM age(p.dob))::INTEGER as age,
      p.gender,
      p.phone,
      p.email,
      p.address,
      p.created_at
    FROM patients p
    WHERE 1=1
  `;

  const values: any[] = [];
  let paramIndex = 1;

  if (fromDate) {
    query += ` AND p.created_at >= $${paramIndex}`;
    values.push(fromDate);
    paramIndex++;
  }

  if (toDate) {
    query += ` AND p.created_at <= $${paramIndex}`;
    values.push(toDate);
    paramIndex++;
  }

  query += ` ORDER BY p.created_at DESC`;

  const result = await pool.query<PatientExportRow>(query, values);

  // Format data for CSV
  const csvData = result.rows.map(row => ({
    'Name': row.name,
    'Age': row.age,
    'Gender': row.gender === 'M' ? 'Male' : row.gender === 'F' ? 'Female' : 'Other',
    'Phone': row.phone,
    'Email': row.email || '',
    'Address': row.address || '',
    'Created Date': new Date(row.created_at).toISOString().split('T')[0]
  }));

  // Generate CSV with BOM for Excel compatibility
  const csv = '\uFEFF' + stringify(csvData, {
    header: true,
    columns: ['Name', 'Age', 'Gender', 'Phone', 'Email', 'Address', 'Created Date']
  });

  return csv;
};

/**
 * Export consultations to CSV
 */
export const exportConsultationsToCSV = async (fromDate?: string, toDate?: string): Promise<string> => {
  let query = `
    SELECT 
      c.created_at as date,
      p.name as patient,
      EXTRACT(YEAR FROM age(p.dob))::INTEGER as age,
      c.temperature,
      CONCAT(c.bp_systolic, '/', c.bp_diastolic) as bp,
      c.pulse,
      c.diagnosis,
      (
        SELECT STRING_AGG(
          CONCAT(m.name, ' - ', m.frequency, ' for ', m.duration),
          '; '
        )
        FROM medications m
        WHERE m.consultation_id = c.id
      ) as medications
    FROM consultations c
    JOIN patients p ON c.patient_id = p.id
    WHERE 1=1
  `;

  const values: any[] = [];
  let paramIndex = 1;

  if (fromDate) {
    query += ` AND c.created_at >= $${paramIndex}`;
    values.push(fromDate);
    paramIndex++;
  }

  if (toDate) {
    query += ` AND c.created_at <= $${paramIndex}`;
    values.push(toDate);
    paramIndex++;
  }

  query += ` ORDER BY c.created_at DESC`;

  const result = await pool.query<ConsultationExportRow>(query, values);

  // Format data for CSV
  const csvData = result.rows.map(row => ({
    'Date': new Date(row.date).toISOString().split('T')[0],
    'Patient': row.patient,
    'Age': row.age,
    'Temperature': `${row.temperature}°F`,
    'BP': row.bp,
    'Pulse': row.pulse,
    'Diagnosis': row.diagnosis,
    'Medications': row.medications || 'None'
  }));

  // Generate CSV with BOM for Excel compatibility
  const csv = '\uFEFF' + stringify(csvData, {
    header: true,
    columns: ['Date', 'Patient', 'Age', 'Temperature', 'BP', 'Pulse', 'Diagnosis', 'Medications']
  });

  return csv;
};

/**
 * Export consultations to PDF
 */
export const exportConsultationsToPDF = async (fromDate?: string, toDate?: string): Promise<typeof PDFDocument> => {
  // Fetch consultation data
  let query = `
    SELECT 
      c.created_at as date,
      p.name as patient,
      EXTRACT(YEAR FROM age(p.dob))::INTEGER as age,
      c.temperature,
      CONCAT(c.bp_systolic, '/', c.bp_diastolic) as bp,
      c.pulse,
      c.diagnosis,
      (
        SELECT STRING_AGG(
          CONCAT(m.name, ' - ', m.dosage, ', ', m.frequency, ' for ', m.duration),
          '; '
        )
        FROM medications m
        WHERE m.consultation_id = c.id
      ) as medications
    FROM consultations c
    JOIN patients p ON c.patient_id = p.id
    WHERE 1=1
  `;

  const values: any[] = [];
  let paramIndex = 1;

  if (fromDate) {
    query += ` AND c.created_at >= $${paramIndex}`;
    values.push(fromDate);
    paramIndex++;
  }

  if (toDate) {
    query += ` AND c.created_at <= $${paramIndex}`;
    values.push(toDate);
    paramIndex++;
  }

  query += ` ORDER BY c.created_at DESC`;

  const result = await pool.query<ConsultationExportRow>(query, values);

  // Calculate statistics
  const totalConsultations = result.rows.length;
  const avgTemp = totalConsultations > 0
    ? (result.rows.reduce((sum, row) => sum + row.temperature, 0) / totalConsultations).toFixed(1)
    : '0';
  const avgPulse = totalConsultations > 0
    ? Math.round(result.rows.reduce((sum, row) => sum + row.pulse, 0) / totalConsultations)
    : 0;

  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  // Title
  doc.fontSize(20)
    .font('Helvetica-Bold')
    .text('Consultations Report', { align: 'center' });

  doc.moveDown();

  // Date range
  const fromDateStr = fromDate ? new Date(fromDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Beginning';
  const toDateStr = toDate ? new Date(toDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Present';
  
  doc.fontSize(12)
    .font('Helvetica')
    .text(`From: ${fromDateStr}  To: ${toDateStr}`, { align: 'center' });
  
  doc.moveDown();

  // Summary statistics
  doc.fontSize(10)
    .font('Helvetica-Bold')
    .text('Summary Statistics:', { underline: true });
  
  doc.font('Helvetica')
    .text(`Total Consultations: ${totalConsultations}`)
    .text(`Average Temperature: ${avgTemp}°F`)
    .text(`Average Pulse: ${avgPulse} BPM`);

  doc.moveDown();

  // Table header
  const tableTop = doc.y;
  const columnWidths = {
    date: 70,
    patient: 100,
    age: 35,
    temp: 50,
    bp: 50,
    pulse: 45,
    diagnosis: 140
  };

  let currentY = tableTop;

  // Draw table header
  doc.fontSize(9)
    .font('Helvetica-Bold');

  let currentX = 50;
  doc.text('Date', currentX, currentY, { width: columnWidths.date, align: 'left' });
  currentX += columnWidths.date;
  doc.text('Patient', currentX, currentY, { width: columnWidths.patient, align: 'left' });
  currentX += columnWidths.patient;
  doc.text('Age', currentX, currentY, { width: columnWidths.age, align: 'left' });
  currentX += columnWidths.age;
  doc.text('Temp', currentX, currentY, { width: columnWidths.temp, align: 'left' });
  currentX += columnWidths.temp;
  doc.text('BP', currentX, currentY, { width: columnWidths.bp, align: 'left' });
  currentX += columnWidths.bp;
  doc.text('Pulse', currentX, currentY, { width: columnWidths.pulse, align: 'left' });
  currentX += columnWidths.pulse;
  doc.text('Diagnosis', currentX, currentY, { width: columnWidths.diagnosis, align: 'left' });

  currentY += 20;

  // Draw horizontal line
  doc.moveTo(50, currentY)
    .lineTo(545, currentY)
    .stroke();

  currentY += 5;

  // Table rows
  doc.font('Helvetica')
    .fontSize(8);

  for (const row of result.rows) {
    // Check if we need a new page
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    currentX = 50;
    const rowDate = new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' });
    
    doc.text(rowDate, currentX, currentY, { width: columnWidths.date, align: 'left' });
    currentX += columnWidths.date;
    doc.text(row.patient.substring(0, 15), currentX, currentY, { width: columnWidths.patient, align: 'left' });
    currentX += columnWidths.patient;
    doc.text(row.age.toString(), currentX, currentY, { width: columnWidths.age, align: 'left' });
    currentX += columnWidths.age;
    doc.text(`${row.temperature}°F`, currentX, currentY, { width: columnWidths.temp, align: 'left' });
    currentX += columnWidths.temp;
    doc.text(row.bp, currentX, currentY, { width: columnWidths.bp, align: 'left' });
    currentX += columnWidths.bp;
    doc.text(row.pulse.toString(), currentX, currentY, { width: columnWidths.pulse, align: 'left' });
    currentX += columnWidths.pulse;
    doc.text(row.diagnosis.substring(0, 30), currentX, currentY, { width: columnWidths.diagnosis, align: 'left' });

    currentY += 15;
  }

  // Footer with page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8)
      .text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
  }

  // Finalize PDF
  doc.end();

  return doc;
};

/**
 * Get current date in YYYYMMDD format for filenames
 */
export const getDateString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};
