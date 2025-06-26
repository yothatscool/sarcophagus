describe('Enhanced Beneficiary Features', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.get('body').should('be.visible')
    
    // Mock wallet connection
    cy.window().then((win) => {
      win.ethereum = {
        isMetaMask: true,
        request: cy.stub().resolves(['0x1234567890123456789012345678901234567890']),
        on: cy.stub(),
        removeListener: cy.stub()
      }
    })
  })

  it('should create sarcophagus with contingent beneficiaries', () => {
    // Mock user verification
    cy.intercept('POST', '/api/verify', { statusCode: 200, body: { verified: true, age: 40 } })
    
    // Connect wallet and complete onboarding
    cy.get('[data-testid="connect-wallet"]').click()
    cy.get('[data-testid="onboarding-form"]').within(() => {
      cy.get('input[name="age"]').type('40')
      cy.get('select[name="gender"]').select('male')
      cy.get('select[name="country"]').select('United States')
      cy.get('select[name="lifestyle"]').select('moderate')
      cy.get('button[type="submit"]').click()
    })
    
    // Create vault
    cy.get('[data-testid="create-vault"]').click()
    
    // Add beneficiary with contingent
    cy.get('[data-testid="beneficiary-modal"]').within(() => {
      // Primary beneficiary
      cy.get('input[placeholder="0x..."]').first().type('0x1111111111111111111111111111111111111111')
      cy.get('input[type="range"]').first().invoke('val', 100).trigger('change')
      cy.get('input[type="number"]').first().clear().type('30')
      
      // Show advanced options
      cy.get('button').contains('Show Advanced Options').click()
      
      // Add contingent beneficiary
      cy.get('input[placeholder="Backup beneficiary address"]').type('0x2222222222222222222222222222222222222222')
      
      // Submit
      cy.get('button').contains('Create Sarcophagus').click()
    })
    
    // Verify creation
    cy.get('[data-testid="vault-created"]').should('be.visible')
  })

  it('should handle survivorship periods correctly', () => {
    // Mock user verification
    cy.intercept('POST', '/api/verify', { statusCode: 200, body: { verified: true, age: 45 } })
    
    // Connect wallet and complete onboarding
    cy.get('[data-testid="connect-wallet"]').click()
    cy.get('[data-testid="onboarding-form"]').within(() => {
      cy.get('input[name="age"]').type('45')
      cy.get('select[name="gender"]').select('female')
      cy.get('select[name="country"]').select('Canada')
      cy.get('select[name="lifestyle"]').select('active')
      cy.get('button[type="submit"]').click()
    })
    
    // Create vault
    cy.get('[data-testid="create-vault"]').click()
    
    // Add beneficiary with survivorship period
    cy.get('[data-testid="beneficiary-modal"]').within(() => {
      // Primary beneficiary
      cy.get('input[placeholder="0x..."]').first().type('0x3333333333333333333333333333333333333333')
      cy.get('input[type="range"]').first().invoke('val', 100).trigger('change')
      cy.get('input[type="number"]').first().clear().type('35')
      
      // Show advanced options
      cy.get('button').contains('Show Advanced Options').click()
      
      // Add survivorship period (90 days)
      cy.get('input[placeholder="0 = no requirement"]').first().clear().type('90')
      
      // Submit
      cy.get('button').contains('Create Sarcophagus').click()
    })
    
    // Verify creation
    cy.get('[data-testid="vault-created"]').should('be.visible')
  })

  it('should handle minor beneficiaries with guardians and successor guardians', () => {
    // Mock user verification
    cy.intercept('POST', '/api/verify', { statusCode: 200, body: { verified: true, age: 50 } })
    
    // Connect wallet and complete onboarding
    cy.get('[data-testid="connect-wallet"]').click()
    cy.get('[data-testid="onboarding-form"]').within(() => {
      cy.get('input[name="age"]').type('50')
      cy.get('select[name="gender"]').select('male')
      cy.get('select[name="country"]').select('United Kingdom')
      cy.get('select[name="lifestyle"]').select('sedentary')
      cy.get('button[type="submit"]').click()
    })
    
    // Create vault
    cy.get('[data-testid="create-vault"]').click()
    
    // Add minor beneficiary with guardian and successor guardian
    cy.get('[data-testid="beneficiary-modal"]').within(() => {
      // Minor beneficiary
      cy.get('input[placeholder="0x..."]').first().type('0x4444444444444444444444444444444444444444')
      cy.get('input[type="range"]').first().invoke('val', 100).trigger('change')
      cy.get('input[type="number"]').first().clear().type('12')
      
      // Guardian (should appear automatically for minor)
      cy.get('input[placeholder="0x..."]').eq(1).type('0x5555555555555555555555555555555555555555')
      
      // Show advanced options
      cy.get('button').contains('Show Advanced Options').click()
      
      // Add successor guardian
      cy.get('input[placeholder="Backup guardian address"]').type('0x6666666666666666666666666666666666666666')
      
      // Submit
      cy.get('button').contains('Create Sarcophagus').click()
    })
    
    // Verify creation
    cy.get('[data-testid="vault-created"]').should('be.visible')
  })

  it('should designate charity fallback', () => {
    // Mock user verification
    cy.intercept('POST', '/api/verify', { statusCode: 200, body: { verified: true, age: 55 } })
    
    // Connect wallet and complete onboarding
    cy.get('[data-testid="connect-wallet"]').click()
    cy.get('[data-testid="onboarding-form"]').within(() => {
      cy.get('input[name="age"]').type('55')
      cy.get('select[name="gender"]').select('female')
      cy.get('select[name="country"]').select('Australia')
      cy.get('select[name="lifestyle"]').select('moderate')
      cy.get('button[type="submit"]').click()
    })
    
    // Create vault
    cy.get('[data-testid="create-vault"]').click()
    
    // Add beneficiary and charity
    cy.get('[data-testid="beneficiary-modal"]').within(() => {
      // Primary beneficiary
      cy.get('input[placeholder="0x..."]').first().type('0x7777777777777777777777777777777777777777')
      cy.get('input[type="range"]').first().invoke('val', 100).trigger('change')
      cy.get('input[type="number"]').first().clear().type('40')
      
      // Scroll to charity section
      cy.get('h3').contains('Charity Fallback').scrollIntoView()
      
      // Add charity address
      cy.get('input[placeholder="0x..."]').last().type('0x8888888888888888888888888888888888888888')
      
      // Submit
      cy.get('button').contains('Create Sarcophagus').click()
    })
    
    // Verify creation
    cy.get('[data-testid="vault-created"]').should('be.visible')
  })

  it('should validate beneficiary percentages correctly', () => {
    // Mock user verification
    cy.intercept('POST', '/api/verify', { statusCode: 200, body: { verified: true, age: 60 } })
    
    // Connect wallet and complete onboarding
    cy.get('[data-testid="connect-wallet"]').click()
    cy.get('[data-testid="onboarding-form"]').within(() => {
      cy.get('input[name="age"]').type('60')
      cy.get('select[name="gender"]').select('male')
      cy.get('select[name="country"]').select('Germany')
      cy.get('select[name="lifestyle"]').select('active')
      cy.get('button[type="submit"]').click()
    })
    
    // Create vault
    cy.get('[data-testid="create-vault"]').click()
    
    // Test percentage validation
    cy.get('[data-testid="beneficiary-modal"]').within(() => {
      // Add first beneficiary
      cy.get('input[placeholder="0x..."]').first().type('0x9999999999999999999999999999999999999999')
      cy.get('input[type="range"]').first().invoke('val', 60).trigger('change')
      cy.get('input[type="number"]').first().clear().type('45')
      
      // Add second beneficiary
      cy.get('button').contains('Add Beneficiary').click()
      cy.get('input[placeholder="0x..."]').eq(1).type('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      cy.get('input[type="range"]').eq(1).invoke('val', 50).trigger('change')
      cy.get('input[type="number"]').eq(1).clear().type('50')
      
      // Check total percentage (should be 110% - invalid)
      cy.get('span').contains('Total Percentage: 110%').should('be.visible')
      cy.get('span').contains('✗ Must equal 100%').should('be.visible')
      
      // Submit button should be disabled
      cy.get('button').contains('Create Sarcophagus').should('be.disabled')
      
      // Fix percentage
      cy.get('input[type="range"]').eq(1).invoke('val', 40).trigger('change')
      
      // Check total percentage (should be 100% - valid)
      cy.get('span').contains('Total Percentage: 100%').should('be.visible')
      cy.get('span').contains('✓ Valid').should('be.visible')
      
      // Submit button should be enabled
      cy.get('button').contains('Create Sarcophagus').should('not.be.disabled')
    })
  })

  it('should handle multiple beneficiaries with complex scenarios', () => {
    // Mock user verification
    cy.intercept('POST', '/api/verify', { statusCode: 200, body: { verified: true, age: 65 } })
    
    // Connect wallet and complete onboarding
    cy.get('[data-testid="connect-wallet"]').click()
    cy.get('[data-testid="onboarding-form"]').within(() => {
      cy.get('input[name="age"]').type('65')
      cy.get('select[name="gender"]').select('female')
      cy.get('select[name="country"]').select('Japan')
      cy.get('select[name="lifestyle"]').select('moderate')
      cy.get('button[type="submit"]').click()
    })
    
    // Create vault
    cy.get('[data-testid="create-vault"]').click()
    
    // Add multiple beneficiaries with different scenarios
    cy.get('[data-testid="beneficiary-modal"]').within(() => {
      // Adult beneficiary 1
      cy.get('input[placeholder="0x..."]').first().type('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
      cy.get('input[type="range"]').first().invoke('val', 40).trigger('change')
      cy.get('input[type="number"]').first().clear().type('35')
      
      // Add second beneficiary (minor)
      cy.get('button').contains('Add Beneficiary').click()
      cy.get('input[placeholder="0x..."]').eq(1).type('0xcccccccccccccccccccccccccccccccccccccccc')
      cy.get('input[type="range"]').eq(1).invoke('val', 30).trigger('change')
      cy.get('input[type="number"]').eq(1).clear().type('16')
      cy.get('input[placeholder="0x..."]').eq(2).type('0xdddddddddddddddddddddddddddddddddddddddd')
      
      // Add third beneficiary (adult with contingent)
      cy.get('button').contains('Add Beneficiary').click()
      cy.get('input[placeholder="0x..."]').eq(3).type('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
      cy.get('input[type="range"]').eq(2).invoke('val', 30).trigger('change')
      cy.get('input[type="number"]').eq(2).clear().type('28')
      
      // Show advanced options for third beneficiary
      cy.get('button').contains('Show Advanced Options').eq(1).click()
      cy.get('input[placeholder="Backup beneficiary address"]').eq(1).type('0xffffffffffffffffffffffffffffffffffffffff')
      cy.get('input[placeholder="0 = no requirement"]').eq(1).clear().type('60')
      
      // Add charity
      cy.get('input[placeholder="0x..."]').last().type('0x1111111111111111111111111111111111111111')
      
      // Submit
      cy.get('button').contains('Create Sarcophagus').click()
    })
    
    // Verify creation
    cy.get('[data-testid="vault-created"]').should('be.visible')
  })

  it('should validate age restrictions correctly', () => {
    // Mock user verification
    cy.intercept('POST', '/api/verify', { statusCode: 200, body: { verified: true, age: 70 } })
    
    // Connect wallet and complete onboarding
    cy.get('[data-testid="connect-wallet"]').click()
    cy.get('[data-testid="onboarding-form"]').within(() => {
      cy.get('input[name="age"]').type('70')
      cy.get('select[name="gender"]').select('male')
      cy.get('select[name="country"]').select('France')
      cy.get('select[name="lifestyle"]').select('sedentary')
      cy.get('button[type="submit"]').click()
    })
    
    // Create vault
    cy.get('[data-testid="create-vault"]').click()
    
    // Test age validation
    cy.get('[data-testid="beneficiary-modal"]').within(() => {
      // Test invalid age (negative)
      cy.get('input[type="number"]').first().clear().type('-5')
      cy.get('button').contains('Create Sarcophagus').should('be.disabled')
      
      // Test invalid age (too high)
      cy.get('input[type="number"]').first().clear().type('150')
      cy.get('button').contains('Create Sarcophagus').should('be.disabled')
      
      // Test valid age
      cy.get('input[type="number"]').first().clear().type('25')
      cy.get('input[placeholder="0x..."]').first().type('0x2222222222222222222222222222222222222222')
      cy.get('input[type="range"]').first().invoke('val', 100).trigger('change')
      
      // Submit button should be enabled
      cy.get('button').contains('Create Sarcophagus').should('not.be.disabled')
    })
  })

  it('should handle guardian requirements for minors', () => {
    // Mock user verification
    cy.intercept('POST', '/api/verify', { statusCode: 200, body: { verified: true, age: 75 } })
    
    // Connect wallet and complete onboarding
    cy.get('[data-testid="connect-wallet"]').click()
    cy.get('[data-testid="onboarding-form"]').within(() => {
      cy.get('input[name="age"]').type('75')
      cy.get('select[name="gender"]').select('female')
      cy.get('select[name="country"]').select('Italy')
      cy.get('select[name="lifestyle"]').select('moderate')
      cy.get('button[type="submit"]').click()
    })
    
    // Create vault
    cy.get('[data-testid="create-vault"]').click()
    
    // Test guardian requirement
    cy.get('[data-testid="beneficiary-modal"]').within(() => {
      // Add minor beneficiary without guardian
      cy.get('input[placeholder="0x..."]').first().type('0x3333333333333333333333333333333333333333')
      cy.get('input[type="range"]').first().invoke('val', 100).trigger('change')
      cy.get('input[type="number"]').first().clear().type('15')
      
      // Submit button should be disabled (guardian required)
      cy.get('button').contains('Create Sarcophagus').should('be.disabled')
      
      // Add guardian
      cy.get('input[placeholder="0x..."]').eq(1).type('0x4444444444444444444444444444444444444444')
      
      // Submit button should be enabled
      cy.get('button').contains('Create Sarcophagus').should('not.be.disabled')
    })
  })
}) 