# Life Expectancy Automation & Onboarding Flow

## Overview

The Vereavement Protocol now includes a comprehensive life expectancy calculation system and user-friendly onboarding flow that guides users through the process of creating their digital inheritance vault.

## Life Expectancy Automation System

### Features

1. **WHO Data Integration**: Uses real World Health Organization (WHO) 2023 data for base life expectancy by country and gender
2. **Lifestyle Adjustments**: Factors in smoking status, exercise level, BMI, education, and income
3. **Age-Specific Calculations**: Adjusts impact based on current age (younger people get more impact from lifestyle factors)
4. **Confidence Scoring**: Provides confidence levels (high/medium/low) based on data completeness
5. **Real-time Calculation**: Instant results with detailed breakdown of factors

### Supported Countries

The system includes life expectancy data for 24 countries:

- **High Life Expectancy**: Japan (87.7♀/81.6♂), Switzerland (85.1♀/81.0♂), Singapore (85.2♀/80.7♂)
- **Medium Life Expectancy**: United States (81.1♀/76.1♂), China (79.4♀/75.0♂), Brazil (79.6♀/72.8♂)
- **Lower Life Expectancy**: India (70.2♀/67.5♂), Russia (77.2♀/66.5♂), Nigeria (55.7♀/54.7♂)

### Adjustment Factors

| Factor | Impact Range | Description |
|--------|-------------|-------------|
| Smoking | -8 to 0 years | Current smokers: -8, Former: -2, Never: 0 |
| Exercise | -3 to +2 years | Sedentary: -3, Moderate: 0, Active: +2 |
| BMI | -3 to 0 years | Obese: -3, Overweight: -1, Normal: 0, Underweight: -2 |
| Education | -2 to +1 years | Low: -2, Medium: 0, High: +1 |
| Income | -3 to +1 years | Low: -3, Medium: 0, High: +1 |

### Technical Implementation

```typescript
// Calculate life expectancy with all factors
const result = calculateLifeExpectancy({
  country: 'United States',
  age: 35,
  gender: 'male',
  smokingStatus: 'never',
  exerciseLevel: 'moderate',
  bmi: 24.5,
  education: 'high',
  income: 'medium'
});

// Result includes:
// - baseLifeExpectancy: 76.1 (US male average)
// - adjustedLifeExpectancy: 77.1 (with adjustments)
// - factors: breakdown of each adjustment
// - confidence: 'high' (based on data completeness)
```

## Onboarding Flow

### Step-by-Step Process

#### 1. Welcome Screen
- **Purpose**: Introduce the protocol and build trust
- **Content**: 
  - Protocol overview with key benefits
  - Security, automation, and global accessibility highlights
  - Clear value proposition

#### 2. Basic Information
- **Required Fields**: Age, Gender, Country
- **Validation**: Age 18-120, valid country selection
- **Purpose**: Establish baseline for life expectancy calculation

#### 3. Life Expectancy Calculator
- **Optional Fields**: Smoking, Exercise, Height/Weight, Education, Income
- **Features**:
  - Real-time calculation with visual feedback
  - Confidence indicator
  - Factor breakdown display
  - BMI auto-calculation from height/weight

#### 4. Beneficiary Management
- **Features**:
  - Add multiple beneficiaries
  - Percentage allocation (must total 100%)
  - Address validation
  - Dynamic add/remove functionality
- **Validation**: Total percentage must equal 100%

#### 5. Identity Verification
- **Purpose**: Prevent fraud and ensure protocol integrity
- **Methods**: Government ID, Passport, Driver's License, Utility Bill
- **Security**: Hash-based verification with IPFS support

#### 6. Review & Complete
- **Content**: Summary of all entered information
- **Features**:
  - Final review before vault creation
  - Edit capability for each section
  - Clear next steps

### User Experience Features

#### Progress Tracking
- Visual progress bar showing completion percentage
- Step indicators with current position
- Ability to navigate back to previous steps

#### Validation & Error Handling
- Real-time field validation
- Clear error messages
- Required field indicators
- Data completeness checks

#### Responsive Design
- Mobile-optimized interface
- Touch-friendly controls
- Adaptive layout for different screen sizes

#### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Clear focus indicators

## Integration with Smart Contracts

### Life Expectancy in Contract Logic

The calculated life expectancy is used in several contract functions:

1. **Bonus Calculations**: B3TR bonuses for dying earlier/later than expected
2. **Risk Assessment**: Helps determine appropriate fees and requirements
3. **Audit Trail**: Stored on-chain for transparency and verification

### Onboarding Data Flow

```typescript
// Onboarding completion triggers contract interaction
const handleOnboardingComplete = async (data) => {
  // 1. Create sarcophagus with life expectancy data
  await createSarcophagus(
    data.beneficiaries.map(b => b.address),
    data.beneficiaries.map(b => b.percentage),
    data.lifeExpectancy.adjustedLifeExpectancy
  );
  
  // 2. Store verification hash
  await storeVerification(data.verificationHash);
  
  // 3. Update UI with new vault
  refreshUserData();
};
```

## Security Considerations

### Data Privacy
- Personal information is not stored on-chain
- Only verification hashes and life expectancy numbers are recorded
- User consent required for all data collection

### Verification Integrity
- Multi-factor verification process
- Hash-based document verification
- Oracle-based death verification system

### Fraud Prevention
- Identity verification requirement
- Age validation
- Beneficiary address verification
- Time-locked contracts

## Future Enhancements

### Planned Features
1. **Machine Learning Integration**: More sophisticated life expectancy models
2. **Health Data Integration**: Wearable device data for real-time adjustments
3. **Family History**: Genetic and family medical history factors
4. **Environmental Factors**: Air quality, climate, and location-based adjustments
5. **Dynamic Updates**: Periodic recalculation based on lifestyle changes

### API Extensions
1. **Third-party Data**: Integration with health and financial data providers
2. **Insurance Integration**: Partnership with life insurance companies
3. **Medical Records**: Secure medical data verification
4. **Social Verification**: Community-based verification systems

## Testing & Validation

### Life Expectancy Accuracy
- Validated against actuarial tables
- Cross-referenced with multiple data sources
- Regular updates with new WHO data

### User Experience Testing
- A/B testing of onboarding flows
- Usability studies with diverse user groups
- Accessibility compliance testing
- Performance optimization

### Security Audits
- Smart contract security reviews
- Data privacy compliance checks
- Penetration testing
- Regular security updates

## Conclusion

The life expectancy automation and comprehensive onboarding flow significantly improve the user experience of the Vereavement Protocol. By providing accurate, personalized life expectancy calculations and guiding users through a clear, step-by-step process, the protocol becomes more accessible and trustworthy for users worldwide.

The system balances automation with human oversight, ensuring both efficiency and accuracy in digital inheritance management. 