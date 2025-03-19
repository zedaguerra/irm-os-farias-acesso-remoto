import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', '/dashboard');
  }, {
    validate: () => {
      cy.window().its('localStorage').invoke('getItem', 'supabase.auth.token')
        .should('exist');
    }
  });
});

Cypress.Commands.add('resetDatabase', () => {
  cy.task('resetDb');
});

Cypress.Commands.add('mockApi', (route: string, response: any) => {
  cy.intercept(route, response).as('apiMock');
});

Cypress.Commands.add('waitForApi', (alias: string) => {
  cy.wait(`@${alias}`).its('response.statusCode').should('eq', 200);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      resetDatabase(): Chainable<void>;
      mockApi(route: string, response: any): Chainable<void>;
      waitForApi(alias: string): Chainable<void>;
    }
  }
}