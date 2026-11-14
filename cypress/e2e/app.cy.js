describe('CSTAD DevOps Frontend Portal E2E', () => {
  it('loads the portal header and health endpoint', () => {
    cy.request('/api/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('UP');
    });

    cy.visit('/');
    cy.contains('CSTAD DevOps Final Project').should('be.visible');
    cy.contains('Deployment Tasks').should('be.visible');
  });
});

