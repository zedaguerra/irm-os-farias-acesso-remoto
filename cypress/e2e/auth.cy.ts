describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should show login form by default', () => {
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.contains('button', /entrar/i).should('exist');
  });

  it('should show validation errors for invalid input', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('123');
    cy.contains('button', /entrar/i).click();
    cy.contains(/email inválido/i).should('exist');
    cy.contains(/senha deve ter no mínimo 8 caracteres/i).should('exist');
  });

  it('should navigate to dashboard after successful login', () => {
    cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('TEST_USER_PASSWORD'));
    cy.contains('button', /entrar/i).click();
    cy.url().should('include', '/dashboard');
  });

  it('should handle password reset flow', () => {
    cy.contains(/esqueceu sua senha/i).click();
    cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'));
    cy.contains('button', /enviar link/i).click();
    cy.contains(/email enviado/i).should('exist');
  });

  it('should handle signup flow', () => {
    cy.contains(/criar conta/i).click();
    cy.get('input[type="email"]').type('newuser@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', /cadastrar/i).click();
    cy.contains(/verifique seu email/i).should('exist');
  });

  it('should handle logout', () => {
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'));
    cy.contains(/sair/i).click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should handle rate limiting', () => {
    for (let i = 0; i < 6; i++) {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.contains('button', /entrar/i).click();
    }
    cy.contains(/muitas tentativas/i).should('exist');
  });

  it('should maintain session after page reload', () => {
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'));
    cy.reload();
    cy.url().should('include', '/dashboard');
  });

  it('should handle session timeout', () => {
    cy.clock();
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'));
    cy.tick(3600000); // 1 hour
    cy.reload();
    cy.url().should('not.include', '/dashboard');
  });
});