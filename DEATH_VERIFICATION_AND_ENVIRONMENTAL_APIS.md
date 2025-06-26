# Death Verification & Environmental APIs Implementation

## Overview

This document outlines the implementation of two critical APIs for the Sarcophagus Protocol:

1. **Death Verification API** - Multi-source death verification for inheritance claims
2. **Environmental/Carbon Data API** - Enhanced carbon footprint calculations for B3TR rewards

## 🔗 **Death Verification API**

### Purpose
Reliable death verification is critical for inheritance claims. This API integrates multiple sources to ensure accurate verification with confidence scoring.

### Features
- **Multi-source verification**: SSDI, Government registries, News/Obituaries
- **Confidence scoring**: High/Medium/Low based on source reliability
- **Caching system**: 24-hour cache to reduce API calls
- **Fallback mechanisms**: Mock data for development/testnet
- **International support**: Multiple country registries

### Implementation

#### File: `frontend/app/utils/deathVerificationApi.ts`

```typescript
// Main verification function
async verifyDeath(
  fullName: string,
  dateOfBirth: string,
  country: string,
  additionalData?: {
    ssn?: string;
    location?: string;
    dateOfDeath?: string;
  }
): Promise<DeathVerificationResult>
```

#### Usage Example

```typescript
import { deathVerificationApiService } from './utils/deathVerificationApi';

// Verify death for inheritance claim
const result = await deathVerificationApiService.verifyDeath(
  'John Doe',
  '1950-03-15',
  'US',
  { 
    ssn: '123-45-6789',
    location: 'New York, NY'
  }
);

if (result.isVerified && result.confidence === 'high') {
  // Proceed with inheritance claim
  console.log('Death verified:', result.data);
} else {
  console.log('Verification failed or low confidence');
}
```

### Data Sources

#### 1. Social Security Death Index (SSDI) - US Only
- **Endpoint**: Various providers (Ancestry, FamilySearch)
- **Cost**: $0.10-0.50 per lookup
- **Confidence**: High
- **Use case**: Primary verification for US users

#### 2. Government Death Registries
- **Countries**: US, UK, Canada, Australia
- **Confidence**: High
- **Use case**: Official death certificates

#### 3. News/Obituary APIs
- **Providers**: NewsAPI, GDELT Project
- **Confidence**: Medium
- **Use case**: Supplementary verification

### Confidence Scoring

| Source | Confidence | Use Case |
|--------|------------|----------|
| SSDI + Government Registry | High | Primary verification |
| Government Registry Only | High | International users |
| News + Obituary | Medium | Supplementary |
| Single News Source | Low | Last resort |

## 🌱 **Environmental/Carbon Data API**

### Purpose
Enhanced carbon footprint calculations for accurate B3TR carbon offset rewards. Provides regional climate data for environmental impact assessments.

### Features
- **Carbon Interface API**: Activity-based carbon calculations
- **OpenWeatherMap API**: Regional climate and air quality data
- **Regional adjustments**: Location-specific carbon intensity
- **Real-time data**: Current environmental conditions
- **Fallback data**: Static calculations for development

### Implementation

#### File: `frontend/app/utils/environmentalApi.ts`

```typescript
// Carbon footprint calculation
async getCarbonFootprint(activity: string, region: string): Promise<CarbonFootprintData>

// Regional climate data
async getRegionalClimateData(location: string): Promise<ClimateData>
```

#### Usage Example

```typescript
import { environmentalApiService } from './utils/environmentalApi';

// Get personalized carbon footprint
const carbonData = await environmentalApiService.getCarbonFootprint(
  'lifestyle', // Activity type
  'California' // Region
);

// Get regional climate data
const climateData = await environmentalApiService.getRegionalClimateData('New York');

console.log('Carbon footprint:', carbonData.carbonOutput, carbonData.unit);
console.log('Air quality index:', climateData.airQuality);
```

### Data Sources

#### 1. Carbon Interface API
- **Endpoint**: `https://www.carboninterface.com/api/v1`
- **Free tier**: 100 requests/month
- **Features**: Activity-based carbon calculations
- **Use case**: Accurate carbon offset rewards

#### 2. OpenWeatherMap API
- **Endpoint**: `https://api.openweathermap.org/data/2.5`
- **Free tier**: 1,000 calls/day
- **Features**: Climate data, air quality, regional factors
- **Use case**: Regional environmental adjustments

### Carbon Calculation Enhancement

The environmental API enhances your existing carbon footprint calculations:

```typescript
// Before: Static calculation
const carbonFootprint = calculateCarbonFootprint(factors);

// After: Real-time environmental data
const carbonData = await environmentalApiService.getCarbonFootprint(
  factors.lifestyle, 
  factors.location
);
const climateData = await environmentalApiService.getRegionalClimateData(factors.location);

// Enhanced calculation with real-time data
const enhancedFootprint = carbonData.carbonOutput * climateData.carbonIntensity;
```

## 🔄 **Integration with Existing Protocol**

### Enhanced B3TR Rewards

```typescript
// In your B3TR rewards calculation
async function calculateB3TRRewards(user: User, deathData: DeathVerificationData) {
  // 1. Get life expectancy from WHO API
  const lifeExpectancy = await whoApiService.fetchLifeExpectancyData(user.country);
  
  // 2. Get enhanced carbon footprint
  const carbonData = await environmentalApiService.getCarbonFootprint(
    user.lifestyle, 
    user.location
  );
  
  // 3. Calculate years early
  const yearsEarly = lifeExpectancy.male - deathData.age;
  
  // 4. Enhanced carbon offset calculation
  const carbonOffset = yearsEarly * carbonData.carbonOutput;
  
  return carbonOffset;
}
```

