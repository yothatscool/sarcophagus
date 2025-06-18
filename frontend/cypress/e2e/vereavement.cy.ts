describe('Vereavement Protocol E2E Tests', () => {
  beforeEach(() => {
    // Mock VeChain wallet connection
    cy.window().then((win) => {
      win.connex = {
        thor: {
          account: cy.stub().as('account'),
          block: cy.stub().as('block'),
          transaction: cy.stub().as('transaction'),
        },
        vendor: {
          sign: cy.stub().as('sign'),
        },
      };
    });

    cy.visit('/');
  });

  it('displays main dashboard metrics', () => {
    cy.get('[data-testid="ritual-value"]').should('be.visible');
    cy.get('[data-testid="carbon-offset"]').should('be.visible');
    cy.get('[data-testid="longevity-score"]').should('be.visible');
  });

  it('creates a new ritual vault', () => {
    cy.get('[data-testid="create-vault-btn"]').click();
    cy.get('[data-testid="confirm-create-vault"]').click();
    
    // Mock transaction response
    cy.get('@sign').should('be.called');
    cy.get('[data-testid="success-notification"]')
      .should('be.visible')
      .and('contain', 'Ritual vault created successfully');
  });

  it('manages beneficiaries', () => {
    // Open beneficiary modal
    cy.get('[data-testid="manage-beneficiaries-btn"]').click();
    
    // Add new beneficiary
    cy.get('[data-testid="add-beneficiary-btn"]').click();
    cy.get('[data-testid="beneficiary-address"]')
      .type('0x123456789abcdef');
    cy.get('[data-testid="beneficiary-percentage"]')
      .type('30');
    cy.get('[data-testid="confirm-add-beneficiary"]').click();
    
    // Verify beneficiary added
    cy.get('[data-testid="beneficiary-list"]')
      .should('contain', '0x123456789abcdef')
      .and('contain', '30%');
    
    // Remove beneficiary
    cy.get('[data-testid="remove-beneficiary-btn"]').first().click();
    cy.get('[data-testid="confirm-remove-beneficiary"]').click();
    
    // Verify beneficiary removed
    cy.get('[data-testid="beneficiary-list"]')
      .should('not.contain', '0x123456789abcdef');
  });

  it('completes a ritual', () => {
    // Open ritual modal
    cy.get('[data-testid="complete-ritual-btn"]').click();
    
    // Select ritual type
    cy.get('[data-testid="ritual-type-meditation"]').click();
    cy.get('[data-testid="confirm-ritual"]').click();
    
    // Mock transaction response
    cy.get('@sign').should('be.called');
    cy.get('[data-testid="success-notification"]')
      .should('be.visible')
      .and('contain', 'Ritual completed successfully');
    
    // Verify ritual value increased
    cy.get('[data-testid="ritual-value"]')
      .should('not.contain', '0');
  });

  it('preserves a memorial', () => {
    // Open memorial modal
    cy.get('[data-testid="preserve-memorial-btn"]').click();
    
    // Add memorial content
    cy.get('[data-testid="memorial-content"]')
      .type('This is a test memorial message');
    cy.get('[data-testid="confirm-memorial"]').click();
    
    // Mock IPFS upload and transaction
    cy.get('@sign').should('be.called');
    cy.get('[data-testid="success-notification"]')
      .should('be.visible')
      .and('contain', 'Memorial preserved successfully');
  });

  it('displays transaction history', () => {
    // Mock transaction history
    cy.intercept('GET', '/api/transactions', {
      body: [
        {
          type: 'RITUAL_COMPLETION',
          timestamp: Date.now(),
          status: 'SUCCESS',
        },
        {
          type: 'BENEFICIARY_ADDED',
          timestamp: Date.now() - 1000,
          status: 'SUCCESS',
        },
      ],
    });

    cy.get('[data-testid="transaction-history"]')
      .should('contain', 'RITUAL_COMPLETION')
      .and('contain', 'BENEFICIARY_ADDED');
  });

  it('handles wallet connection errors', () => {
    // Simulate wallet disconnection
    cy.window().then((win) => {
      win.connex = null;
    });

    cy.get('[data-testid="wallet-connect-error"]')
      .should('be.visible')
      .and('contain', 'Please connect your wallet');
  });

  it('validates form inputs', () => {
    // Open beneficiary modal
    cy.get('[data-testid="manage-beneficiaries-btn"]').click();
    cy.get('[data-testid="add-beneficiary-btn"]').click();
    
    // Try to submit without input
    cy.get('[data-testid="confirm-add-beneficiary"]').click();
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Please fill in all fields');
    
    // Try invalid percentage
    cy.get('[data-testid="beneficiary-address"]')
      .type('0x123456789abcdef');
    cy.get('[data-testid="beneficiary-percentage"]')
      .type('101');
    cy.get('[data-testid="confirm-add-beneficiary"]').click();
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Percentage must be between 1 and 100');
  });

  it('updates metrics after actions', () => {
    // Get initial values
    cy.get('[data-testid="ritual-value"]').invoke('text').as('initialRitualValue');
    cy.get('[data-testid="carbon-offset"]').invoke('text').as('initialCarbonOffset');
    
    // Complete a ritual
    cy.get('[data-testid="complete-ritual-btn"]').click();
    cy.get('[data-testid="ritual-type-meditation"]').click();
    cy.get('[data-testid="confirm-ritual"]').click();
    
    // Verify metrics updated
    cy.get('[data-testid="ritual-value"]').should('not.have.text', '@initialRitualValue');
    cy.get('[data-testid="carbon-offset"]').should('not.have.text', '@initialCarbonOffset');
  });
}); 