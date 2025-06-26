// Test file for WHO API integration
// This can be run to verify the API integration works

import { whoApiService } from './whoApi';
import { getEnvironmentConfig } from '../config/environment';

export async function testWHOApiIntegration() {
  console.log('=== WHO API Integration Test ===');
  
  // Check environment configuration
  const envConfig = getEnvironmentConfig();
  console.log('Environment Config:', envConfig);
  
  // Test API health
  console.log('\n1. Testing API Health...');
  const health = await whoApiService.checkApiHealth();
  console.log('API Health:', health);
  
  // Test fetching data for a few countries
  const testCountries = ['United States', 'Japan', 'Germany'];
  
  for (const country of testCountries) {
    console.log(`\n2. Testing data fetch for ${country}...`);
    try {
      const data = await whoApiService.fetchLifeExpectancyData(country);
      if (data) {
        console.log(`✅ Success: ${country} - Male: ${data.male}, Female: ${data.female}, Source: ${data.source}`);
      } else {
        console.log(`❌ No data returned for ${country}`);
      }
    } catch (error) {
      console.log(`❌ Error fetching data for ${country}:`, error);
    }
  }
  
  // Test available countries
  console.log('\n3. Testing available countries...');
  const countries = whoApiService.getAvailableCountries();
  console.log(`Available countries: ${countries.length}`);
  console.log('Sample countries:', countries.slice(0, 5));
  
  // Test environment info
  console.log('\n4. Testing environment info...');
  const envInfo = whoApiService.getEnvironmentInfo();
  console.log('Environment Info:', envInfo);
  
  console.log('\n=== Test Complete ===');
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - expose test function
  (window as any).testWHOApi = testWHOApiIntegration;
  console.log('WHO API test function available as window.testWHOApi()');
} 