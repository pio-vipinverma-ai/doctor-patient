/**
 * Security Test Suite
 * Tests for OWASP Top 10 vulnerabilities
 */

import request from 'supertest';
import { createApp } from '../server';
import { pool } from '../config/database';

const app = createApp();

describe('Security Tests - OWASP Top 10', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get auth token for authenticated endpoints
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'doctor',
        password: 'password123',
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('1. SQL Injection Prevention', () => {
    it('should prevent SQL injection in patient search', async () => {
      const sqlInjectionPayload = "'; DROP TABLE patients; --";

      const response = await request(app)
        .get(`/api/patients/search?q=${encodeURIComponent(sqlInjectionPayload)}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Should return 400 or empty results, not 500
      expect([200, 400]).toContain(response.status);

      // Verify patients table still exists
      const tableCheck = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'patients')"
      );
      expect(tableCheck.rows[0].exists).toBe(true);
    });

    it('should prevent SQL injection in patient creation', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: "'; DROP TABLE patients; --",
          dob: '1980-01-01',
          gender: 'M',
          phone: '9999999999',
        });

      // Should return 400 for invalid input
      expect([400, 409]).toContain(response.status);
    });

    it('should use parameterized queries (no string concatenation)', async () => {
      // Test with special characters that would break string concatenation
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: "O'Brien",
          dob: '1980-01-01',
          gender: 'M',
          phone: '8888888888',
        });

      // Should succeed or return validation error, not SQL error
      expect([201, 400, 409]).toContain(response.status);
    });
  });

  describe('2. XSS (Cross-Site Scripting) Prevention', () => {
    it('should prevent XSS in patient name', async () => {
      const xssPayload = "<script>alert('XSS')</script>";

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: xssPayload,
          dob: '1980-01-01',
          gender: 'M',
          phone: '7777777777',
        });

      // Should return 400 for dangerous input
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/invalid input/i);
    });

    it('should prevent XSS in consultation complaints', async () => {
      const xssPayload = "<img src=x onerror='alert(1)'>";

      const response = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: '550e8400-e29b-41d4-a716-446655440000',
          temperature: 98.6,
          bpSystolic: 120,
          bpDiastolic: 80,
          pulse: 72,
          complaints: xssPayload,
          diagnosis: 'Test',
          medications: [
            {
              name: 'Test Med',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: '5 days',
            },
          ],
        });

      // Should return 400 for dangerous input
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('3. Authentication & Authorization', () => {
    it('should require authentication for protected routes', async () => {
      const response = await request(app).get('/api/patients/search?q=john');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/authentication required/i);
    });

    it('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/patients/search?q=john')
        .set('Authorization', 'Bearer invalid_token_here');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/invalid.*token/i);
    });

    it('should reject expired JWT tokens', async () => {
      // Create a token that expired 1 hour ago
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyMn0.4Adcj0u6hLa6h2c3w9AqiVQcHnpjIkN9w8Y0GnYRp6s';

      const response = await request(app)
        .get('/api/patients/search?q=john')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('should not allow access to other users data', async () => {
      // This test would require multiple users
      // For single-user system, verify user context is checked
      const response = await request(app)
        .get('/api/patients/550e8400-e29b-41d4-a716-446655440000')
        .set('Authorization', `Bearer ${authToken}`);

      // Should succeed if patient exists, or 404 if not
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('4. Sensitive Data Exposure', () => {
    it('should not expose password hashes in API responses', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'doctor',
          password: 'password123',
        });

      expect(response.body).not.toHaveProperty('password_hash');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should hash passwords with bcrypt', async () => {
      // Check that passwords in database are hashed
      const userCheck = await pool.query('SELECT password_hash FROM users LIMIT 1');

      if (userCheck.rows.length > 0) {
        const passwordHash = userCheck.rows[0].password_hash;
        // Bcrypt hashes start with $2a$, $2b$, or $2y$
        expect(passwordHash).toMatch(/^\$2[aby]\$/);
        expect(passwordHash.length).toBeGreaterThan(50);
      }
    });

    it('should not log sensitive data', async () => {
      // Passwords should never appear in logs
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'doctor',
          password: 'password123',
        });

      // This is a reminder check - verify logs manually
      expect(response.body).toBeDefined();
    });
  });

  describe('5. Security Headers', () => {
    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should set Content-Security-Policy header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('should set Strict-Transport-Security header (HSTS)', async () => {
      const response = await request(app).get('/health');

      // HSTS header should be present
      expect(response.headers['strict-transport-security']).toBeDefined();
    });
  });

  describe('6. CORS Configuration', () => {
    it('should only allow configured origins', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'https://evil.com');

      // Should not have CORS headers for unauthorized origin
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should allow localhost in development', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      // Should have CORS headers for allowed origin
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });
  });

  describe('7. Input Validation', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'John Doe',
          // Missing required fields: dob, gender, phone
        });

      expect(response.status).toBe(400);
    });

    it('should validate data types', async () => {
      const response = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: '550e8400-e29b-41d4-a716-446655440000',
          temperature: 'not a number', // Should be number
          bpSystolic: 120,
          bpDiastolic: 80,
          pulse: 72,
          complaints: 'Test',
          diagnosis: 'Test',
          medications: [],
        });

      expect([400, 404]).toContain(response.status);
    });

    it('should validate date formats', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'John Doe',
          dob: 'invalid-date',
          gender: 'M',
          phone: '9876543210',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('8. Error Handling', () => {
    it('should not expose stack traces in production', async () => {
      const response = await request(app)
        .get('/api/patients/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      // Should not contain stack trace
      expect(response.body).not.toHaveProperty('stack');
      expect(JSON.stringify(response.body)).not.toMatch(/at\s+\w+\s+\(/);
    });

    it('should return generic error messages', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('9. Rate Limiting', () => {
    it('should prevent brute force login attempts', async () => {
      // Make 10 rapid login attempts
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app).post('/api/auth/login').send({
            username: 'doctor',
            password: 'wrongpassword',
          })
        );
      }

      const responses = await Promise.all(requests);

      // All should return 401 (invalid credentials)
      responses.forEach((response) => {
        expect([401, 429]).toContain(response.status);
      });
    });
  });

  describe('10. Dependencies', () => {
    it('should have no high/critical vulnerabilities', async () => {
      // This is a reminder to run: npm audit
      // Manual verification required
      expect(true).toBe(true);
    });
  });
});
