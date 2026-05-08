/// <reference types="cypress" />

/**
 * E2E Test: Prescription Management
 * 
 * Tests prescription viewing and printing:
 * - View prescription details
 * - Print prescription
 * - Download PDF
 * - Mark as printed
 */

describe('Prescription Management', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('View Prescription', () => {
    it('should navigate to prescription from patient history', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      
      // Open history
      cy.contains(/history|past.*visits/i).click();
      
      // Find consultation with prescription
      cy.contains(/prescription|view.*prescription/i).first().click();
      
      // Should navigate to prescription page
      cy.url().should('match', /\/prescriptions?\/[a-f0-9-]{36}/);
    });

    it('should display prescription details', () => {
      // Navigate to a prescription
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/history/i).click();
      cy.contains(/prescription/i).first().click();
      
      // Should show prescription content
      cy.contains(/prescription/i).should('be.visible');
      
      // Should show patient name
      cy.contains('John').should('be.visible');
      
      // Should show medications
      cy.contains(/medication|medicine|drug/i).should('be.visible');
      
      // Should show vitals
      cy.contains(/temperature|blood.*pressure|pulse/i).should('be.visible');
      
      // Should show diagnosis
      cy.contains(/diagnosis/i).should('be.visible');
    });

    it('should display all medication details', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/history/i).click();
      cy.contains(/prescription/i).first().click();
      
      // Each medication should show:
      cy.get('[data-testid="medication-item"], .medication-item').first().within(() => {
        // Name
        cy.get('[data-testid="medication-name"], .medication-name').should('exist');
        
        // Dosage
        cy.contains(/mg|ml|tablet|capsule/i).should('exist');
        
        // Frequency
        cy.contains(/daily|times/i).should('exist');
        
        // Duration
        cy.contains(/days|week|month/i).should('exist');
      });
    });

    it('should show vitals with values', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/history/i).click();
      cy.contains(/prescription/i).first().click();
      
      // Vitals section should exist
      cy.contains(/vitals|vital.*signs/i).should('be.visible');
      
      // Should show temperature
      cy.contains(/\d+\.?\d*\s*°?F/i).should('be.visible');
      
      // Should show BP
      cy.contains(/\d+\/\d+/i).should('be.visible');
      
      // Should show pulse
      cy.contains(/\d+\s*(bpm)?/i).should('be.visible');
    });
  });

  describe('Print Prescription', () => {
    beforeEach(() => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/history/i).click();
      cy.contains(/prescription/i).first().click();
    });

    it('should show print button', () => {
      cy.contains(/print|download/i).should('be.visible');
    });

    it('should open print dialog when clicking print', () => {
      // Stub window.print
      cy.window().then((win) => {
        cy.stub(win, 'print').as('printStub');
      });
      
      // Click print button
      cy.contains(/^print$/i).click();
      
      // Print should be called
      cy.get('@printStub').should('have.been.called');
    });

    it('should have print-friendly layout', () => {
      // Check for print styles
      cy.get('body').should('have.class', /(prescription|print)-page/i);
      
      // Header should be visible
      cy.contains(/clinic|hospital|prescription/i).should('be.visible');
      
      // All sections visible for printing
      cy.contains(/patient.*details/i).should('be.visible');
      cy.contains(/medications/i).should('be.visible');
      cy.contains(/diagnosis/i).should('be.visible');
    });
  });

  describe('Download Prescription', () => {
    beforeEach(() => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/history/i).click();
      cy.contains(/prescription/i).first().click();
    });

    it('should download PDF when clicking download', () => {
      // Click download button
      cy.contains(/download.*pdf|download/i).click();
      
      // File should download (check Downloads folder or intercept request)
      // Note: Actual file download verification is tricky in Cypress
      cy.wait(2000);
      
      // Should show success message
      cy.contains(/downloaded|success/i, { timeout: 10000 }).should('be.visible');
    });

    it('should generate PDF with correct filename', () => {
      // Intercept PDF download
      cy.intercept('GET', '**/prescriptions/**/pdf').as('downloadPDF');
      
      cy.contains(/download.*pdf|download/i).click();
      
      cy.wait('@downloadPDF', { timeout: 15000 }).then((interception) => {
        // Should have Content-Disposition header
        expect(interception.response?.headers).to.have.property('content-disposition');
        
        // Filename should include prescription info
        const disposition = interception.response?.headers['content-disposition'];
        expect(disposition).to.match(/prescription.*\.pdf/i);
      });
    });
  });

  describe('Mark as Printed', () => {
    it('should mark prescription as printed', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/history/i).click();
      cy.contains(/prescription/i).first().click();
      
      // Click print
      cy.window().then((win) => {
        cy.stub(win, 'print').as('printStub');
      });
      cy.contains(/^print$/i).click();
      
      // Status should update to printed
      cy.contains(/printed/i, { timeout: 10000 }).should('be.visible');
    });

    it('should show printed timestamp', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/history/i).click();
      
      // Find a printed prescription
      cy.contains(/printed/i).should('be.visible');
      
      // Should show date/time of printing
      cy.contains(/printed.*on|printed.*at/i).should('be.visible');
    });
  });

  describe('Prescription History', () => {
    it('should list all prescriptions for patient', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/history/i).click();
      
      // Should show list of consultations/prescriptions
      cy.get('[data-testid="consultation-item"], .consultation-item').should('have.length.greaterThan', 0);
    });

    it('should show prescription preview in history', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/history/i).click();
      
      // Each history item should show key info
      cy.get('[data-testid="consultation-item"], .consultation-item').first().within(() => {
        // Date
        cy.contains(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/).should('exist');
        
        // Diagnosis or complaints
        cy.get('[data-testid="diagnosis"], [data-testid="complaints"]').should('exist');
        
        // Number of medications
        cy.contains(/medication|medicine/i).should('exist');
      });
    });

    it('should filter prescriptions by date range', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      cy.contains(/history/i).click();
      
      // Find date filter
      cy.get('input[type="date"], [data-testid="date-from"]').should('exist');
      
      // Select date range
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      const dateStr = fromDate.toISOString().split('T')[0];
      
      cy.get('input[type="date"]').first().type(dateStr);
      
      // Results should filter
      cy.wait(1000);
      cy.get('[data-testid="consultation-item"], .consultation-item').should('exist');
    });
  });
});
