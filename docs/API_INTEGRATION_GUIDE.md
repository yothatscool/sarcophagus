# API Integration Guide

## Overview

This guide covers all API integrations available in the Sarcophagus Protocol, including the new enhanced beneficiary features, health management, and external data sources.

## 🔗 **Core Contract APIs**

### **Enhanced Beneficiary Management**

#### **Create Sarcophagus with Enhanced Features**
```javascript
// Create vault with guardian information
const tx = await sarcophagusContract.createSarcophagusWithGuardians(
  beneficiaries,    // address[]
  percentages,      // uint256[] (basis points)
  guardians,        // address[]
  ages             // uint256[]
);

// Update beneficiary with enhanced information
const tx = await sarcophagusContract.updateBeneficiaryEnhanced(
  beneficiaryIndex,           // uint256
  contingentBeneficiary,      // address
  survivorshipPeriod,         // uint256 (days)
  successorGuardian,          // address
  contactInfo                 // string (IPFS hash)
);

// Designate charity fallback
const tx = await sarcophagusContract.designateCharity(charityAddress);
```

#### **Beneficiary Health Management**
```javascript
// Report beneficiary death (verifier only)
const tx = await sarcophagusContract.reportBeneficiaryDeath(
  userAddress,      // address
  beneficiaryIndex, // uint256
  deathTimestamp    // uint256
);

// Report beneficiary incapacity (verifier only)
const tx = await sarcophagusContract.reportBeneficiaryIncapacity(
  userAddress,      // address
  beneficiaryIndex, // uint256
  isIncapacitated   // bool
);

// Check survivorship requirements
const [meetsRequirements, reason] = await sarcophagusContract.checkSurvivorshipRequirements(
  userAddress,      // address
  beneficiaryIndex  // uint256
);

// Get valid beneficiaries
const [validBeneficiaries, totalPercentage] = await sarcophagusContract.getValidBeneficiaries(userAddress);

// Enhanced inheritance claiming
const tx = await sarcophagusContract.claimInheritanceEnhanced(
  userAddress,      // address
  beneficiaryIndex  // uint256
);

// Handle estate fallback
const tx = await sarcophagusContract.handleEstateFallback(userAddress);
```

### **Query Functions**
```javascript
// Get enhanced beneficiary information
const beneficiary = await sarcophagusContract.getBeneficiaryEnhanced(
  userAddress,      // address
  beneficiaryIndex  // uint256
);

// Get sarcophagus data
const sarcophagus = await sarcophagusContract.sarcophagi(userAddress);

// Check beneficiary status
const isDeceased = await sarcophagusContract.beneficiaryDeaths(beneficiaryAddress);
const isIncapacitated = await sarcophagusContract.beneficiaryIncapacitated(beneficiaryAddress);

// Get charity designation
const charity = await sarcophagusContract.charityDesignations(userAddress);
```

## 🌐 **External API Integrations**

### **1. WHO Life Expectancy API**

#### **Service Configuration**
```typescript
// frontend/app/utils/whoApi.ts
export class WhoApiService {
  private baseUrl = 'https://ghoapi.azureedge.net/api';
  private apiKey = process.env.WHO_API_KEY;
  
  async fetchLifeExpectancyData(country: string): Promise<LifeExpectancyData> {
    // Implementation with fallback to static data
  }
  
  async checkApiHealth(): Promise<ApiHealth> {
    // Health check with timeout
  }
}
```

#### **Usage Examples**
```javascript
// Fetch life expectancy data
const lifeExpectancy = await whoApiService.fetchLifeExpectancyData('United States');

// Health check
const health = await whoApiService.checkApiHealth();
console.log('WHO API Health:', health.available);
```

#### **Data Structure**
```typescript
interface LifeExpectancyData {
  country: string;
  maleLifeExpectancy: number;
  femaleLifeExpectancy: number;
  overallLifeExpectancy: number;
  lastUpdated: string;
  source: 'WHO_API' | 'STATIC_DATA';
}
```

### **2. Token Price APIs (CoinGecko)**

#### **Service Configuration**
```typescript
// frontend/app/utils/tokenPriceApi.ts
export class TokenPriceApiService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  
  async fetchAllTokenPrices(): Promise<TokenPrices> {
    // Fetch VET, VTHO, B3TR prices
  }
  
  async checkApiHealth(): Promise<ApiHealth> {
    // Health check with rate limiting
  }
}
```

#### **Usage Examples**
```javascript
// Fetch all token prices
const prices = await tokenPriceApiService.fetchAllTokenPrices();
console.log('VET Price:', prices.vet.usd);
console.log('VTHO Price:', prices.vtho.usd);
console.log('B3TR Price:', prices.b3tr.usd);

// Health check
const health = await tokenPriceApiService.checkApiHealth();
```

