// Test file for API integration demonstration
// Shows how Death Verification and Environmental APIs work together

import { deathVerificationApiService } from './deathVerificationApi';
import { environmentalApiService } from './environmentalApi';
import { tokenPriceApiService } from './tokenPriceApi';
import { whoApiService } from './whoApi';

export async function testAllApiIntegrations() {
  console.log('=== Testing All API Integrations ===');

  // Test Death Verification API
  console.log('\n1. Testing Death Verification API...');
  try {
    const deathResult = await deathVerificationApiService.verifyDeath(
      'John Doe',
      '1950-03-15',
      'US'
    );
    console.log('Death Verification Result:', deathResult);
  } catch (error) {
    console.error('Death verification error:', error);
  }

  // Test Environmental API
  console.log('\n2. Testing Environmental API...');
  try {
    const carbonData = await environmentalApiService.getCarbonFootprint('lifestyle', 'New York');
    console.log('Carbon Footprint Data:', carbonData);

    const climateData = await environmentalApiService.getRegionalClimateData('New York');
    console.log('Climate Data:', climateData);
  } catch (error) {
    console.error('Environmental API error:', error);
  }

  // Test Token Price API
  console.log('\n3. Testing Token Price API...');
  try {
    const tokenPrices = await tokenPriceApiService.fetchAllTokenPrices();
    console.log('Token Prices:', tokenPrices);
  } catch (error) {
    console.error('Token price API error:', error);
  }

  // Test WHO API
  console.log('\n4. Testing WHO API...');
  try {
    const whoData = await whoApiService.fetchLifeExpectancyData('United States');
    console.log('WHO Data:', whoData);
  } catch (error) {
    console.error('WHO API error:', error);
  }

  console.log('\n=== All API Tests Complete ===');
}

// Example of how these APIs work together in the protocol
export async function demonstrateProtocolIntegration() {
  console.log('=== Protocol Integration Demo ===');

  // Simulate a user scenario
  const user = {
    name: 'Alice Johnson',
    age: 65,
    country: 'United States',
    location: 'California',
    lifestyle: 'moderate'
  };

  // 1. Get life expectancy from WHO API
  const lifeExpectancy = await whoApiService.fetchLifeExpectancyData(user.country);
  console.log('Life Expectancy:', lifeExpectancy);

  // 2. Get carbon footprint for B3TR calculations
  const carbonFootprint = await environmentalApiService.getCarbonFootprint(user.lifestyle, user.location);
  console.log('Carbon Footprint:', carbonFootprint);

  // 3. Get token prices for inheritance valuation
  const tokenPrices = await tokenPriceApiService.fetchAllTokenPrices();
  console.log('Token Prices for Valuation:', tokenPrices);

  // 4. Simulate death verification (would be triggered by oracle)
  const deathVerification = await deathVerificationApiService.verifyDeath(
    user.name,
    '1958-01-01',
    user.country
  );
  console.log('Death Verification:', deathVerification);

  // 5. Calculate B3TR rewards based on all data
  if (deathVerification.isVerified && lifeExpectancy?.male && carbonFootprint) {
    const currentYear = new Date().getFullYear();
    const birthYear = 1958;
    const yearsLived = currentYear - birthYear;
    const yearsEarly = lifeExpectancy.male - yearsLived;
    const carbonOffset = yearsEarly * carbonFootprint.carbonOutput;
    console.log('B3TR Carbon Offset Reward:', carbonOffset, 'tons CO2');
  }

  console.log('\n=== Integration Demo Complete ===');
}
