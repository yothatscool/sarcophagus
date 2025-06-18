describe('Ritual Completion Flow', () => {
  beforeEach(() => {
    cy.mockVeChainWallet();
    cy.visit('/');
  });

  it('completes meditation ritual successfully', () => {
    // Open ritual modal
    cy.get('[data-testid="complete-ritual-btn"]').click();
    
    // Select meditation ritual
    cy.get('[data-testid="ritual-meditation"]').click();
    
    // Complete ritual
    cy.get('[data-testid="submit-ritual"]').click();
    
    // Verify success notification
    cy.get('[data-testid="success-notification"]')
      .should('be.visible')
      .and('contain', 'Ritual completed successfully');
    
    // Verify ritual points increased
    cy.get('[data-testid="ritual-points"]')
      .should('contain', '10');
  });

  it('completes tree planting ritual successfully', () => {
    // Open ritual modal
    cy.get('[data-testid="complete-ritual-btn"]').click();
    
    // Select tree planting ritual
    cy.get('[data-testid="ritual-tree-planting"]').click();
    
    // Upload tree photo
    cy.get('[data-testid="tree-photo-upload"]')
      .attachFile('tree-photo.jpg');
    
    // Complete ritual
    cy.get('[data-testid="submit-ritual"]').click();
    
    // Verify success notification
    cy.get('[data-testid="success-notification"]')
      .should('be.visible')
      .and('contain', 'Ritual completed successfully');
    
    // Verify ritual points increased
    cy.get('[data-testid="ritual-points"]')
      .should('contain', '20');
  });

  it('completes story sharing ritual successfully', () => {
    // Open ritual modal
    cy.get('[data-testid="complete-ritual-btn"]').click();
    
    // Select story sharing ritual
    cy.get('[data-testid="ritual-story-sharing"]').click();
    
    // Enter story
    cy.get('[data-testid="story-text"]')
      .type('A memorable story about our loved one...');
    
    // Complete ritual
    cy.get('[data-testid="submit-ritual"]').click();
    
    // Verify success notification
    cy.get('[data-testid="success-notification"]')
      .should('be.visible')
      .and('contain', 'Ritual completed successfully');
    
    // Verify ritual points increased
    cy.get('[data-testid="ritual-points"]')
      .should('contain', '15');
  });

  it('completes charitable giving ritual successfully', () => {
    // Open ritual modal
    cy.get('[data-testid="complete-ritual-btn"]').click();
    
    // Select charitable giving ritual
    cy.get('[data-testid="ritual-charitable-giving"]').click();
    
    // Enter donation details
    cy.get('[data-testid="donation-amount"]').type('100');
    cy.get('[data-testid="charity-name"]').type('Red Cross');
    
    // Upload proof of donation
    cy.get('[data-testid="donation-proof-upload"]')
      .attachFile('donation-receipt.pdf');
    
    // Complete ritual
    cy.get('[data-testid="submit-ritual"]').click();
    
    // Verify success notification
    cy.get('[data-testid="success-notification"]')
      .should('be.visible')
      .and('contain', 'Ritual completed successfully');
    
    // Verify ritual points increased
    cy.get('[data-testid="ritual-points"]')
      .should('contain', '25');
  });

  it('handles ritual completion failure', () => {
    // Mock transaction failure
    cy.get('@sign').as('signTx').rejects(new Error('Transaction failed'));

    // Open ritual modal
    cy.get('[data-testid="complete-ritual-btn"]').click();
    
    // Select meditation ritual
    cy.get('[data-testid="ritual-meditation"]').click();
    
    // Try to complete ritual
    cy.get('[data-testid="submit-ritual"]').click();
    
    // Verify error notification
    cy.get('[data-testid="error-notification"]')
      .should('be.visible')
      .and('contain', 'Failed to complete ritual');
  });

  it('validates ritual selection', () => {
    // Open ritual modal
    cy.get('[data-testid="complete-ritual-btn"]').click();
    
    // Try to submit without selecting ritual
    cy.get('[data-testid="submit-ritual"]').click();
    
    // Verify validation message
    cy.get('[data-testid="validation-message"]')
      .should('be.visible')
      .and('contain', 'Please select a ritual type');
  });

  it('validates required fields for each ritual type', () => {
    // Open ritual modal
    cy.get('[data-testid="complete-ritual-btn"]').click();
    
    // Test tree planting validation
    cy.get('[data-testid="ritual-tree-planting"]').click();
    cy.get('[data-testid="submit-ritual"]').click();
    cy.get('[data-testid="validation-message"]')
      .should('contain', 'Please upload a photo of the planted tree');
    
    // Test story sharing validation
    cy.get('[data-testid="ritual-story-sharing"]').click();
    cy.get('[data-testid="submit-ritual"]').click();
    cy.get('[data-testid="validation-message"]')
      .should('contain', 'Please enter your story');
    
    // Test charitable giving validation
    cy.get('[data-testid="ritual-charitable-giving"]').click();
    cy.get('[data-testid="submit-ritual"]').click();
    cy.get('[data-testid="validation-message"]')
      .should('contain', 'Please enter donation amount and charity name');
  });

  it('updates ritual history after completion', () => {
    // Complete meditation ritual
    cy.get('[data-testid="complete-ritual-btn"]').click();
    cy.get('[data-testid="ritual-meditation"]').click();
    cy.get('[data-testid="submit-ritual"]').click();
    
    // Verify ritual appears in history
    cy.get('[data-testid="ritual-history"]')
      .should('contain', 'Meditation')
      .and('contain', new Date().toLocaleDateString());
  });

  it('updates metrics after ritual completion', () => {
    // Get initial metrics
    cy.get('[data-testid="total-rituals"]').invoke('text').as('initialRituals');
    cy.get('[data-testid="ritual-points"]').invoke('text').as('initialPoints');
    
    // Complete meditation ritual
    cy.get('[data-testid="complete-ritual-btn"]').click();
    cy.get('[data-testid="ritual-meditation"]').click();
    cy.get('[data-testid="submit-ritual"]').click();
    
    // Verify metrics updated
    cy.get('[data-testid="total-rituals"]')
      .should('not.have.text', '@initialRituals');
    cy.get('[data-testid="ritual-points"]')
      .should('not.have.text', '@initialPoints');
  });

  it('completes multiple rituals in sequence', () => {
    // Complete meditation ritual
    cy.get('[data-testid="complete-ritual-btn"]').click();
    cy.get('[data-testid="ritual-meditation"]').click();
    cy.get('[data-testid="submit-ritual"]').click();
    
    // Complete story sharing ritual
    cy.get('[data-testid="complete-ritual-btn"]').click();
    cy.get('[data-testid="ritual-story-sharing"]').click();
    cy.get('[data-testid="story-text"]')
      .type('A meaningful story...');
    cy.get('[data-testid="submit-ritual"]').click();
    
    // Verify both rituals in history
    cy.get('[data-testid="ritual-history"]')
      .should('contain', 'Meditation')
      .and('contain', 'Story Sharing');
  });
}); 