const Web3 = require('web3');
require('dotenv').config();

async function checkTransactions() {
  console.log('🔍 Checking deployment transactions...');
  
  // Try different RPC endpoints
  const rpcUrls = [
    'https://testnet.vechain.org',
    'https://testnet.vechain.org/by/',
    'https://testnet.vechain.org/by/1'
  ];
  
  for (const rpcUrl of rpcUrls) {
    console.log(`\n🌐 Trying RPC: ${rpcUrl}`);
    
    try {
      const web3 = new Web3(rpcUrl);
      
      // Check if we can connect
      const blockNumber = await web3.eth.getBlockNumber();
      console.log(`✅ Connected! Latest block: ${blockNumber}`);
      
      // Check deployer balance
      const deployerAddress = '0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6';
      const balance = await web3.eth.getBalance(deployerAddress);
      console.log(`💰 Deployer balance: ${web3.utils.fromWei(balance, 'ether')} VET`);
      
      // Check one contract address
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
      const code = await web3.eth.getCode(contractAddress);
      console.log(`📋 Contract code length: ${code.length}`);
      
      if (code && code !== '0x') {
        console.log(`✅ Contract found at ${contractAddress}`);
      } else {
        console.log(`❌ No contract at ${contractAddress}`);
      }
      
      break; // If we get here, this RPC works
      
    } catch (error) {
      console.log(`❌ Failed with ${rpcUrl}: ${error.message}`);
    }
  }
}

checkTransactions().catch(console.error); 