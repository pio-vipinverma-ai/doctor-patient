import { pool } from '../config/database';

/**
 * Prescription Service - Database operations and PDF generation for prescriptions
 */

export interface PrescriptionData {
  id: string;
  consultationId: string;
  status: string;
  generatedAt: Date;
  printedAt: Date | null;
  patientName: string;
  patientAge: number;
  patientDOB: string;
  patientGender: string;
  patientPhone: string;
  date: Date;
  vitals: {
    temperature: number;
    bp: string;
    pulse: number;
  };
  diagnosis: string;
  complaints: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  clinicHeader: {
    name: string;
    address: string;
    phone: string;
  };
}

/**
 * Get prescription by ID with all related data
 */
export const getPrescriptionById = async (prescriptionId: string): Promise<PrescriptionData | null> => {
  const client = await pool.connect();
  
  try {
    // Get prescription with consultation, patient, and medications
    const query = `
      SELECT 
        pr.id as prescription_id,
        pr.consultation_id,
        pr.status,
        pr.generated_at,
        pr.printed_at,
        c.temperature,
        c.bp_systolic,
        c.bp_diastolic,
        c.pulse,
        c.complaints,
        c.diagnosis,
        c.created_at as consultation_date,
        p.name as patient_name,
        p.dob as patient_dob,
        p.gender as patient_gender,
        p.phone as patient_phone,
        EXTRACT(YEAR FROM age(p.dob)) as patient_age
      FROM prescriptions pr
      JOIN consultations c ON pr.consultation_id = c.id
      JOIN patients p ON c.patient_id = p.id
      WHERE pr.id = $1
    `;

    const result = await client.query(query, [prescriptionId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Get medications for this consultation
    const medicationsQuery = `
      SELECT name, dosage, frequency, duration, instructions
      FROM medications
      WHERE consultation_id = $1
      ORDER BY created_at ASC
    `;

    const medicationsResult = await client.query(medicationsQuery, [row.consultation_id]);

    // Clinic header (hardcoded for now, can be moved to config)
    const clinicHeader = {
      name: 'City Medical Clinic',
      address: '123 Main Street, Cityville, ST 12345',
      phone: '+1 (555) 123-4567',
    };

    const prescriptionData: PrescriptionData = {
      id: row.prescription_id,
      consultationId: row.consultation_id,
      status: row.status,
      generatedAt: row.generated_at,
      printedAt: row.printed_at,
      patientName: row.patient_name,
      patientAge: parseInt(row.patient_age),
      patientDOB: new Date(row.patient_dob).toISOString().split('T')[0],
      patientGender: row.patient_gender,
      patientPhone: row.patient_phone,
      date: row.consultation_date,
      vitals: {
        temperature: parseFloat(row.temperature),
        bp: `${row.bp_systolic}/${row.bp_diastolic}`,
        pulse: parseInt(row.pulse),
      },
      diagnosis: row.diagnosis,
      complaints: row.complaints,
      medications: medicationsResult.rows.map((med) => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions,
      })),
      clinicHeader,
    };

    return prescriptionData;
  } catch (error) {
    console.error('[PrescriptionService] Error fetching prescription:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Mark prescription as printed
 */
export const markAsPrinted = async (prescriptionId: string): Promise<{ id: string; printedAt: Date }> => {
  const client = await pool.connect();

  try {
    const query = `
      UPDATE prescriptions
      SET printed_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING id, printed_at
    `;

    const result = await client.query(query, [prescriptionId]);

    if (result.rows.length === 0) {
      throw new Error('Prescription not found');
    }

    return {
      id: result.rows[0].id,
      printedAt: result.rows[0].printed_at,
    };
  } catch (error) {
    console.error('[PrescriptionService] Error marking prescription as printed:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Generate HTML for prescription
 */
export const generatePrescriptionHTML = (data: PrescriptionData): string => {
  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const genderDisplay = (gender: string): string => {
    const map: { [key: string]: string } = {
      'M': 'Male',
      'F': 'Female',
      'Other': 'Other'
    };
    return map[gender] || gender;
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prescription - ${data.patientName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      background: white;
      padding: 20px;
    }
    
    .prescription-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #333;
      padding: 20px;
    }
    
    .clinic-header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    
    .clinic-header h1 {
      font-size: 24px;
      color: #0066cc;
      margin-bottom: 5px;
    }
    
    .clinic-header p {
      font-size: 12px;
      color: #666;
      margin: 2px 0;
    }
    
    .prescription-title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 20px;
      color: #333;
    }
    
    .patient-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
      padding: 10px;
      background: #f9f9f9;
      border: 1px solid #ddd;
    }
    
    .patient-info-item {
      font-size: 13px;
    }
    
    .patient-info-item strong {
      font-weight: bold;
      color: #333;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
      color: #0066cc;
      border-bottom: 1px solid #0066cc;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    
    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      padding: 10px;
      background: #f9f9f9;
      border: 1px solid #ddd;
    }
    
    .vital-item {
      font-size: 13px;
    }
    
    .vital-item strong {
      display: block;
      color: #666;
      font-size: 11px;
      text-transform: uppercase;
    }
    
    .vital-item span {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    
    .diagnosis-text {
      padding: 10px;
      background: #f9f9f9;
      border: 1px solid #ddd;
      font-size: 13px;
      min-height: 50px;
    }
    
    .medications-list {
      list-style: none;
      padding: 0;
    }
    
    .medication-item {
      padding: 12px;
      margin-bottom: 10px;
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-left: 4px solid #0066cc;
    }
    
    .medication-item .med-name {
      font-size: 15px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    
    .medication-item .med-details {
      font-size: 12px;
      color: #666;
      margin: 2px 0;
    }
    
    .signature-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    
    .signature-box {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
    }
    
    .signature-line {
      width: 200px;
      border-bottom: 2px solid #333;
      padding-top: 50px;
      text-align: center;
    }
    
    .signature-label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 11px;
      color: #999;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .prescription-container {
        border: none;
        max-width: 100%;
      }
      
      @page {
        margin: 1cm;
      }
    }
  </style>
</head>
<body>
  <div class="prescription-container">
    <!-- Clinic Header -->
    <div class="clinic-header">
      <h1>${data.clinicHeader.name}</h1>
      <p>${data.clinicHeader.address}</p>
      <p>Phone: ${data.clinicHeader.phone}</p>
    </div>
    
    <!-- Prescription Title -->
    <div class="prescription-title">Prescription</div>
    
    <!-- Patient Information -->
    <div class="patient-info">
      <div class="patient-info-item">
        <strong>Patient Name:</strong> ${data.patientName}
      </div>
      <div class="patient-info-item">
        <strong>Date:</strong> ${formatDate(data.date)}
      </div>
      <div class="patient-info-item">
        <strong>Age:</strong> ${data.patientAge} years
      </div>
      <div class="patient-info-item">
        <strong>Gender:</strong> ${genderDisplay(data.patientGender)}
      </div>
      <div class="patient-info-item">
        <strong>DOB:</strong> ${formatDate(data.patientDOB)}
      </div>
      <div class="patient-info-item">
        <strong>Phone:</strong> ${data.patientPhone}
      </div>
    </div>
    
    <!-- Vitals -->
    <div class="section">
      <div class="section-title">Vitals</div>
      <div class="vitals-grid">
        <div class="vital-item">
          <strong>Temperature</strong>
          <span>${data.vitals.temperature}°F</span>
        </div>
        <div class="vital-item">
          <strong>Blood Pressure</strong>
          <span>${data.vitals.bp} mmHg</span>
        </div>
        <div class="vital-item">
          <strong>Pulse</strong>
          <span>${data.vitals.pulse} BPM</span>
        </div>
      </div>
    </div>
    
    <!-- Complaints -->
    <div class="section">
      <div class="section-title">Complaints</div>
      <div class="diagnosis-text">${data.complaints}</div>
    </div>
    
    <!-- Diagnosis -->
    <div class="section">
      <div class="section-title">Diagnosis</div>
      <div class="diagnosis-text">${data.diagnosis}</div>
    </div>
    
    <!-- Medications -->
    <div class="section">
      <div class="section-title">Medications</div>
      <ul class="medications-list">
        ${data.medications.map((med, index) => `
        <li class="medication-item">
          <div class="med-name">${index + 1}. ${med.name} ${med.dosage}</div>
          <div class="med-details"><strong>Frequency:</strong> ${med.frequency}</div>
          <div class="med-details"><strong>Duration:</strong> ${med.duration}</div>
          <div class="med-details"><strong>Instructions:</strong> ${med.instructions}</div>
        </li>
        `).join('')}
      </ul>
    </div>
    
    <!-- Signature Section -->
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line">
          <div class="signature-label">Doctor's Signature</div>
        </div>
        <div class="signature-line">
          <div class="signature-label">Date</div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>This is a computer-generated prescription.</p>
      <p>Prescription ID: ${data.id}</p>
    </div>
  </div>
</body>
</html>
  `;

  return html.trim();
};
