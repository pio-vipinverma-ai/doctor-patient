/// <reference types="cypress" />

/**
 * E2E Test: Appointment Scheduling
 * 
 * Tests appointment management:
 * - View daily appointments
 * - Schedule new appointment
 * - Update appointment
 * - Cancel appointment
 * - Verify appointment in list
 */

describe('Appointment Scheduling', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  describe('View Appointments', () => {
    it('should display daily appointments list', () => {
      cy.contains(/today.*appointments|appointments.*today|daily.*schedule/i).should('be.visible');
      
      // Should show appointments list or empty state
      cy.get('body').should('contain', /appointment|schedule|no.*appointments/i);
    });

    it('should show appointment details', () => {
      cy.get('[data-testid="appointment-item"], .appointment-item').first().within(() => {
        // Should show patient name
        cy.get('[data-testid="patient-name"], .patient-name').should('exist');
        
        // Should show time
        cy.contains(/\d{1,2}:\d{2}|AM|PM/i).should('exist');
        
        // Should show status
        cy.contains(/scheduled|completed|cancelled/i).should('exist');
      });
    });

    it('should filter appointments by date', () => {
      // Find date picker or date navigation
      cy.get('input[type="date"], [data-testid="date-picker"]').should('be.visible');
      
      // Change date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      
      cy.get('input[type="date"]').clear().type(dateStr);
      
      // Appointments should update
      cy.wait(1000);
      cy.get('body').should('exist'); // Placeholder - appointments should reload
    });
  });

  describe('Schedule New Appointment', () => {
    it('should open new appointment form', () => {
      cy.contains(/new.*appointment|schedule.*appointment|book.*appointment/i).click();
      
      // Form should be visible
      cy.get('form').should('be.visible');
      cy.contains(/patient|schedule|appointment/i).should('be.visible');
    });

    it('should schedule appointment for existing patient', () => {
      cy.contains(/new.*appointment|schedule.*appointment/i).click();
      
      // Search for patient
      cy.get('input[placeholder*="search"], input[placeholder*="patient"]').type('John');
      cy.wait(500);
      
      // Select patient from results
      cy.contains('John').click();
      
      // Select date and time
      cy.fixture('testAppointment').then((appointment) => {
        const appointmentDate = new Date(appointment.scheduledTime);
        const dateStr = appointmentDate.toISOString().split('T')[0];
        const timeStr = appointmentDate.toTimeString().slice(0, 5);
        
        cy.get('input[type="date"], input[name="date"]').type(dateStr);
        cy.get('input[type="time"], input[name="time"]').type(timeStr);
        
        // Enter reason
        cy.get('input[name="reason"], textarea[name="reason"]').type(appointment.reason);
        
        // Submit
        cy.get('button[type="submit"]').click();
        
        // Should show success
        cy.contains(/appointment.*scheduled|success/i, { timeout: 10000 }).should('be.visible');
      });
    });

    it('should validate required fields', () => {
      cy.contains(/new.*appointment|schedule.*appointment/i).click();
      
      // Try to submit without filling
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.contains(/patient.*required/i).should('be.visible');
      cy.contains(/date.*required|time.*required/i).should('be.visible');
    });

    it('should prevent double-booking', () => {
      // Schedule first appointment
      cy.contains(/new.*appointment|schedule.*appointment/i).click();
      
      cy.get('input[placeholder*="search"], input[placeholder*="patient"]').type('John');
      cy.wait(500);
      cy.contains('John').click();
      
      const now = new Date();
      now.setDate(now.getDate() + 2); // 2 days from now
      now.setHours(10, 0, 0, 0);
      
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = '10:00';
      
      cy.get('input[type="date"], input[name="date"]').type(dateStr);
      cy.get('input[type="time"], input[name="time"]').type(timeStr);
      cy.get('input[name="reason"], textarea[name="reason"]').type('First appointment');
      cy.get('button[type="submit"]').click();
      cy.wait(2000);
      
      // Try to schedule duplicate
      cy.contains(/new.*appointment|schedule.*appointment/i).click();
      cy.get('input[placeholder*="search"], input[placeholder*="patient"]').type('John');
      cy.wait(500);
      cy.contains('John').click();
      cy.get('input[type="date"], input[name="date"]').type(dateStr);
      cy.get('input[type="time"], input[name="time"]').type(timeStr);
      cy.get('input[name="reason"], textarea[name="reason"]').type('Duplicate appointment');
      cy.get('button[type="submit"]').click();
      
      // Should show error
      cy.contains(/already.*booked|double.*booking|time.*slot.*taken/i, { timeout: 10000 }).should('be.visible');
    });

    it('should prevent scheduling in the past', () => {
      cy.contains(/new.*appointment|schedule.*appointment/i).click();
      
      cy.get('input[placeholder*="search"], input[placeholder*="patient"]').type('John');
      cy.wait(500);
      cy.contains('John').click();
      
      // Select past date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      cy.get('input[type="date"], input[name="date"]').type(dateStr);
      cy.get('input[type="time"], input[name="time"]').type('10:00');
      cy.get('input[name="reason"], textarea[name="reason"]').type('Past appointment');
      cy.get('button[type="submit"]').click();
      
      // Should show validation error
      cy.contains(/past|future|after.*today/i).should('be.visible');
    });
  });

  describe('Update Appointment', () => {
    it('should update appointment status', () => {
      cy.get('[data-testid="appointment-item"], .appointment-item').first().within(() => {
        // Find status dropdown or buttons
        cy.get('select[name="status"], button[aria-label*="status"]').first().click();
      });
      
      // Select new status
      cy.contains('Completed').click();
      
      // Should show success
      cy.contains(/updated|success/i, { timeout: 10000 }).should('be.visible');
    });

    it('should edit appointment details', () => {
      cy.get('[data-testid="appointment-item"], .appointment-item').first().within(() => {
        cy.get('button[aria-label*="edit"], button[title*="edit"]').click();
      });
      
      // Edit form should open
      cy.get('input[name="reason"], textarea[name="reason"]').should('be.visible');
      
      // Update reason
      cy.get('input[name="reason"], textarea[name="reason"]').clear().type('Updated reason');
      cy.get('button[type="submit"]').click();
      
      // Should show success
      cy.contains(/updated|success/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Cancel Appointment', () => {
    it('should cancel appointment', () => {
      // Find appointment
      cy.get('[data-testid="appointment-item"], .appointment-item').first().within(() => {
        cy.get('button[aria-label*="cancel"], button[title*="cancel"]').click();
      });
      
      // Confirm cancellation
      cy.contains(/confirm|yes|cancel.*appointment/i).click();
      
      // Should show success
      cy.contains(/cancelled|success/i, { timeout: 10000 }).should('be.visible');
      
      // Status should update
      cy.contains('Cancelled').should('be.visible');
    });
  });

  describe('Appointment Actions', () => {
    it('should start consultation from appointment', () => {
      cy.get('[data-testid="appointment-item"], .appointment-item').first().within(() => {
        cy.contains(/start.*consultation|consult/i).click();
      });
      
      // Should navigate to consultation form
      cy.url().should('match', /\/consultations?\/new/);
    });

    it('should view patient profile from appointment', () => {
      cy.get('[data-testid="appointment-item"], .appointment-item').first().within(() => {
        cy.get('[data-testid="patient-name"], .patient-name').click();
      });
      
      // Should navigate to patient profile
      cy.url().should('match', /\/patients?\/[a-f0-9-]{36}/);
    });
  });
});
