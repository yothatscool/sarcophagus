# Testing Guide

## Overview

This guide covers comprehensive testing strategies for the Sarcophagus Protocol's enhanced beneficiary features, including unit tests, integration tests, and end-to-end tests.

## 🧪 **Testing Strategy**

### **Test Pyramid**
```
    E2E Tests (Cypress)
        /     \
   Integration Tests
        /     \
   Unit Tests (Jest)
```

### **Coverage Goals**
- **Unit Tests:** 90%+ coverage
- **Integration Tests:** All major workflows
- **E2E Tests:** Critical user journeys

## 🔧 **Unit Tests**

### **Smart Contract Tests**

#### **Enhanced Beneficiary Structure Tests**
```javascript
describe('Enhanced Beneficiary Features', () => {
  let sarcophagus, owner, beneficiary1, beneficiary2, guardian, charity;

  beforeEach(async () => {
    [owner, beneficiary1, beneficiary2, guardian, charity] = await ethers.getSigners();
    sarcophagus = await Sarcophagus.deploy(/* constructor params */);
  });

  describe('Beneficiary Creation', () => {
    it('should create sarcophagus with enhanced beneficiaries', async () => {
      const beneficiaries = [beneficiary1.address, beneficiary2.address];
      const percentages = [6000, 4000]; // 60%, 40%
      const guardians = [ethers.constants.AddressZero, guardian.address];
      const ages = [25, 15];

      await sarcophagus.createSarcophagusWithGuardians(
        beneficiaries, percentages, guardians, ages
      );

      const sarcophagusData = await sarcophagus.sarcophagi(owner.address);
      expect(sarcophagusData.beneficiaries.length).to.equal(2);
    });

    it('should validate guardian requirements for minors', async () => {
      const beneficiaries = [beneficiary1.address];
      const percentages = [10000];
      const guardians = [ethers.constants.AddressZero]; // No guardian for minor
      const ages = [15];

      await expect(
        sarcophagus.createSarcophagusWithGuardians(
          beneficiaries, percentages, guardians, ages
        )
      ).to.be.revertedWith('GuardianRequired');
    });

    it('should validate age restrictions', async () => {
      const beneficiaries = [beneficiary1.address];
      const percentages = [10000];
      const guardians = [guardian.address];
      const ages = [150]; // Invalid age

      await expect(
        sarcophagus.createSarcophagusWithGuardians(
          beneficiaries, percentages, guardians, ages
        )
      ).to.be.revertedWith('InvalidAge');
    });
  });

  describe('Enhanced Beneficiary Updates', () => {
    beforeEach(async () => {
      // Setup basic sarcophagus
      await sarcophagus.createSarcophagusWithGuardians(
        [beneficiary1.address], [10000], [guardian.address], [25]
      );
    });

    it('should update beneficiary with contingent beneficiary', async () => {
      await sarcophagus.updateBeneficiaryEnhanced(
        0, beneficiary2.address, 30, ethers.constants.AddressZero, ''
      );

      const beneficiary = await sarcophagus.getBeneficiaryEnhanced(owner.address, 0);
      expect(beneficiary.contingentBeneficiary).to.equal(beneficiary2.address);
      expect(beneficiary.survivorshipPeriod).to.equal(30);
    });

    it('should validate survivorship period limits', async () => {
      await expect(
        sarcophagus.updateBeneficiaryEnhanced(
          0, ethers.constants.AddressZero, 400, ethers.constants.AddressZero, ''
        )
      ).to.be.revertedWith('InvalidSurvivorshipPeriod');
    });

    it('should validate contingent beneficiary', async () => {
      await expect(
        sarcophagus.updateBeneficiaryEnhanced(
          0, beneficiary1.address, 0, ethers.constants.AddressZero, ''
        )
      ).to.be.revertedWith('InvalidContingentBeneficiary');
    });
  });

  describe('Beneficiary Health Management', () => {
    beforeEach(async () => {
      await sarcophagus.createSarcophagusWithGuardians(
        [beneficiary1.address], [10000], [guardian.address], [25]
      );
    });

    it('should report beneficiary death', async () => {
      const deathTimestamp = Math.floor(Date.now() / 1000);
      
      await sarcophagus.reportBeneficiaryDeath(
        owner.address, 0, deathTimestamp
      );

      const beneficiary = await sarcophagus.getBeneficiaryEnhanced(owner.address, 0);
      expect(beneficiary.isDeceased).to.be.true;
      expect(beneficiary.deathTimestamp).to.equal(deathTimestamp);
    });

    it('should report beneficiary incapacity', async () => {
      await sarcophagus.reportBeneficiaryIncapacity(
        owner.address, 0, true
      );

      const beneficiary = await sarcophagus.getBeneficiaryEnhanced(owner.address, 0);
      expect(beneficiary.isIncapacitated).to.be.true;
    });

    it('should prevent duplicate death reports', async () => {
      await sarcophagus.reportBeneficiaryDeath(owner.address, 0, Date.now() / 1000);
      
      await expect(
        sarcophagus.reportBeneficiaryDeath(owner.address, 0, Date.now() / 1000)
      ).to.be.revertedWith('BeneficiaryIsDeceased');
    });
  });

  describe('Survivorship Requirements', () => {
    beforeEach(async () => {
      await sarcophagus.createSarcophagusWithGuardians(
        [beneficiary1.address], [10000], [guardian.address], [25]
      );
      await sarcophagus.updateBeneficiaryEnhanced(
        0, ethers.constants.AddressZero, 30, ethers.constants.AddressZero, ''
      );
    });

    it('should check survivorship requirements correctly', async () => {
      const [meetsRequirements, reason] = await sarcophagus.checkSurvivorshipRequirements(
        owner.address, 0
      );
      
      expect(meetsRequirements).to.be.true;
      expect(reason).to.equal('Requirements met');
    });

    it('should fail survivorship check for deceased beneficiary', async () => {
      await sarcophagus.reportBeneficiaryDeath(owner.address, 0, Date.now() / 1000);
      
      const [meetsRequirements, reason] = await sarcophagus.checkSurvivorshipRequirements(
        owner.address, 0
      );
      
      expect(meetsRequirements).to.be.false;
      expect(reason).to.equal('Beneficiary is deceased');
    });

    it('should fail survivorship check for incapacitated beneficiary', async () => {
      await sarcophagus.reportBeneficiaryIncapacity(owner.address, 0, true);
      
      const [meetsRequirements, reason] = await sarcophagus.checkSurvivorshipRequirements(
        owner.address, 0
      );
      
      expect(meetsRequirements).to.be.false;
      expect(reason).to.equal('Beneficiary is incapacitated');
    });
  });

  describe('Charity Fallback', () => {
    beforeEach(async () => {
      await sarcophagus.createSarcophagusWithGuardians(
        [beneficiary1.address], [10000], [guardian.address], [25]
      );
    });

    it('should designate charity', async () => {
      await sarcophagus.designateCharity(charity.address);
      
      const designatedCharity = await sarcophagus.charityDesignations(owner.address);
      expect(designatedCharity).to.equal(charity.address);
    });

    it('should handle estate fallback when no valid beneficiaries', async () => {
      await sarcophagus.designateCharity(charity.address);
      await sarcophagus.reportBeneficiaryDeath(owner.address, 0, Date.now() / 1000);
      
      // Add some tokens to the vault
      await sarcophagus.depositTokens({ value: ethers.utils.parseEther('1') });
      
      await sarcophagus.handleEstateFallback(owner.address);
      
      const charityBalance = await ethers.provider.getBalance(charity.address);
      expect(charityBalance).to.be.gt(0);
    });

    it('should fail estate fallback without charity designation', async () => {
      await sarcophagus.reportBeneficiaryDeath(owner.address, 0, Date.now() / 1000);
      
      await expect(
        sarcophagus.handleEstateFallback(owner.address)
      ).to.be.revertedWith('CharityNotDesignated');
    });
  });

  describe('Enhanced Inheritance Claiming', () => {
    beforeEach(async () => {
      await sarcophagus.createSarcophagusWithGuardians(
        [beneficiary1.address], [10000], [guardian.address], [25]
      );
      await sarcophagus.depositTokens({ value: ethers.utils.parseEther('1') });
    });

    it('should claim inheritance with enhanced validation', async () => {
      // Simulate user death
      await sarcophagus.reportDeath(owner.address, 80, Date.now() / 1000);
      
      await sarcophagus.connect(beneficiary1).claimInheritanceEnhanced(
        owner.address, 0
      );
      
      const claimed = await sarcophagus.claimed(owner.address, beneficiary1.address);
      expect(claimed).to.be.true;
    });

    it('should fail claim for deceased beneficiary', async () => {
      await sarcophagus.reportDeath(owner.address, 80, Date.now() / 1000);
      await sarcophagus.reportBeneficiaryDeath(owner.address, 0, Date.now() / 1000);
      
      await expect(
        sarcophagus.connect(beneficiary1).claimInheritanceEnhanced(owner.address, 0)
      ).to.be.revertedWith('BeneficiaryIsDeceased');
    });

    it('should fail claim for incapacitated beneficiary', async () => {
      await sarcophagus.reportDeath(owner.address, 80, Date.now() / 1000);
      await sarcophagus.reportBeneficiaryIncapacity(owner.address, 0, true);
      
      await expect(
        sarcophagus.connect(beneficiary1).claimInheritanceEnhanced(owner.address, 0)
      ).to.be.revertedWith('BeneficiaryIsIncapacitated');
    });

    it('should fail claim if survivorship period not met', async () => {
      await sarcophagus.updateBeneficiaryEnhanced(
        0, ethers.constants.AddressZero, 30, ethers.constants.AddressZero, ''
      );
      await sarcophagus.reportDeath(owner.address, 80, Date.now() / 1000);
      
      await expect(
        sarcophagus.connect(beneficiary1).claimInheritanceEnhanced(owner.address, 0)
      ).to.be.revertedWith('SurvivorshipPeriodNotMet');
    });
  });
});
```

