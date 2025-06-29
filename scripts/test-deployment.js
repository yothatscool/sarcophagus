const Web3 = require('web3');
require('dotenv').config();

async function testDeployment() {
  console.log('🔍 Testing deployment on VeChain Testnet...');
  
  // Use the same RPC URL as deployment
  const web3 = new Web3('https://testnet.vechain.org');
  
  // Use the stable address from deployment
  const deployerAddress = '0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6';
  
  console.log(`📋 Testing with deployer: ${deployerAddress}`);
  
  // Contract addresses from deployment
  const contracts = {
    DeathVerifier: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    OBOLToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    MultiSigWallet: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    Sarcophagus: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    B3TRRewards: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
  };
  
  for (const [name, address] of Object.entries(contracts)) {
    try {
      console.log(`\n🔍 Checking ${name} at ${address}...`);
      
      // Get contract code
      const code = await web3.eth.getCode(address);
      
      if (code && code !== '0x') {
        console.log(`✅ ${name}: Contract deployed successfully`);
        console.log(`   Code length: ${code.length} characters`);
      } else {
        console.log(`❌ ${name}: No contract found at this address`);
      }
      
      // Get balance
      const balance = await web3.eth.getBalance(address);
      console.log(`   Balance: ${web3.utils.fromWei(balance, 'ether')} VET`);
      
    } catch (error) {
      console.log(`❌ ${name}: Error checking contract - ${error.message}`);
    }
  }
  
  // Check deployer balance
  try {
    const deployerBalance = await web3.eth.getBalance(deployerAddress);
    console.log(`\n💰 Deployer balance: ${web3.utils.fromWei(deployerBalance, 'ether')} VET`);
  } catch (error) {
    console.log(`❌ Error checking deployer balance: ${error.message}`);
  }
}

testDeployment().catch(console.error); 