### Death Verification in Inheritance Claims

```typescript
// In your inheritance claim process
async function processInheritanceClaim(beneficiary: string, deceased: string) {
  // 1. Verify death through multiple sources
  const deathVerification = await deathVerificationApiService.verifyDeath(
    deceased.name,
    deceased.dateOfBirth,
    deceased.country
  );
  
  // 2. Only proceed if verification is high confidence
  if (deathVerification.isVerified && deathVerification.confidence === 'high') {
    // 3. Calculate enhanced B3TR rewards
    const rewards = await calculateB3TRRewards(deceased, deathVerification.data);
    
    // 4. Process inheritance
    await processInheritance(beneficiary, deceased, rewards);
  } else {
    throw new Error('Death verification failed or insufficient confidence');
  }
}
```

## 🛠️ **Configuration**

### Environment Variables

Add these to your environment configuration:

```typescript
// frontend/app/config/environment.ts
export interface EnvironmentConfig {
  // Existing config...
  deathVerificationEnabled: boolean;
  environmentalApiEnabled: boolean;
  
  // API endpoints
  carbonApiUrl: string;
  carbonApiKey: string;
  weatherApiUrl: string;
  weatherApiKey: string;
  
  // Death verification providers
  ssdiApiUrl: string;
  ssdiApiKey: string;
  newsApiUrl: string;
  newsApiKey: string;
}
```

### Environment-Specific Settings

```typescript
// Development
const developmentConfig = {
  deathVerificationEnabled: false, // Use mock data
  environmentalApiEnabled: false,  // Use static calculations
  // ... other settings
};

// Testnet
const testnetConfig = {
  deathVerificationEnabled: false, // Use mock data
  environmentalApiEnabled: true,   // Test real environmental APIs
  // ... other settings
};

// Production
const productionConfig = {
  deathVerificationEnabled: true,  // Use real APIs
  environmentalApiEnabled: true,   // Use real APIs
  // ... other settings
};
```

## 🧪 **Testing**

### Test File: `frontend/app/utils/test-api-integration.ts`

```typescript
import { testAllApiIntegrations, demonstrateProtocolIntegration } from './test-api-integration';

// Test all APIs
await testAllApiIntegrations();

// Demonstrate protocol integration
await demonstrateProtocolIntegration();
```

### Running Tests

```bash
# From frontend directory
npm run test:api-integration

# Or run specific test
node -e "import('./app/utils/test-api-integration.ts').then(m => m.testAllApiIntegrations())"
```

## 💰 **Cost Analysis**

### Death Verification APIs
- **SSDI**: $0.10-0.50 per lookup
- **Government Registries**: $0.05-0.20 per lookup
- **News APIs**: $0.01-0.05 per lookup
- **Estimated monthly cost**: $50-200 for 1,000 verifications

### Environmental APIs
- **Carbon Interface**: Free tier (100 requests/month)
- **OpenWeatherMap**: Free tier (1,000 calls/day)
- **Estimated monthly cost**: $0-50 for enhanced features

### Total Estimated Cost
- **Development/Testnet**: $0 (mock data)
- **Production (1,000 users)**: $50-250/month

## 🚀 **Deployment Checklist**

### Phase 1: Development Setup
- [x] Create API service files
- [x] Implement mock data for development
- [x] Add environment configuration
- [x] Create test files

### Phase 2: Testnet Integration
- [ ] Integrate environmental APIs (real data)
- [ ] Test death verification with mock data
- [ ] Validate carbon calculations
- [ ] Performance testing

### Phase 3: Production Deployment
- [ ] Integrate real death verification APIs
- [ ] Set up API key management
- [ ] Implement monitoring and alerts
- [ ] Cost optimization

## 🔒 **Security Considerations**

### API Key Management
- Store keys in environment variables
- Use encryption for sensitive keys
- Implement key rotation
- Monitor for key exposure

### Data Privacy
- Minimize data collection
- Implement data anonymization
- Follow GDPR/CCPA compliance
- Secure data transmission

### Rate Limiting
- Implement client-side rate limiting
- Respect API provider limits
- Use exponential backoff for retries

## 📊 **Monitoring & Analytics**

### Metrics to Track
- API response times
- Success/failure rates
- Cost per verification
- Cache hit rates
- Confidence score distribution

### Health Checks
```typescript
// Check API health
const deathHealth = await deathVerificationApiService.checkApiHealth();
const environmentalHealth = await environmentalApiService.checkApiHealth();

console.log('Death Verification Health:', deathHealth);
console.log('Environmental API Health:', environmentalHealth);
```

## 🎯 **Next Steps**

1. **Immediate**: Test the APIs in development environment
2. **Short-term**: Integrate environmental APIs for testnet
3. **Medium-term**: Implement real death verification for mainnet
4. **Long-term**: Add more data sources and AI-powered verification

## 📚 **Resources**

- [Carbon Interface Documentation](https://docs.carboninterface.com/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [SSDI Data Sources](https://www.ssa.gov/foia/request.html)
- [Government Registry APIs](https://www.gov.uk/apis)

---

**Note**: These APIs are designed to work seamlessly with your existing protocol while providing enhanced functionality for mainnet deployment. 