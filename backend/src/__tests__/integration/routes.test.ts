import request from 'supertest';
import { createApp } from '../../server';
import { pool } from '../../config/database';
import { Express } from 'express';
import * as crypto from '../../utils/crypto';
import * as jwt from '../../utils/jwt';

// Mock database
jest.mock('../../config/database');

// Mock crypto utilities
jest.mock('../../utils/crypto');

// Mock JWT utilities
jest.mock('../../utils/jwt');

const mockPool = pool as any;
const mockCrypto = crypto as jest.Mocked<typeof crypto>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Skip auth middleware for testing
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: '550e8400-e29b-41d4-a716-446655440000', username: 'doctor' };
    next();
  },
}));

describe('Integration Tests - API Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 with tokens on successful login', async () => {
      // Arrange
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'doctor',
        email: 'doctor@clinic.com',
        password_hash: '$2b$10$YourHashedPasswordHere',
        name: 'Dr. Smith',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockUser],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Mock password comparison
      mockCrypto.comparePassword.mockResolvedValueOnce(true);

      // Mock token generation  
      mockJwt.generateAccessToken.mockReturnValueOnce('mock-access-token');
      mockJwt.generateRefreshToken.mockReturnValueOnce('mock-refresh-token');

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'doctor',
          password: 'password123'
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 with invalid credentials', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 with missing fields', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'doctor'
          // Missing password
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/patients', () => {
    const validToken = 'Bearer valid-token-here';

    beforeEach(() => {
      // Mock JWT verification middleware
      jest.mock('../../middleware/auth', () => ({
        authenticateToken: (req: any, _res: any, next: any) => {
          req.user = { userId: '550e8400-e29b-41d4-a716-446655440000' };
          next();
        }
      }));
    });

    it('should create a new patient successfully', async () => {
      // Arrange
      const newPatientData = {
        name: 'John Doe',
        dob: '1980-01-15',
        gender: 'M',
        phone: '9876543210',
        email: 'john@example.com',
        address: '123 Main St'
      };

      const mockCreatedPatient = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        ...newPatientData,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockCreatedPatient],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', validToken)
        .send(newPatientData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.patient).toHaveProperty('id');
      expect(response.body.patient.name).toBe('John Doe');
    });

    it('should return 409 on duplicate phone number', async () => {
      // Arrange
      const duplicatePatientData = {
        name: 'Jane Doe',
        dob: '1985-03-20',
        gender: 'F',
        phone: '9876543210', // Duplicate
        email: 'jane@example.com'
      };

      const dbError: any = new Error('Duplicate key');
      dbError.code = '23505';
      dbError.constraint = 'patients_phone_key';

      mockPool.query.mockRejectedValueOnce(dbError);

      // Act
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', validToken)
        .send(duplicatePatientData);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Phone number already exists');
    });

    it('should return 400 with validation errors', async () => {
      // Act
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', validToken)
        .send({
          name: 'John Doe',
          // Missing required fields: dob, gender, phone
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/patients/search', () => {
    const validToken = 'Bearer valid-token-here';

    it('should return search results within 100ms (performance)', async () => {
      // Arrange
      const mockResults = [
        {
          id: '1',
          name: 'John Doe',
          age: 46,
          gender: 'M',
          phone: '9876543210',
          lastvisit: '2026-05-01T10:00:00.000Z'
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockResults,
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: []
      } as any);

      // Act
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/patients/search?q=john')
        .set('Authorization', validToken);
      const endTime = Date.now();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.patients).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(100); // Performance check
    });

    it('should handle empty search results', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: []
      } as any);

      // Act
      const response = await request(app)
        .get('/api/patients/search?q=nonexistent')
        .set('Authorization', validToken);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.patients).toHaveLength(0);
    });
  });

  describe('POST /api/appointments', () => {
    const validToken = 'Bearer valid-token-here';

    it('should schedule appointment successfully', async () => {
      // Arrange
      const appointmentData = {
        patientId: '550e8400-e29b-41d4-a716-446655440001',
        scheduledTime: '2026-05-15T10:00:00Z',
        reason: 'Regular checkup'
      };

      const mockAppointment = {
        id: '550e8400-e29b-41d4-a716-446655440100',
        patient_id: appointmentData.patientId,
        scheduled_time: new Date(appointmentData.scheduledTime),
        status: 'Scheduled',
        reason: appointmentData.reason,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock patient existence check
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: appointmentData.patientId }],
        command: 'SELECT',
        rowCount: 1
      } as any);

      // Mock double-booking check (no conflicts)
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0
      } as any);

      // Mock appointment insert
      mockPool.query.mockResolvedValueOnce({
        rows: [mockAppointment],
        command: 'INSERT',
        rowCount: 1
      } as any);

      // Act
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', validToken)
        .send(appointmentData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.appointment).toHaveProperty('id');
      expect(response.body.appointment.status).toBe('Scheduled');
    });

    it('should return 409 on double-booking', async () => {
      // Arrange
      // Mock patient existence check
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: '550e8400-e29b-41d4-a716-446655440001' }],
        command: 'SELECT',
        rowCount: 1
      } as any);

      // Mock double-booking check (conflict found)
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 'existing-appointment' }],
        command: 'SELECT',
        rowCount: 1
      } as any);

      // Act
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', validToken)
        .send({
          patientId: '550e8400-e29b-41d4-a716-446655440001',
          scheduledTime: '2026-05-15T10:00:00Z',
          reason: 'Checkup'
        });

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Patient already has appointment at this time');
    });
  });

  describe('POST /api/consultations', () => {
    const validToken = 'Bearer valid-token-here';

    it('should create consultation successfully', async () => {
      // Arrange
      const consultationData = {
        patientId: '550e8400-e29b-41d4-a716-446655440001',
        temperature: 98.6,
        bpSystolic: 120,
        bpDiastolic: 80,
        pulse: 72,
        complaints: 'Headache',
        diagnosis: 'Viral infection',
        medications: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after meals'
          }
        ]
      };

      const mockConsultation = {
        id: '550e8400-e29b-41d4-a716-446655440200',
        patient_id: consultationData.patientId,
        appointment_id: null,
        temperature: consultationData.temperature,
        bp_systolic: consultationData.bpSystolic,
        bp_diastolic: consultationData.bpDiastolic,
        pulse: consultationData.pulse,
        complaints: consultationData.complaints,
        diagnosis: consultationData.diagnosis,
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockMedication = {
        id: 'med-1',
        consultation_id: mockConsultation.id,
        ...consultationData.medications[0],
        created_at: new Date()
      };

      const mockPrescription = {
        id: 'rx-1',
        consultation_id: mockConsultation.id,
        status: 'Generated',
        generated_at: new Date(),
        printed_at: null,
        updated_at: new Date()
      };

      // Mock patient existence check
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: consultationData.patientId }]
      });

      // Mock transaction client
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({})  // BEGIN
          .mockResolvedValueOnce({ rows: [mockConsultation] })  // INSERT consultation
          .mockResolvedValueOnce({ rows: [mockMedication] })  // INSERT medication
          .mockResolvedValueOnce({ rows: [mockPrescription] })  // INSERT prescription
          .mockResolvedValueOnce({}),  // COMMIT
        release: jest.fn()
      };
      mockPool.connect.mockResolvedValueOnce(mockClient);

      // Act
      const response = await request(app)
        .post('/api/consultations')
        .set('Authorization', validToken)
        .send(consultationData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.consultation).toHaveProperty('id');
      expect(response.body.medications).toHaveLength(1);
    });

    it('should validate vital signs', async () => {
      // Act
      const response = await request(app)
        .post('/api/consultations')
        .set('Authorization', validToken)
        .send({
          patientId: '550e8400-e29b-41d4-a716-446655440001',
          temperature: 110, // Invalid
          bpSystolic: 200,  // Invalid
          bpDiastolic: 80,
          pulse: 150,       // Invalid
          complaints: 'Test',
          diagnosis: 'Test',
          medications: []
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      // Act
      const response = await request(app).get('/health');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});