#### **Data Structure**
```typescript
interface TokenPrices {
  vet: { usd: number; usd_24h_change: number };
  vtho: { usd: number; usd_24h_change: number };
  b3tr: { usd: number; usd_24h_change: number };
  lastUpdated: string;
}
```

### **3. Environmental/Carbon APIs**

#### **Service Configuration**
```typescript
// frontend/app/utils/environmentalApi.ts
export class EnvironmentalApiService {
  private baseUrl = 'https://api.carboninterface.com/v1';
  private apiKey = process.env.CARBON_API_KEY;
  
  async getCarbonFootprint(lifestyle: string, country: string): Promise<CarbonData> {
    // Calculate carbon footprint based on lifestyle
  }
  
  async checkApiHealth(): Promise<ApiHealth> {
    // Health check with authentication
  }
}
```

#### **Usage Examples**
```javascript
// Get carbon footprint
const carbonData = await environmentalApiService.getCarbonFootprint('moderate', 'United States');
console.log('Annual Carbon Footprint:', carbonData.annualFootprint);
console.log('Offset Cost:', carbonData.offsetCost);

// Health check
const health = await environmentalApiService.checkApiHealth();
```

#### **Data Structure**
```typescript
interface CarbonData {
  lifestyle: string;
  country: string;
  annualFootprint: number; // tons CO2
  offsetCost: number; // USD
  recommendations: string[];
  lastUpdated: string;
}
```

### **4. Death Verification APIs**

#### **Service Configuration**
```typescript
// frontend/app/utils/deathVerificationApi.ts
export class DeathVerificationApiService {
  private baseUrl = 'https://api.deathverification.com/v1';
  private apiKey = process.env.DEATH_VERIFICATION_API_KEY;
  
  async verifyDeath(personData: PersonData): Promise<VerificationResult> {
    // Multi-source death verification
  }
  
  async checkApiHealth(): Promise<ApiHealth> {
    // Health check with authentication
  }
}
```

#### **Usage Examples**
```javascript
// Verify death
const result = await deathVerificationApiService.verifyDeath({
  name: 'John Doe',
  dateOfBirth: '1980-01-01',
  lastKnownAddress: '123 Main St',
  socialSecurityNumber: '123-45-6789'
});

console.log('Verification Status:', result.status);
console.log('Confidence Score:', result.confidence);
console.log('Sources:', result.sources);

// Health check
const health = await deathVerificationApiService.checkApiHealth();
```

#### **Data Structure**
```typescript
interface VerificationResult {
  status: 'VERIFIED' | 'NOT_FOUND' | 'INCONCLUSIVE';
  confidence: number; // 0-100
  sources: string[];
  dateOfDeath?: string;
  lastUpdated: string;
}
```

## 🎯 **Frontend Integration APIs**

### **1. BeneficiaryModal Component**

#### **Props Interface**
```typescript
interface BeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (beneficiaries: Beneficiary[], charityAddress?: string) => void;
}

interface Beneficiary {
  address: string;
  percentage: number;
  age: number;
  guardian?: string;
  contingentBeneficiary?: string;
  survivorshipPeriod?: number;
  successorGuardian?: string;
  contactInfo?: string;
}
```

#### **Usage Example**
```javascript
import BeneficiaryModal from './components/BeneficiaryModal';

function VaultCreation() {
  const [showModal, setShowModal] = useState(false);
  
  const handleComplete = async (beneficiaries, charityAddress) => {
    // Create vault with enhanced beneficiaries
    const addresses = beneficiaries.map(b => b.address);
    const percentages = beneficiaries.map(b => b.percentage * 100);
    const guardians = beneficiaries.map(b => b.guardian || '0x0000...');
    const ages = beneficiaries.map(b => b.age);
    
    await sarcophagusContract.createSarcophagusWithGuardians(
      addresses, percentages, guardians, ages
    );
    
    // Update with enhanced features
    for (let i = 0; i < beneficiaries.length; i++) {
      const beneficiary = beneficiaries[i];
      if (beneficiary.contingentBeneficiary || beneficiary.survivorshipPeriod) {
        await sarcophagusContract.updateBeneficiaryEnhanced(
          i,
          beneficiary.contingentBeneficiary || '0x0000...',
          beneficiary.survivorshipPeriod || 0,
          beneficiary.successorGuardian || '0x0000...',
          beneficiary.contactInfo || ''
        );
      }
    }
    
    // Designate charity if provided
    if (charityAddress) {
      await sarcophagusContract.designateCharity(charityAddress);
    }
  };
  
  return (
    <BeneficiaryModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onComplete={handleComplete}
    />
  );
}
```

### **2. BeneficiaryHealthManager Component**

#### **Props Interface**
```typescript
interface BeneficiaryHealthManagerProps {
  userAddress: string;
  isOpen: boolean;
  onClose: () => void;
}

interface BeneficiaryHealth {
  address: string;
  isDeceased: boolean;
  isIncapacitated: boolean;
  deathTimestamp?: number;
  survivorshipPeriod: number;
  meetsSurvivorship: boolean;
  reason?: string;
}
```

