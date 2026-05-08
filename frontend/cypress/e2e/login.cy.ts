/// <reference types="cypress" />

/**
 * E2E Test: Login Flow
 * 
 * Tests user authentication workflow including:
 * - Valid login
 * - Invalid credentials
 * - Redirect to dashboard
 * - Session persistence
 */

describe('Login Flow', () => {
  beforeEach(() => {
    // Clear any existing session
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('h1, h2').should('contain', 'Login');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    
    // Should show validation messages
    cy.contains(/username.*required/i).should('be.visible');
    cy.contains(/password.*required/i).should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    const { username, password } = Cypress.env('testUser');

    // Enter credentials
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Should display username/welcome message
    cy.contains(username, { matchCase: false }).should('be.visible');
    
    // Should store auth token
    cy.window().then((win) => {
      expect(win.localStorage.getItem('accessToken')).to.exist;
    });
  });

  it('should show error for invalid credentials', () => {
    // Enter invalid credentials
    cy.get('input[name="username"]').type('invaliduser');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.contains(/invalid.*credentials|username.*password.*incorrect/i).should('be.visible');
    
    // Should remain on login page
    cy.url().should('include', '/login');
  });

  it('should mask password input', () => {
    cy.get('input[name="password"]')
      .should('have.attr', 'type', 'password');
  });

  it('should allow logout and require re-login', () => {
    // Login first
    cy.login();
    cy.visit('/dashboard');
    
    // Verify logged in
    cy.url().should('include', '/dashboard');
    
    // Logout (find logout button/link)
    cy.contains('logout', { matchCase: false }).click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
    
    // Token should be cleared
    cy.window().then((win) => {
      expect(win.localStorage.getItem('accessToken')).to.not.exist;
    });
  });

  it('should redirect to login when accessing protected route without auth', () => {
    cy.visit('/dashboard');
    
    // Should redirect to login
    cy.url().should('include', '/login');
  });

  it('should persist session after page refresh', () => {
    cy.login();
    cy.visit('/dashboard');
    
    // Reload page
    cy.reload();
    
    // Should still be logged in
    cy.url().should('include', '/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('accessToken')).to.exist;
    });
  });
});
