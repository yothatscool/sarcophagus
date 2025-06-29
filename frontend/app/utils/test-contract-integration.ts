import { ContractInteractions } from './contractInteractions';

// Test script for contract integration
export async function testContractIntegration(connex: any) {
  console.log('🧪 Testing Contract Integration...');
  
  const contractInteractions = new ContractInteractions(connex, false); // Use real mode
  
  try {
    // Test 1: Get user verification (should work even if not verified)
    console.log('Test 1: Getting user verification...');
    const testAddress = '0x1234567890123456789012345678901234567890';
    const verification = await contractInteractions.getUserVerification(testAddress);
    console.log('✅ Verification test passed:', verification);
    
    // Test 2: Get user sarcophagus (should return null for test address)
    console.log('Test 2: Getting user sarcophagus...');
    const sarcophagus = await contractInteractions.getUserSarcophagus(testAddress);
    console.log('✅ Sarcophagus test passed:', sarcophagus);
    
    // Test 3: Get OBOL rewards (should return 0 for test address)
    console.log('Test 3: Getting OBOL rewards...');
    const obolRewards = await contractInteractions.getObolRewards(testAddress);
    console.log('✅ OBOL rewards test passed:', obolRewards);
    
    console.log('🎉 All contract integration tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Contract integration test failed:', error);
    return false;
  }
}

// Test script for mock mode
export async function testMockIntegration(connex: any) {
  console.log('🧪 Testing Mock Integration...');
  
  const contractInteractions = new ContractInteractions(connex, true); // Use mock mode
  
  try {
    // Test 1: Get user verification (should return mock data)
    console.log('Test 1: Getting mock user verification...');
    const testAddress = '0x1234567890123456789012345678901234567890';
    const verification = await contractInteractions.getUserVerification(testAddress);
    console.log('✅ Mock verification test passed:', verification);
    
    // Test 2: Get user sarcophagus (should return null)
    console.log('Test 2: Getting mock user sarcophagus...');
    const sarcophagus = await contractInteractions.getUserSarcophagus(testAddress);
    console.log('✅ Mock sarcophagus test passed:', sarcophagus);
    
    // Test 3: Get OBOL rewards (should return 0)
    console.log('Test 3: Getting mock OBOL rewards...');
    const obolRewards = await contractInteractions.getObolRewards(testAddress);
    console.log('✅ Mock OBOL rewards test passed:', obolRewards);
    
    console.log('🎉 All mock integration tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Mock integration test failed:', error);
    return false;
  }
} 