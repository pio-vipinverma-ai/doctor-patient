/// <reference types="cypress" />

/**
 * E2E Test: Patient Management
 * 
 * Tests patient CRUD operations:
 * - Search patients (typeahead)
 * - View patient profile
 * - Create new patient
 * - Edit patient details
 * - Verify patient in search results
 */

describe('Patient Management', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Patient Search', () => {
    it('should navigate to patient search page', () => {
      cy.visit('/dashboard');
      cy.contains(/patient.*search|search.*patient/i).click();
      cy.url().should('match', /\/patients?\/(search)?/);
    });

    it('should search patient by name', () => {
      cy.visit('/patients/search');
      
      // Type search query
      cy.get('input[type="search"], input[placeholder*="Search"]').type('John');
      
      // Wait for results
      cy.wait(500); // Debounce delay
      
      // Should display results
      cy.get('[data-testid="patient-result"], .patient-item, .search-result')
        .should('have.length.greaterThan', 0);
      
      // Results should contain search term
      cy.contains('John').should('be.visible');
    });

    it('should search patient by phone number', () => {
      cy.visit('/patients/search');
      
      // Type phone number
      cy.get('input[type="search"], input[placeholder*="Search"]').type('987');
      
      // Wait for results
      cy.wait(500);
      
      // Should display results
      cy.get('[data-testid="patient-result"], .patient-item, .search-result')
        .should('have.length.greaterThan', 0);
    });

    it('should show patient details in search results', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"], input[placeholder*="Search"]').type('John');
      cy.wait(500);
      
      // Each result should show name, age, phone
      cy.get('[data-testid="patient-result"], .patient-item').first().within(() => {
        cy.contains(/john/i).should('be.visible');
        cy.contains(/\d{10}/).should('be.visible'); // Phone
        cy.contains(/\d+/).should('be.visible'); // Age or other number
      });
    });

    it('should navigate to patient profile when clicking result', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"], input[placeholder*="Search"]').type('John');
      cy.wait(500);
      
      // Click first result
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      
      // Should navigate to profile
      cy.url().should('match', /\/patients?\/[a-f0-9-]{36}/);
      
      // Should display patient details
      cy.contains('John').should('be.visible');
    });
  });

  describe('Create New Patient', () => {
    beforeEach(() => {
      cy.visit('/patients/search');
    });

    it('should open new patient form', () => {
      cy.contains(/new.*patient|add.*patient|create.*patient/i).click();
      
      // Form should be visible
      cy.get('form').should('be.visible');
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="phone"]').should('be.visible');
    });

    it('should create patient with valid data', () => {
      cy.fixture('testPatient').then((patient) => {
        // Open form
        cy.contains(/new.*patient|add.*patient|create.*patient/i).click();
        
        // Fill form
        cy.get('input[name="name"]').type(patient.name);
        cy.get('input[name="dob"]').type(patient.dob);
        cy.get('select[name="gender"], input[name="gender"]').first().click();
        cy.contains(patient.gender === 'M' ? 'Male' : 'Female').click();
        cy.get('input[name="phone"]').type(patient.phone);
        cy.get('input[name="email"]').type(patient.email);
        cy.get('input[name="address"], textarea[name="address"]').type(patient.address);
        
        // Submit
        cy.get('button[type="submit"]').click();
        
        // Should show success message
        cy.contains(/success.*created/i, { timeout: 10000 }).should('be.visible');
        
        // Should navigate to patient profile or back to search
        cy.url().should('match', /\/patients?/);
      });
    });

    it('should validate required fields', () => {
      cy.contains(/new.*patient|add.*patient/i).click();
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.contains(/name.*required/i).should('be.visible');
      cy.contains(/phone.*required/i).should('be.visible');
      cy.contains(/dob.*required|date.*required/i).should('be.visible');
    });

    it('should validate phone number format', () => {
      cy.contains(/new.*patient|add.*patient/i).click();
      
      // Enter invalid phone
      cy.get('input[name="phone"]').type('123');
      cy.get('input[name="name"]').click(); // Blur phone field
      
      // Should show validation error
      cy.contains(/phone.*invalid|phone.*10.*digit/i).should('be.visible');
    });

    it('should show error for duplicate phone number', () => {
      // Try to create patient with existing phone
      cy.contains(/new.*patient|add.*patient/i).click();
      
      cy.get('input[name="name"]').type('Duplicate Test');
      cy.get('input[name="dob"]').type('1990-01-01');
      cy.get('select[name="gender"], input[name="gender"]').first().click();
      cy.contains('Male').click();
      cy.get('input[name="phone"]').type('9876543210'); // Existing phone
      
      cy.get('button[type="submit"]').click();
      
      // Should show duplicate error
      cy.contains(/phone.*already.*exists|duplicate.*phone/i, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('View Patient Profile', () => {
    it('should display complete patient information', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      
      // Should show patient details
      cy.contains(/patient.*details|patient.*information/i).should('be.visible');
      cy.contains('John').should('be.visible');
      cy.contains(/\d{10}/).should('be.visible'); // Phone
      cy.contains(/\d+\s*(years?|yrs)/i).should('be.visible'); // Age
    });

    it('should show action buttons', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      
      // Should have action buttons
      cy.contains(/edit.*patient|update/i).should('be.visible');
      cy.contains(/new.*appointment|schedule/i).should('be.visible');
      cy.contains(/start.*consultation|new.*consultation/i).should('be.visible');
    });
  });

  describe('Edit Patient', () => {
    it('should open edit form with pre-filled data', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      
      // Click edit
      cy.contains(/edit.*patient|update/i).click();
      
      // Form should be pre-filled
      cy.get('input[name="name"]').should('have.value', /john/i);
      cy.get('input[name="phone"]').should('have.value', /\d{10}/);
    });

    it('should update patient information', () => {
      cy.visit('/patients/search');
      cy.get('input[type="search"]').type('John');
      cy.wait(500);
      cy.get('[data-testid="patient-result"], .patient-item').first().click();
      
      // Edit patient
      cy.contains(/edit.*patient|update/i).click();
      
      // Update address
      const newAddress = `Updated Address ${Date.now()}`;
      cy.get('input[name="address"], textarea[name="address"]').clear().type(newAddress);
      
      // Save
      cy.get('button[type="submit"]').click();
      
      // Should show success
      cy.contains(/success.*updated/i, { timeout: 10000 }).should('be.visible');
      
      // Should reflect changes
      cy.contains(newAddress).should('be.visible');
    });
  });
});
