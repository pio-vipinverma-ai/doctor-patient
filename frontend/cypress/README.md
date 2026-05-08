# E2E Testing with Cypress

This directory contains End-to-End (E2E) tests for the Patient Management System using Cypress.

## Setup

Cypress has been installed with the following command:
```bash
npm install --save-dev cypress @cypress/webpack-preprocessor ts-loader
```

## Running Tests

### Interactive Mode (Cypress Test Runner)
```bash
npm run cypress
# or
npm run e2e
```

### Headless Mode (CI/CD)
```bash
npm run cypress:run
# or
npm run e2e:run
```

### Browser-Specific Tests
```bash
# Chrome
npm run e2e:chrome

# Firefox  
npm run e2e:firefox
```

## Test Structure

### Test Files
- `cypress/e2e/login.cy.ts` - Login flow tests
- `cypress/e2e/patient.cy.ts` - Patient management (CRUD operations)
- `cypress/e2e/appointment.cy.ts` - Appointment scheduling
- `cypress/e2e/consultation.cy.ts` - Consultation workflow
- `cypress/e2e/prescription.cy.ts` - Prescription viewing and printing
- `cypress/e2e/export.cy.ts` - Data export functionality

### Support Files
- `cypress/support/commands.ts` - Custom Cypress commands
- `cypress/support/e2e.ts` - Global configuration and setup

### Fixtures
- `cypress/fixtures/testPatient.json` - Test patient data
- `cypress/fixtures/testAppointment.json` - Test appointment data
- `cypress/fixtures/testConsultation.json` - Test consultation data

## Custom Commands

### `cy.login(username?, password?)`
Logs in a user and establishes a session.

Example:
```typescript
cy.login(); // Uses default test user
cy.login('doctor', 'custompassword'); // Custom credentials
```

### `cy.logout()`
Clears authentication tokens and redirects to login.

### `cy.seedTestData()`
Creates test data (patients, appointments) for testing.

### `cy.clearTestData()`
Removes test data after test completion.

## Configuration

Configuration is in `cypress.config.ts`:

```typescript
{
  baseUrl: 'http://localhost:5174', // Frontend dev server
  env: {
    apiUrl: 'http://localhost:5000/api', // Backend API
    testUser: {
      username: 'doctor',
      password: 'password123'
    }
  }
}
```

## Test Prerequisites

Before running E2E tests:

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Dev Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Ensure Database Running**
   - PostgreSQL should be running
   - Database seeded with test user

4. **Run Tests**
   ```bash
   npm run e2e
   ```

## Test Coverage

### Critical User Flows Tested

#### 1. Login Flow
- [x] Valid credentials
- [x] Invalid credentials
- [x] Session persistence
- [x] Logout functionality
- [x] Protected route access

#### 2. Patient Management
- [x] Search patients (typeahead)
- [x] View patient profile
- [x] Create new patient
- [x] Edit patient details
- [x] Form validation
- [x] Duplicate phone number error

#### 3. Appointment Scheduling
- [x] View daily appointments
- [x] Schedule new appointment
- [x] Update appointment status
- [x] Cancel appointment
- [x] Prevent double-booking
- [x] Date/time validation

#### 4. Consultation Workflow
- [x] Start consultation
- [x] Enter vitals
- [x] Enter diagnosis and complaints
- [x] Add medications
- [x] Remove medications
- [x] Save consultation
- [x] Prescription generation

#### 5. Prescription Management
- [x] View prescription details
- [x] Print prescription
- [x] Download PDF
- [x] Mark as printed
- [x] View prescription history

#### 6. Data Export
- [x] Export patients (CSV/PDF)
- [x] Export consultations (CSV/PDF)
- [x] Date range filtering
- [x] Download verification

## Best Practices

### 1. Use Data Attributes
```html
<div data-testid="patient-result">...</div>
```

### 2. Wait for Elements
```typescript
cy.contains('Loading...').should('not.exist');
cy.get('[data-testid="results"]').should('be.visible');
```

### 3. Intercept API Calls
```typescript
cy.intercept('GET', '/api/patients*').as('getPatients');
cy.wait('@getPatients');
```

### 4. Use Fixtures
```typescript
cy.fixture('testPatient').then((patient) => {
  cy.get('input[name="name"]').type(patient.name);
});
```

### 5. Clean Up After Tests
```typescript
afterEach(() => {
  cy.clearTestData();
});
```

## Debugging

### Screenshots
Screenshots are automatically captured on test failure:
- Location: `cypress/screenshots/`

### Videos
Videos can be enabled in `cypress.config.ts`:
```typescript
video: true
```

### Cypress Dashboard
View test results:
```bash
cypress run --record --key <your-key>
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    npm run dev &
    cd backend && npm run dev &
    sleep 10
    npm run e2e:run
```

## Troubleshooting

### Tests Timing Out
- Increase `defaultCommandTimeout` in `cypress.config.ts`
- Check backend/frontend servers are running
- Verify API endpoints are accessible

### Element Not Found
- Use `cy.wait()` for dynamic content
- Check selector specificity
- Use data-testid attributes

### Session Issues
- Clear browser cache: `cy.clearCookies()`, `cy.clearLocalStorage()`
- Check token expiration
- Verify authentication middleware

## Performance

Target metrics:
- Test suite execution: < 15 minutes
- Individual test: < 2 minutes
- No flaky tests (run 2x, both pass)

## References

- [Cypress Documentation](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [TypeScript Support](https://docs.cypress.io/guides/tooling/typescript-support)
