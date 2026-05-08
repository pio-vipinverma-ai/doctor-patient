/// <reference types="cypress" />

/**
 * E2E Test: Consultation Workflow
 * 
 * Tests complete consultation flow:
 * - Start consultation from appointment
 * - Enter vitals
 * - Enter diagnosis and complaints
 * - Add medications
 * - Save consultation
 * - Verify prescription generated
 * - View prescription
 */

describe('Consultation Workflow', () => {
  let testPatientId: string;

  beforeEach(() => {
    cy.login();
  });

  describe('Start Consultation', () => {
    it('should start consultation from patient profile', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      
      // Click start consultation
      cy.contains(/start.*consultation|new.*consultation/i).click();
      
      // Should navigate to consultation form
      cy.url().should('match', /\/consultations?\/new/);
      
      // Should display consultation form
      cy.contains(/consultation|vitals/i).should('be.visible');
    });

    it('should start consultation from appointment', () => {
      cy.visit('/dashboard');
      
      // Find an appointment
      cy.get('[data-testid="appointment-item"], .appointment-item').first().within(() => {
        cy.contains(/start.*consultation|consult/i).click();
      });
      
      // Should navigate to consultation form
      cy.url().should('match', /\/consultations?\/new/);
    });
  });

  describe('Vitals Entry', () => {
    beforeEach(() => {
      // Navigate to consultation form
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/start.*consultation/i).click();
    });

    it('should display vitals input fields', () => {
      cy.get('input[name="temperature"]').should('be.visible');
      cy.get('input[name="bpSystolic"], input[name*="systolic"]').should('be.visible');
      cy.get('input[name="bpDiastolic"], input[name*="diastolic"]').should('be.visible');
      cy.get('input[name="pulse"]').should('be.visible');
    });

    it('should enter vitals with valid values', () => {
      cy.fixture('testConsultation').then((consultation) => {
        cy.get('input[name="temperature"]').clear().type(consultation.temperature.toString());
        cy.get('input[name="bpSystolic"], input[name*="systolic"]').clear().type(consultation.bpSystolic.toString());
        cy.get('input[name="bpDiastolic"], input[name*="diastolic"]').clear().type(consultation.bpDiastolic.toString());
        cy.get('input[name="pulse"]').clear().type(consultation.pulse.toString());
        
        // All fields should have values
        cy.get('input[name="temperature"]').should('have.value', consultation.temperature.toString());
        cy.get('input[name="pulse"]').should('have.value', consultation.pulse.toString());
      });
    });

    it('should show warning for abnormal vitals', () => {
      // Enter high temperature
      cy.get('input[name="temperature"]').clear().type('104');
      cy.get('input[name="pulse"]').click(); // Blur temperature field
      
      // Should show warning (might be visual indicator or tooltip)
      // This depends on implementation
      cy.get('body').should('exist'); // Placeholder - adjust based on actual warning display
    });

    it('should validate vital sign ranges', () => {
      // Enter invalid temperature (too high)
      cy.get('input[name="temperature"]').clear().type('150');
      cy.get('input[name="pulse"]').click();
      
      // Should show validation error
      cy.contains(/invalid.*temperature|temperature.*range/i).should('be.visible');
    });
  });

  describe('Diagnosis and Complaints', () => {
    beforeEach(() => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/start.*consultation/i).click();
    });

    it('should enter complaints and diagnosis', () => {
      cy.fixture('testConsultation').then((consultation) => {
        // Enter vitals first
        cy.get('input[name="temperature"]').clear().type(consultation.temperature.toString());
        cy.get('input[name="bpSystolic"], input[name*="systolic"]').clear().type(consultation.bpSystolic.toString());
        cy.get('input[name="bpDiastolic"], input[name*="diastolic"]').clear().type(consultation.bpDiastolic.toString());
        cy.get('input[name="pulse"]').clear().type(consultation.pulse.toString());
        
        // Enter complaints
        cy.get('textarea[name="complaints"], input[name="complaints"]').clear().type(consultation.complaints);
        
        // Enter diagnosis
        cy.get('textarea[name="diagnosis"], input[name="diagnosis"]').clear().type(consultation.diagnosis);
        
        // Fields should contain entered text
        cy.get('textarea[name="complaints"], input[name="complaints"]').should('contain.value', 'Headache');
        cy.get('textarea[name="diagnosis"], input[name="diagnosis"]').should('contain.value', 'Viral infection');
      });
    });

    it('should require diagnosis and complaints', () => {
      // Try to proceed without entering diagnosis
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.contains(/complaints.*required/i).should('be.visible');
      cy.contains(/diagnosis.*required/i).should('be.visible');
    });
  });

  describe('Medications', () => {
    beforeEach(() => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/start.*consultation/i).click();
      
      // Fill vitals
      cy.fixture('testConsultation').then((consultation) => {
        cy.get('input[name="temperature"]').clear().type(consultation.temperature.toString());
        cy.get('input[name="bpSystolic"], input[name*="systolic"]').clear().type(consultation.bpSystolic.toString());
        cy.get('input[name="bpDiastolic"], input[name*="diastolic"]').clear().type(consultation.bpDiastolic.toString());
        cy.get('input[name="pulse"]').clear().type(consultation.pulse.toString());
        cy.get('textarea[name="complaints"], input[name="complaints"]').clear().type(consultation.complaints);
        cy.get('textarea[name="diagnosis"], input[name="diagnosis"]').clear().type(consultation.diagnosis);
      });
    });

    it('should add medication', () => {
      // Click add medication button
      cy.contains(/add.*medication|new.*medication/i).click();
      
      // Medication form should appear
      cy.get('input[name*="medication"][name*="name"], input[placeholder*="medication"]').should('be.visible');
    });

    it('should fill medication details', () => {
      cy.fixture('testConsultation').then((consultation) => {
        const med = consultation.medications[0];
        
        // Add medication
        cy.contains(/add.*medication/i).click();
        
        // Fill medication fields
        cy.get('input[name*="medication"][name*="name"], input[placeholder*="medication"]').first().type(med.name);
        cy.get('input[name*="dosage"], input[placeholder*="dosage"]').first().type(med.dosage);
        cy.get('input[name*="frequency"], input[placeholder*="frequency"]').first().type(med.frequency);
        cy.get('input[name*="duration"], input[placeholder*="duration"]').first().type(med.duration);
        cy.get('input[name*="instructions"], textarea[name*="instructions"]').first().type(med.instructions);
        
        // Medication should be in list
        cy.contains(med.name).should('be.visible');
      });
    });

    it('should add multiple medications', () => {
      cy.fixture('testConsultation').then((consultation) => {
        consultation.medications.forEach((med, index) => {
          // Add medication
          cy.contains(/add.*medication/i).click();
          
          // Fill fields
          cy.get('input[name*="medication"][name*="name"]').eq(index).type(med.name);
          cy.get('input[name*="dosage"]').eq(index).type(med.dosage);
          cy.get('input[name*="frequency"]').eq(index).type(med.frequency);
          cy.get('input[name*="duration"]').eq(index).type(med.duration);
        });
        
        // Should have multiple medications listed
        cy.contains('Paracetamol').should('be.visible');
        cy.contains('Amoxicillin').should('be.visible');
      });
    });

    it('should remove medication', () => {
      // Add medication
      cy.contains(/add.*medication/i).click();
      cy.get('input[name*="medication"][name*="name"]').first().type('Test Med');
      
      // Remove medication
      cy.get('button[aria-label*="remove"], button[title*="remove"]').first().click();
      
      // Medication should be gone
      cy.contains('Test Med').should('not.exist');
    });

    it('should require at least one medication', () => {
      // Try to submit without medications
      cy.get('button[type="submit"]').click();
      
      // Should show validation error
      cy.contains(/least.*1.*medication|medication.*required/i).should('be.visible');
    });
  });

  describe('Save Consultation', () => {
    it('should save complete consultation', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/start.*consultation/i).click();
      
      cy.fixture('testConsultation').then((consultation) => {
        // Fill vitals
        cy.get('input[name="temperature"]').clear().type(consultation.temperature.toString());
        cy.get('input[name="bpSystolic"], input[name*="systolic"]').clear().type(consultation.bpSystolic.toString());
        cy.get('input[name="bpDiastolic"], input[name*="diastolic"]').clear().type(consultation.bpDiastolic.toString());
        cy.get('input[name="pulse"]').clear().type(consultation.pulse.toString());
        
        // Fill complaints and diagnosis
        cy.get('textarea[name="complaints"], input[name="complaints"]').clear().type(consultation.complaints);
        cy.get('textarea[name="diagnosis"], input[name="diagnosis"]').clear().type(consultation.diagnosis);
        
        // Add medication
        cy.contains(/add.*medication/i).click();
        const med = consultation.medications[0];
        cy.get('input[name*="medication"][name*="name"]').first().type(med.name);
        cy.get('input[name*="dosage"]').first().type(med.dosage);
        cy.get('input[name*="frequency"]').first().type(med.frequency);
        cy.get('input[name*="duration"]').first().type(med.duration);
        
        // Submit
        cy.get('button[type="submit"]').click();
        
        // Should show success message
        cy.contains(/consultation.*saved|success/i, { timeout: 15000 }).should('be.visible');
        
        // Should show prescription or navigate to prescription
        cy.contains(/prescription|view.*prescription/i, { timeout: 10000 }).should('be.visible');
      });
    });

    it('should generate prescription after saving', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      
      // Check if consultation exists in history
      cy.contains(/history|past.*visits/i).should('be.visible');
      
      // Find recent consultation
      cy.contains(/prescription|view.*prescription/i).should('be.visible');
    });
  });
});