### **Frontend Component Tests**

#### **BeneficiaryModal Tests**
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BeneficiaryModal from '../components/BeneficiaryModal';

describe('BeneficiaryModal', () => {
  const mockOnComplete = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render basic beneficiary form', () => {
    render(
      <BeneficiaryModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Designate Beneficiaries')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0x...')).toBeInTheDocument();
    expect(screen.getByText('Percentage (100%)')).toBeInTheDocument();
  });

  it('should add beneficiary when button clicked', () => {
    render(
      <BeneficiaryModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const addButton = screen.getByText('Add Beneficiary (1/5)');
    fireEvent.click(addButton);

    const beneficiaryInputs = screen.getAllByPlaceholderText('0x...');
    expect(beneficiaryInputs).toHaveLength(2);
  });

  it('should show guardian field for minor beneficiary', () => {
    render(
      <BeneficiaryModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const ageInput = screen.getByDisplayValue('18');
    fireEvent.change(ageInput, { target: { value: '15' } });

    expect(screen.getByText('Guardian Address (Required for minors)')).toBeInTheDocument();
  });

  it('should show advanced options when toggled', () => {
    render(
      <BeneficiaryModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    const advancedButton = screen.getByText('Show Advanced Options');
    fireEvent.click(advancedButton);

    expect(screen.getByText('Contingent Beneficiary')).toBeInTheDocument();
    expect(screen.getByText('Survivorship Period (days)')).toBeInTheDocument();
    expect(screen.getByText('Successor Guardian')).toBeInTheDocument();
  });

  it('should validate beneficiary data correctly', async () => {
    render(
      <BeneficiaryModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Fill in valid beneficiary data
    const addressInput = screen.getByPlaceholderText('0x...');
    fireEvent.change(addressInput, { target: { value: '0x1234567890123456789012345678901234567890' } });

    const submitButton = screen.getByText('Create Sarcophagus');
    expect(submitButton).not.toBeDisabled();
  });

  it('should show validation errors for invalid data', () => {
    render(
      <BeneficiaryModal
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
      />
    );

    // Add second beneficiary with invalid percentage
    const addButton = screen.getByText('Add Beneficiary (1/5)');
    fireEvent.click(addButton);

    const percentageSliders = screen.getAllByRole('slider');
    fireEvent.change(percentageSliders[1], { target: { value: '50' } });

    expect(screen.getByText('✗ Must equal 100%')).toBeInTheDocument();
  });
});
```

#### **BeneficiaryHealthManager Tests**
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BeneficiaryHealthManager from '../components/BeneficiaryHealthManager';

describe('BeneficiaryHealthManager', () => {
  const mockOnClose = jest.fn();
  const mockUserAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render beneficiary health overview', async () => {
    render(
      <BeneficiaryHealthManager
        userAddress={mockUserAddress}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Beneficiary Health Management')).toBeInTheDocument();
    });
  });

  it('should display beneficiary status correctly', async () => {
    // Mock beneficiary data
    const mockBeneficiaries = [
      {
        address: '0x1111111111111111111111111111111111111111',
        isDeceased: false,
        isIncapacitated: false,
        survivorshipPeriod: 0,
        meetsSurvivorship: true
      },
      {
        address: '0x2222222222222222222222222222222222222222',
        isDeceased: true,
        isIncapacitated: false,
        survivorshipPeriod: 30,
        meetsSurvivorship: false
      }
    ];

    render(
      <BeneficiaryHealthManager
        userAddress={mockUserAddress}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Eligible')).toBeInTheDocument();
      expect(screen.getByText('Deceased')).toBeInTheDocument();
    });
  });

  it('should show report status button for eligible beneficiaries', async () => {
    render(
      <BeneficiaryHealthManager
        userAddress={mockUserAddress}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const reportButton = screen.getByText('Report Status Change');
      expect(reportButton).toBeInTheDocument();
    });
  });

  it('should open status report modal when button clicked', async () => {
    render(
      <BeneficiaryHealthManager
        userAddress={mockUserAddress}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const reportButton = screen.getByText('Report Status Change');
      fireEvent.click(reportButton);
    });

    expect(screen.getByText('Report Beneficiary Status')).toBeInTheDocument();
    expect(screen.getByText('Report Type')).toBeInTheDocument();
  });

  it('should show charity warning when no eligible beneficiaries', async () => {
    // Mock all beneficiaries deceased
    render(
      <BeneficiaryHealthManager
        userAddress={mockUserAddress}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No eligible beneficiaries found')).toBeInTheDocument();
      expect(screen.getByText('Consider designating a charity fallback')).toBeInTheDocument();
    });
  });
});
```

## 🔗 **Integration Tests**

### **Complete Workflow Tests**
```javascript
describe('Enhanced Beneficiary Integration Tests', () => {
  let sarcophagus, owner, beneficiary1, beneficiary2, guardian, charity;

  beforeEach(async () => {
    [owner, beneficiary1, beneficiary2, guardian, charity] = await ethers.getSigners();
    sarcophagus = await Sarcophagus.deploy(/* constructor params */);
  });

  it('should complete full enhanced beneficiary setup', async () => {
    // 1. Create sarcophagus with enhanced beneficiaries
    await sarcophagus.createSarcophagusWithGuardians(
      [beneficiary1.address, beneficiary2.address],
      [6000, 4000],
      [ethers.constants.AddressZero, guardian.address],
      [25, 15]
    );

    // 2. Update with enhanced features
    await sarcophagus.updateBeneficiaryEnhanced(
      0, beneficiary2.address, 30, ethers.constants.AddressZero, 'QmContactInfo'
    );

    // 3. Designate charity
    await sarcophagus.designateCharity(charity.address);

    // 4. Deposit tokens
    await sarcophagus.depositTokens({ value: ethers.utils.parseEther('1') });

    // 5. Verify setup
    const sarcophagusData = await sarcophagus.sarcophagi(owner.address);
    expect(sarcophagusData.beneficiaries.length).to.equal(2);
    
    const beneficiary = await sarcophagus.getBeneficiaryEnhanced(owner.address, 0);
    expect(beneficiary.contingentBeneficiary).to.equal(beneficiary2.address);
    expect(beneficiary.survivorshipPeriod).to.equal(30);
    
    const designatedCharity = await sarcophagus.charityDesignations(owner.address);
    expect(designatedCharity).to.equal(charity.address);
  });

  it('should handle complex inheritance scenario', async () => {
    // Setup complex scenario
    await sarcophagus.createSarcophagusWithGuardians(
      [beneficiary1.address, beneficiary2.address],
      [6000, 4000],
      [ethers.constants.AddressZero, guardian.address],
      [25, 15]
    );

    await sarcophagus.updateBeneficiaryEnhanced(
      0, beneficiary2.address, 30, ethers.constants.AddressZero, ''
    );

    await sarcophagus.depositTokens({ value: ethers.utils.parseEther('1') });

    // Simulate user death
    await sarcophagus.reportDeath(owner.address, 80, Date.now() / 1000);

    // Report beneficiary 1 death (within survivorship period)
    await sarcophagus.reportBeneficiaryDeath(owner.address, 0, Date.now() / 1000);

    // Contingent beneficiary should inherit
    const [validBeneficiaries, totalPercentage] = await sarcophagus.getValidBeneficiaries(owner.address);
    expect(validBeneficiaries.length).to.equal(1);
    expect(totalPercentage).to.equal(10000); // 100%
  });

  it('should handle charity fallback scenario', async () => {
    // Setup with charity
    await sarcophagus.createSarcophagusWithGuardians(
      [beneficiary1.address], [10000], [guardian.address], [25]
    );
    await sarcophagus.designateCharity(charity.address);
    await sarcophagus.depositTokens({ value: ethers.utils.parseEther('1') });

    // Report all beneficiaries deceased
    await sarcophagus.reportBeneficiaryDeath(owner.address, 0, Date.now() / 1000);
    await sarcophagus.reportDeath(owner.address, 80, Date.now() / 1000);

    // Handle estate fallback
    await sarcophagus.handleEstateFallback(owner.address);

    // Charity should receive estate
    const charityBalance = await ethers.provider.getBalance(charity.address);
    expect(charityBalance).to.be.gt(0);
  });
});
```

## 🌐 **End-to-End Tests (Cypress)**

### **Enhanced Beneficiary Setup Tests**
```javascript
describe('Enhanced Beneficiary E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('body').should('be.visible');
  });

  it('should complete full enhanced beneficiary setup', () => {
    // Connect wallet
    cy.get('[data-testid="connect-wallet"]').click();
    cy.get('[data-testid="wallet-connected"]').should('be.visible');

    // Complete onboarding
    cy.get('[data-testid="onboarding-form"]').within(() => {
      cy.get('input[name="age"]').type('35');
      cy.get('select[name="gender"]').select('male');
      cy.get('select[name="country"]').select('United States');
      cy.get('select[name="lifestyle"]').select('moderate');
      cy.get('button[type="submit"]').click();
    });

    // Create vault
    cy.get('[data-testid="create-vault"]').click();

    // Fill enhanced beneficiary form
    cy.get('[data-testid="beneficiary-modal"]').within(() => {
      // Primary beneficiary
      cy.get('input[placeholder="0x..."]').first().type('0x1111111111111111111111111111111111111111');
      cy.get('input[type="range"]').first().invoke('val', 60).trigger('change');
      cy.get('input[type="number"]').first().clear().type('30');

      // Add second beneficiary (minor)
      cy.get('button').contains('Add Beneficiary').click();
      cy.get('input[placeholder="0x..."]').eq(1).type('0x2222222222222222222222222222222222222222');
      cy.get('input[type="range"]').eq(1).invoke('val', 40).trigger('change');
      cy.get('input[type="number"]').eq(1).clear().type('15');
      cy.get('input[placeholder="0x..."]').eq(2).type('0x3333333333333333333333333333333333333333');

      // Show advanced options
      cy.get('button').contains('Show Advanced Options').click();

      // Add contingent beneficiary
      cy.get('input[placeholder="Backup beneficiary address"]').type('0x4444444444444444444444444444444444444444');

      // Add survivorship period
      cy.get('input[placeholder="0 = no requirement"]').first().clear().type('30');

      // Add successor guardian
      cy.get('input[placeholder="Backup guardian address"]').type('0x5555555555555555555555555555555555555555');

      // Add charity
      cy.get('input[placeholder="0x..."]').last().type('0x6666666666666666666666666666666666666666');

      // Submit
      cy.get('button').contains('Create Sarcophagus').click();
    });

    // Verify creation
    cy.get('[data-testid="vault-created"]').should('be.visible');
  });

  it('should manage beneficiary health', () => {
    // Setup existing vault
    cy.intercept('GET', '/api/sarcophagus/*', {
      statusCode: 200,
      body: {
        hasSarcophagus: true,
        beneficiaries: [
          {
            recipient: '0x1111111111111111111111111111111111111111',
            percentage: 100,
            age: 25,
            isDeceased: false,
            isIncapacitated: false
          }
        ]
      }
    });

    // Connect wallet
    cy.get('[data-testid="connect-wallet"]').click();

    // Open health manager
    cy.get('button').contains('Manage Beneficiary Health').click();

    // Verify modal opens
    cy.get('[data-testid="beneficiary-health-modal"]').should('be.visible');

    // Report status change
    cy.get('button').contains('Report Status Change').click();

    // Fill death report
    cy.get('select').select('Death');
    cy.get('input[type="datetime-local"]').type('2025-01-15T10:30');

    // Submit report
    cy.get('button').contains('Report Status').click();

    // Verify success
    cy.get('[data-testid="report-success"]').should('be.visible');
  });

  it('should handle validation errors', () => {
    // Connect wallet
    cy.get('[data-testid="connect-wallet"]').click();

    // Create vault
    cy.get('[data-testid="create-vault"]').click();

    // Test invalid percentage
    cy.get('[data-testid="beneficiary-modal"]').within(() => {
      cy.get('input[placeholder="0x..."]').first().type('0x1111111111111111111111111111111111111111');
      cy.get('input[type="range"]').first().invoke('val', 60).trigger('change');

      // Add second beneficiary with invalid percentage
      cy.get('button').contains('Add Beneficiary').click();
      cy.get('input[placeholder="0x..."]').eq(1).type('0x2222222222222222222222222222222222222222');
      cy.get('input[type="range"]').eq(1).invoke('val', 50).trigger('change');

      // Check validation error
      cy.get('span').contains('✗ Must equal 100%').should('be.visible');
      cy.get('button').contains('Create Sarcophagus').should('be.disabled');
    });
  });
});
```

## 📊 **Test Data Management**

### **Mock Data Generators**
```javascript
// test/helpers/mockData.js
export const generateBeneficiaryData = (count = 1) => {
  const beneficiaries = [];
  
  for (let i = 0; i < count; i++) {
    beneficiaries.push({
      address: `0x${i.toString().padStart(40, '0')}`,
      percentage: Math.floor(100 / count),
      age: 25 + i * 5,
      guardian: i === 1 ? `0xguardian${i}` : ethers.constants.AddressZero,
      contingentBeneficiary: `0xcontingent${i}`,
      survivorshipPeriod: i * 30,
      successorGuardian: `0xsuccessor${i}`,
      contactInfo: `QmContactInfo${i}`
    });
  }
  
  return beneficiaries;
};

export const generateHealthData = (beneficiaries) => {
  return beneficiaries.map((beneficiary, index) => ({
    address: beneficiary.address,
    isDeceased: index === 1, // Second beneficiary deceased
    isIncapacitated: index === 2, // Third beneficiary incapacitated
    deathTimestamp: index === 1 ? Date.now() / 1000 : undefined,
    survivorshipPeriod: beneficiary.survivorshipPeriod,
    meetsSurvivorship: index !== 1 && index !== 2,
    reason: index === 1 ? 'Beneficiary is deceased' : undefined
  }));
};
```

### **Test Utilities**
```javascript
// test/helpers/testUtils.js
export const setupSarcophagus = async (sarcophagus, owner, beneficiaries) => {
  const addresses = beneficiaries.map(b => b.address);
  const percentages = beneficiaries.map(b => b.percentage * 100);
  const guardians = beneficiaries.map(b => b.guardian);
  const ages = beneficiaries.map(b => b.age);

  await sarcophagus.createSarcophagusWithGuardians(
    addresses, percentages, guardians, ages
  );

  // Update with enhanced features
  for (let i = 0; i < beneficiaries.length; i++) {
    const beneficiary = beneficiaries[i];
    if (beneficiary.contingentBeneficiary || beneficiary.survivorshipPeriod) {
      await sarcophagus.updateBeneficiaryEnhanced(
        i,
        beneficiary.contingentBeneficiary,
        beneficiary.survivorshipPeriod,
        beneficiary.successorGuardian,
        beneficiary.contactInfo
      );
    }
  }
};

export const simulateUserDeath = async (sarcophagus, userAddress, age) => {
  await sarcophagus.reportDeath(userAddress, age, Date.now() / 1000);
};

export const reportBeneficiaryStatus = async (sarcophagus, userAddress, beneficiaryIndex, status) => {
  if (status === 'deceased') {
    await sarcophagus.reportBeneficiaryDeath(userAddress, beneficiaryIndex, Date.now() / 1000);
  } else if (status === 'incapacitated') {
    await sarcophagus.reportBeneficiaryIncapacity(userAddress, beneficiaryIndex, true);
  }
};
```

## 🚀 **Performance Testing**

### **Load Testing**
```javascript
describe('Performance Tests', () => {
  it('should handle multiple beneficiaries efficiently', async () => {
    const beneficiaries = generateBeneficiaryData(5);
    
    const startTime = Date.now();
    await setupSarcophagus(sarcophagus, owner.address, beneficiaries);
    const endTime = Date.now();
    
    expect(endTime - startTime).to.be.lessThan(5000); // 5 seconds
  });

  it('should handle concurrent status updates', async () => {
    // Setup sarcophagus with multiple beneficiaries
    const beneficiaries = generateBeneficiaryData(3);
    await setupSarcophagus(sarcophagus, owner.address, beneficiaries);

    // Simulate concurrent status updates
    const promises = beneficiaries.map((_, index) =>
      sarcophagus.reportBeneficiaryIncapacity(owner.address, index, true)
    );

    await Promise.all(promises);

    // Verify all updates completed
    for (let i = 0; i < beneficiaries.length; i++) {
      const beneficiary = await sarcophagus.getBeneficiaryEnhanced(owner.address, i);
      expect(beneficiary.isIncapacitated).to.be.true;
    }
  });
});
```

## 📈 **Coverage Reporting**

### **Coverage Configuration**
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'contracts/**/*.sol',
    'frontend/app/components/**/*.{ts,tsx}',
    'frontend/app/hooks/**/*.{ts,tsx}',
    'frontend/app/utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
};
```

### **Coverage Goals**
- **Smart Contracts:** 95%+ coverage
- **Frontend Components:** 90%+ coverage
- **Utility Functions:** 95%+ coverage
- **Integration Tests:** All major workflows covered

---

*This testing guide provides comprehensive coverage for all enhanced beneficiary features. For specific test implementations, refer to the individual test files in the project.* 