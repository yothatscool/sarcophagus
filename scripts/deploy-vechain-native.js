// VeChain Native Deployment Script
// Uses only VeChain's native tools and protocols

const Thorify = require('thorify').thorify;
const Web3 = require('web3');
const fs = require('fs');
const Connex = require('@vechain/connex');
require('dotenv').config();

async function deployVeChainNative() {
  console.log('🚀 Deploying Sarcophagus Protocol using VeChain Native Tools...');
  
  // Initialize Connex for VeChain testnet
  const connex = new Connex({
    node: 'https://testnet.vechain.org',
    network: 'test'
  });
  
  // Check if we have a private key
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ Error: No PRIVATE_KEY found in .env file');
    console.log('Please add your private key to the .env file:');
    console.log('PRIVATE_KEY=your_private_key_here');
    process.exit(1);
  }
  
  const privateKey = process.env.PRIVATE_KEY;
  const account = connex.thor.account(privateKey);
  
  console.log('📋 Deploying with account:', account.address);
  
  // Get account balance
  const balance = await connex.thor.account(account.address).get();
  console.log('💰 Account balance:', balance.balance, 'VET');
  
  if (balance.balance === '0') {
    console.error('❌ Error: Account has no VET balance');
    console.log('Please fund your account with testnet VET from:');
    console.log('https://faucet.vechain.org/');
    process.exit(1);
  }
  
  // Contract addresses and parameters
  const B3TR_ADDRESS = '0x5ef79995FE8a89e0812330E4378eB2660ceDe699';
  const VTHO_ADDRESS = '0x0000000000000000000000000000456E65726779';
  const GLO_ADDRESS = '0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e';
  
  const ORACLE_ADDRESSES = [
    '0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6',
    '0xa19f660abf4fed45226787cd17ef723d94d1ce31',
    '0x8c8d7c46219d9205f056f28fee5950ad564d9f23',
    '0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc',
    '0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c'
  ];
  
  try {
    console.log('\n🔧 Deploying contracts using VeChain native Connex...');
    
    // Get contract bytecode from artifacts
    const artifactsPath = './artifacts/contracts/';
    const contracts = [
      { name: 'DeathVerifier', file: 'DeathVerifier.sol/DeathVerifier.json' },
      { name: 'OBOL', file: 'OBOL.sol/OBOL.json' },
      { name: 'MultiSigWallet', file: 'MultiSigWallet.sol/MultiSigWallet.json' },
      { name: 'Sarcophagus', file: 'Sarcophagus.sol/Sarcophagus.json' },
      { name: 'B3TRRewards', file: 'B3TRRewards.sol/B3TRRewards.json' }
    ];
    
    const deployedContracts = {};
    
    for (const contract of contracts) {
      try {
        console.log(`📋 Deploying ${contract.name}...`);
        
        // Read contract artifact
        const artifactPath = artifactsPath + contract.file;
        if (!fs.existsSync(artifactPath)) {
          console.log(`⚠️  Skipping ${contract.name} - artifact not found`);
          continue;
        }
        
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        const bytecode = artifact.bytecode;
        const abi = artifact.abi;
        
        // Create deployment transaction
        let deployClause;
        
        if (contract.name === 'DeathVerifier') {
          deployClause = connex.thor.transaction()
            .deploy(bytecode, abi, ORACLE_ADDRESSES);
        } else if (contract.name === 'OBOL') {
          deployClause = connex.thor.transaction()
            .deploy(bytecode, abi);
        } else if (contract.name === 'MultiSigWallet') {
          const signers = [account.address, '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'];
          const weights = [1, 1, 1];
          const threshold = 2;
          deployClause = connex.thor.transaction()
            .deploy(bytecode, abi, signers, weights, threshold);
        } else if (contract.name === 'Sarcophagus') {
          // We need OBOL address first
          if (!deployedContracts.OBOL) {
            console.log(`⚠️  Skipping ${contract.name} - OBOL not deployed yet`);
            continue;
          }
          deployClause = connex.thor.transaction()
            .deploy(bytecode, abi, VTHO_ADDRESS, B3TR_ADDRESS, deployedContracts.OBOL, GLO_ADDRESS, deployedContracts.DeathVerifier, deployedContracts.OBOL, deployedContracts.MultiSigWallet);
        } else if (contract.name === 'B3TRRewards') {
          // We need Sarcophagus address first
          if (!deployedContracts.Sarcophagus) {
            console.log(`⚠️  Skipping ${contract.name} - Sarcophagus not deployed yet`);
            continue;
          }
          deployClause = connex.thor.transaction()
            .deploy(bytecode, abi, B3TR_ADDRESS, deployedContracts.Sarcophagus, 80);
        }
        
        if (deployClause) {
          // Sign and send transaction
          const signedTx = deployClause.sign(privateKey);
          const result = await connex.thor.transaction(signedTx).getReceipt();
          
          if (result && result.reverted === false) {
            const contractAddress = result.outputs[0].contractAddress;
            deployedContracts[contract.name] = contractAddress;
            console.log(`✅ ${contract.name} deployed to: ${contractAddress}`);
          } else {
            console.log(`❌ ${contract.name} deployment failed`);
          }
        }
        
        // Wait between deployments
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.log(`❌ Error deploying ${contract.name}:`, error.message);
      }
    }
    
    // Save deployment info
    const deploymentInfo = {
      network: 'VeChain Testnet',
      deployer: account.address,
      deploymentTime: new Date().toISOString(),
      contracts: deployedContracts,
      tokenAddresses: {
        VTHO: VTHO_ADDRESS,
        B3TR: B3TR_ADDRESS,
        GLO: GLO_ADDRESS
      },
      oracleAddresses: ORACLE_ADDRESSES
    };
    
    fs.writeFileSync('vechain-native-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log('\n🎉 === VECHAIN NATIVE DEPLOYMENT COMPLETE ===');
    console.log('📄 Deployment info saved to: vechain-native-deployment.json');
    console.log('\n📋 Contract Addresses:');
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deployVeChainNative().catch(console.error); 