// ***********************************************************
// This support file is processed and loaded automatically before test files.
// You can change the location of this file or turn off automatically serving
// support files with 'supportFile: false' in cypress.config.ts
// ***********************************************************

import './commands';

// Prevent TypeScript errors for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(username?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      seedTestData(): Chainable<void>;
      clearTestData(): Chainable<void>;
    }
  }
}

// Hide fetch/XHR requests from command log to reduce noise
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Example: Hide sensitive data in screenshots
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // on uncaught exceptions (useful for third-party scripts)
  if (err.message.includes('ResizeObserver loop')) {
    return false;
  }
  return true;
});