#### **Usage Example**
```javascript
import BeneficiaryHealthManager from './components/BeneficiaryHealthManager';

function Dashboard() {
  const [showHealthManager, setShowHealthManager] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowHealthManager(true)}>
        Manage Beneficiary Health
      </button>
      
      <BeneficiaryHealthManager
        userAddress={userAddress}
        isOpen={showHealthManager}
        onClose={() => setShowHealthManager(false)}
      />
    </div>
  );
}
```

## 🔧 **API Configuration**

### **Environment Variables**
```bash
# API Keys
WHO_API_KEY=your_who_api_key
CARBON_API_KEY=your_carbon_api_key
DEATH_VERIFICATION_API_KEY=your_death_verification_api_key

# API Configuration
WHO_API_ENABLED=true
CARBON_API_ENABLED=true
DEATH_VERIFICATION_API_ENABLED=true

# Rate Limiting
API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=60000

# Timeouts
API_TIMEOUT=5000
API_RETRY_ATTEMPTS=3
```

### **API Health Monitoring**
```typescript
interface ApiHealth {
  available: boolean;
  responseTime: number;
  lastChecked: string;
  error?: string;
}

interface ApiHealthStatus {
  who: ApiHealth;
  carbon: ApiHealth;
  deathVerification: ApiHealth;
  tokenPrices: ApiHealth;
}
```

### **Error Handling**
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public apiName: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage
try {
  const data = await apiService.fetchData();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`${error.apiName} API Error:`, error.message);
    // Fallback to static data
  }
}
```

## 📊 **Data Validation**

### **Input Validation**
```typescript
// Beneficiary validation
function validateBeneficiary(beneficiary: Beneficiary): ValidationResult {
  const errors: string[] = [];
  
  if (!beneficiary.address || beneficiary.address === '0x0000...') {
    errors.push('Invalid beneficiary address');
  }
  
  if (beneficiary.percentage < 0 || beneficiary.percentage > 100) {
    errors.push('Invalid percentage');
  }
  
  if (beneficiary.age < 0 || beneficiary.age > 120) {
    errors.push('Invalid age');
  }
  
  if (beneficiary.age < 18 && !beneficiary.guardian) {
    errors.push('Guardian required for minors');
  }
  
  if (beneficiary.survivorshipPeriod > 365) {
    errors.push('Survivorship period cannot exceed 365 days');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### **Output Validation**
```typescript
// API response validation
function validateApiResponse(data: any, schema: any): ValidationResult {
  // Schema validation using JSON Schema or similar
  const validation = validate(data, schema);
  
  return {
    isValid: validation.valid,
    errors: validation.errors
  };
}
```

## 🧪 **Testing APIs**

### **Unit Tests**
```javascript
describe('API Integration Tests', () => {
  it('should fetch life expectancy data', async () => {
    const data = await whoApiService.fetchLifeExpectancyData('United States');
    expect(data.country).toBe('United States');
    expect(data.overallLifeExpectancy).toBeGreaterThan(0);
  });
  
  it('should handle API errors gracefully', async () => {
    // Mock API failure
    jest.spyOn(whoApiService, 'fetchLifeExpectancyData').mockRejectedValue(new Error('API Error'));
    
    const data = await whoApiService.fetchLifeExpectancyData('United States');
    expect(data.source).toBe('STATIC_DATA');
  });
});
```

### **Integration Tests**
```javascript
describe('End-to-End API Tests', () => {
  it('should complete full beneficiary setup with APIs', async () => {
    // Test complete workflow with all API integrations
  });
  
  it('should handle API timeouts', async () => {
    // Test timeout handling
  });
  
  it('should validate all data sources', async () => {
    // Test data validation across all APIs
  });
});
```

## 📈 **Performance Optimization**

### **Caching Strategy**
```typescript
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes
  
  async get(key: string, fetcher: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

### **Rate Limiting**
```typescript
class RateLimiter {
  private requests = new Map<string, number[]>();
  private limit = 100;
  private window = 60000; // 1 minute
  
  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests
    const validRequests = requests.filter(time => now - time < this.window);
    
    if (validRequests.length >= this.limit) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}
```

## 🔒 **Security Considerations**

### **API Key Management**
- Store API keys in environment variables
- Rotate keys regularly
- Use least privilege access
- Monitor API usage

### **Data Privacy**
- Encrypt sensitive data
- Use HTTPS for all API calls
- Implement proper authentication
- Audit API access logs

### **Rate Limiting**
- Implement client-side rate limiting
- Respect API provider limits
- Handle rate limit errors gracefully
- Monitor usage patterns

---

*This API integration guide covers all available APIs for the Sarcophagus Protocol's enhanced beneficiary features. For specific implementation details, refer to the individual service files and contract documentation.* 