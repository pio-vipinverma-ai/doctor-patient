/// <reference types="cypress" />

/**
 * Custom Cypress Commands for E2E Testing
 */

/**
 * Login command - authenticates user and stores token
 */
Cypress.Commands.add('login', (username?: string, password?: string) => {
  const user = username || Cypress.env('testUser').username;
  const pass = password || Cypress.env('testUser').password;

  cy.session(
    [user, pass],
    () => {
      cy.visit('/login');
      cy.get('input[name="username"]').type(user);
      cy.get('input[name="password"]').type(pass);
      cy.get('button[type="submit"]').click();
      
      // Wait for redirect to dashboard
      cy.url().should('include', '/dashboard');
      
      // Verify token in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('accessToken')).to.exist;
      });
    },
    {
      validate() {
        cy.window().then((win) => {
          expect(win.localStorage.getItem('accessToken')).to.exist;
        });
      },
    }
  );
});

/**
 * Logout command - clears authentication
 */
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('accessToken');
    win.localStorage.removeItem('refreshToken');
    win.localStorage.removeItem('user');
  });
  cy.visit('/login');
});

/**
 * Seed test data - creates test patients, appointments, etc.
 */
Cypress.Commands.add('seedTestData', () => {
  const apiUrl = Cypress.env('apiUrl');
  
  // Create test patient
  cy.request({
    method: 'POST',
    url: `${apiUrl}/patients`,
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`
    },
    body: {
      name: 'Test Patient Cypress',
      dob: '1990-01-15',
      gender: 'M',
      phone: '9999999999',
      email: 'cypress.test@example.com',
      address: '123 Test Street, Cypress City'
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 201 || response.status === 409) {
      cy.wrap(response.body.patient || response.body).as('testPatient');
    }
  });
});

/**
 * Clear test data - removes test records
 */
Cypress.Commands.add('clearTestData', () => {
  // Note: In production, you'd call a dedicated cleanup endpoint
  // For now, we'll rely on test database isolation
  cy.log('Test data cleanup - using isolated test database');
});

// Prevent TypeScript errors
export {};
