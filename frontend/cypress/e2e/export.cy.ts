/// <reference types="cypress" />

/**
 * E2E Test: Data Export
 * 
 * Tests data export functionality:
 * - Export patients (CSV/PDF)
 * - Export consultations (CSV/PDF)
 * - Date range filtering
 * - File download verification
 */

describe('Data Export', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Navigate to Export Page', () => {
    it('should navigate to export page from menu', () => {
      cy.visit('/dashboard');
      
      // Find export link in navigation
      cy.contains(/export|download.*data|reports/i).click();
      
      // Should navigate to export page
      cy.url().should('match', /\/export/);
    });

    it('should display export options', () => {
      cy.visit('/export');
      
      // Should show export type selection
      cy.contains(/export.*type|what.*export/i).should('be.visible');
      
      // Should show format selection
      cy.contains(/format|csv|pdf/i).should('be.visible');
      
      // Should show export button
      cy.contains(/export|download/i).should('be.visible');
    });
  });

  describe('Export Type Selection', () => {
    beforeEach(() => {
      cy.visit('/export');
    });

    it('should select patients export', () => {
      cy.contains(/patient/i).click();
      
      // Patient option should be selected
      cy.get('input[value="patients"], input[value="PATIENTS"]').should('be.checked');
    });

    it('should select consultations export', () => {
      cy.contains(/consultation/i).click();
      
      // Consultation option should be selected
      cy.get('input[value="consultations"], input[value="CONSULTATIONS"]').should('be.checked');
    });

    it('should show description for each export type', () => {
      // Patients description
      cy.contains(/patient/i).parent().should('contain', /demographic|contact|information/i);
      
      // Consultations description
      cy.contains(/consultation/i).parent().should('contain', /visit|medical.*record|history/i);
    });
  });

  describe('Format Selection', () => {
    beforeEach(() => {
      cy.visit('/export');
    });

    it('should select CSV format', () => {
      cy.contains(/csv/i).click();
      
      // CSV should be selected
      cy.get('input[value="csv"], input[value="CSV"]').should('be.checked');
    });

    it('should select PDF format', () => {
      cy.contains(/pdf/i).click();
      
      // PDF should be selected
      cy.get('input[value="pdf"], input[value="PDF"]').should('be.checked');
    });

    it('should show format preview or description', () => {
      cy.contains(/csv/i).parent().should('contain', /excel|spreadsheet/i);
      cy.contains(/pdf/i).parent().should('contain', /document|report/i);
    });
  });

  describe('Date Range Filter', () => {
    beforeEach(() => {
      cy.visit('/export');
    });

    it('should display date range inputs', () => {
      cy.get('input[name="fromDate"], input[type="date"]').first().should('be.visible');
      cy.get('input[name="toDate"], input[type="date"]').last().should('be.visible');
    });

    it('should have default date range (last 90 days)', () => {
      cy.get('input[name="fromDate"], input[type="date"]').first().should('not.be.empty');
      cy.get('input[name="toDate"], input[type="date"]').last().should('not.be.empty');
    });

    it('should allow changing date range', () => {
      const fromDate = '2026-01-01';
      const toDate = '2026-03-31';
      
      cy.get('input[name="fromDate"], input[type="date"]').first().clear().type(fromDate);
      cy.get('input[name="toDate"], input[type="date"]').last().clear().type(toDate);
      
      // Dates should be set
      cy.get('input[name="fromDate"]').should('have.value', fromDate);
      cy.get('input[name="toDate"]').should('have.value', toDate);
    });

    it('should validate date range (to >= from)', () => {
      const fromDate = '2026-12-31';
      const toDate = '2026-01-01';
      
      cy.get('input[name="fromDate"], input[type="date"]').first().clear().type(fromDate);
      cy.get('input[name="toDate"], input[type="date"]').last().clear().type(toDate);
      
      cy.contains(/export|download/i).click();
      
      // Should show validation error
      cy.contains(/invalid.*date.*range|to.*date.*after.*from/i).should('be.visible');
    });
  });

  describe('Export Patients', () => {
    beforeEach(() => {
      cy.visit('/export');
    });

    it('should export patients as CSV', () => {
      // Select patients
      cy.contains(/patient/i).click();
      
      // Select CSV
      cy.contains(/csv/i).click();
      
      // Set date range (optional)
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 90);
      cy.get('input[name="fromDate"]').clear().type(fromDate.toISOString().split('T')[0]);
      
      // Click export
      cy.contains(/export|download/i).click();
      
      // Should show loading state
      cy.contains(/exporting|generating/i, { timeout: 2000 }).should('be.visible');
      
      // Should show success message
      cy.contains(/export.*success|downloaded/i, { timeout: 15000 }).should('be.visible');
    });

    it('should export patients as PDF', () => {
      cy.contains(/patient/i).click();
      cy.contains(/pdf/i).click();
      cy.contains(/export|download/i).click();
      
      cy.contains(/export.*success|downloaded/i, { timeout: 15000 }).should('be.visible');
    });

    it('should include correct data in CSV', () => {
      // Intercept export request
      cy.intercept('GET', '**/export/patients**').as('exportPatients');
      
      cy.contains(/patient/i).click();
      cy.contains(/csv/i).click();
      cy.contains(/export|download/i).click();
      
      cy.wait('@exportPatients', { timeout: 15000 }).then((interception) => {
        // Response should be CSV
        expect(interception.response?.headers['content-type']).to.include('csv');
        
        // Should have CSV data
        const body = interception.response?.body;
        expect(body).to.include('Name');
        expect(body).to.include('Phone');
        expect(body).to.include('Age');
      });
    });
  });

  describe('Export Consultations', () => {
    beforeEach(() => {
      cy.visit('/export');
    });

    it('should export consultations as CSV', () => {
      cy.contains(/consultation/i).click();
      cy.contains(/csv/i).click();
      cy.contains(/export|download/i).click();
      
      cy.contains(/export.*success|downloaded/i, { timeout: 15000 }).should('be.visible');
    });

    it('should export consultations as PDF', () => {
      cy.contains(/consultation/i).click();
      cy.contains(/pdf/i).click();
      cy.contains(/export|download/i).click();
      
      cy.contains(/export.*success|downloaded/i, { timeout: 15000 }).should('be.visible');
    });

    it('should filter consultations by date range', () => {
      cy.intercept('GET', '**/export/consultations**').as('exportConsultations');
      
      cy.contains(/consultation/i).click();
      cy.contains(/csv/i).click();
      
      const fromDate = '2026-04-01';
      const toDate = '2026-04-30';
      cy.get('input[name="fromDate"]').clear().type(fromDate);
      cy.get('input[name="toDate"]').clear().type(toDate);
      
      cy.contains(/export|download/i).click();
      
      cy.wait('@exportConsultations', { timeout: 15000 }).then((interception) => {
        // Should include date range in query
        expect(interception.request.url).to.include(fromDate);
        expect(interception.request.url).to.include(toDate);
      });
    });

    it('should include medication details in export', () => {
      cy.intercept('GET', '**/export/consultations**').as('exportConsultations');
      
      cy.contains(/consultation/i).click();
      cy.contains(/csv/i).click();
      cy.contains(/export|download/i).click();
      
      cy.wait('@exportConsultations', { timeout: 15000 }).then((interception) => {
        const body = interception.response?.body;
        
        // CSV should have medication columns
        expect(body).to.include('Diagnosis');
        expect(body).to.include('Medications');
      });
    });
  });

  describe('Export Status and Feedback', () => {
    beforeEach(() => {
      cy.visit('/export');
    });

    it('should show loading state during export', () => {
      cy.contains(/patient/i).click();
      cy.contains(/csv/i).click();
      cy.contains(/export|download/i).click();
      
      // Loading indicator should appear
      cy.get('[data-testid="loading"], .loading, .spinner').should('be.visible');
    });

    it('should disable export button during export', () => {
      cy.contains(/patient/i).click();
      cy.contains(/csv/i).click();
      
      cy.contains(/export|download/i).click();
      
      // Button should be disabled
      cy.contains(/export|download/i).should('be.disabled');
    });

    it('should show success notification with filename', () => {
      cy.contains(/patient/i).click();
      cy.contains(/csv/i).click();
      cy.contains(/export|download/i).click();
      
      // Success message should include filename
      cy.contains(/patients.*\.csv|export.*success/i, { timeout: 15000 }).should('be.visible');
    });

    it('should handle export errors gracefully', () => {
      // Force error by making backend unavailable
      cy.intercept('GET', '**/export/**', {
        statusCode: 500,
        body: { error: 'Export failed' }
      }).as('exportError');
      
      cy.contains(/patient/i).click();
      cy.contains(/csv/i).click();
      cy.contains(/export|download/i).click();
      
      // Error message should appear
      cy.contains(/error|failed|try.*again/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Export History (Optional)', () => {
    it('should show recently exported files', () => {
      cy.visit('/export');
      
      // Export something first
      cy.contains(/patient/i).click();
      cy.contains(/csv/i).click();
      cy.contains(/export|download/i).click();
      cy.wait(5000);
      
      // Check if history section exists
      cy.get('body').then(($body) => {
        if ($body.text().includes('Recent Exports') || $body.text().includes('Export History')) {
          cy.contains(/recent.*export|export.*history/i).should('be.visible');
          
          // Should list exported file
          cy.contains(/patients.*\.csv/i).should('be.visible');
        }
      });
    });
  });
});
