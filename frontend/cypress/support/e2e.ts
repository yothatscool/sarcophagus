/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands';

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      // Add custom commands here
      mockVeChainWallet(): Chainable<void>;
      mockIPFS(): Chainable<void>;
    }
  }
}

// Mock VeChain wallet by default
beforeEach(() => {
  cy.mockVeChainWallet();
});

// Preserve cookies between tests
Cypress.Cookies.defaults({
  preserve: ['next-auth.session-token', 'next-auth.csrf-token'],
});

// Custom command to mock VeChain wallet
Cypress.Commands.add('mockVeChainWallet', () => {
  cy.window().then((win: Cypress.AUTWindow) => {
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
});

// Custom command to mock IPFS
Cypress.Commands.add('mockIPFS', () => {
  cy.intercept('POST', '/api/ipfs/upload', {
    statusCode: 200,
    body: {
      hash: 'QmTest123',
    },
  });

  cy.intercept('GET', '/api/ipfs/*', {
    statusCode: 200,
    body: {
      content: 'Test memorial content',
    },
  });
}); 