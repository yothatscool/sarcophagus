const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function generateSync2Deployment() {
  console.log('🚀 Generating VeChain Sync2 Deployment Data...');
  
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
    console.log('\n📋 Extracting contract bytecode for Sync2 deployment...');
    
    // Get contract artifacts
    const artifactsPath = './artifacts/contracts/';
    const contracts = [
      { 
        name: 'DeathVerifier', 
        file: 'DeathVerifier.sol/DeathVerifier.json',
        constructorParams: [ORACLE_ADDRESSES]
      },
      { 
        name: 'OBOL', 
        file: 'OBOL.sol/OBOL.json',
        constructorParams: []
      },
      { 
        name: 'MultiSigWallet', 
        file: 'MultiSigWallet.sol/MultiSigWallet.json',
        constructorParams: [
          ['0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6', '0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002'],
          [1, 1, 1],
          2
        ]
      },
      { 
        name: 'Sarcophagus', 
        file: 'Sarcophagus.sol/Sarcophagus.json',
        constructorParams: [VTHO_ADDRESS, B3TR_ADDRESS, 'OBOL_ADDRESS_PLACEHOLDER', GLO_ADDRESS, 'DEATHVERIFIER_ADDRESS_PLACEHOLDER', 'OBOL_ADDRESS_PLACEHOLDER', 'MULTISIG_ADDRESS_PLACEHOLDER']
      },
      { 
        name: 'B3TRRewards', 
        file: 'B3TRRewards.sol/B3TRRewards.json',
        constructorParams: [B3TR_ADDRESS, 'SARCOPHAGUS_ADDRESS_PLACEHOLDER', 80]
      }
    ];
    
    const deploymentData = {
      network: 'VeChain Testnet',
      deploymentTime: new Date().toISOString(),
      contracts: [],
      instructions: {
        step1: 'Deploy DeathVerifier first',
        step2: 'Deploy OBOL Token',
        step3: 'Deploy MultiSig Wallet',
        step4: 'Deploy Sarcophagus (use addresses from steps 1-3)',
        step5: 'Deploy B3TR Rewards (use Sarcophagus address from step 4)',
        step6: 'Set up roles and permissions'
      }
    };
    
    for (const contract of contracts) {
      try {
        const artifactPath = artifactsPath + contract.file;
        if (!fs.existsSync(artifactPath)) {
          console.log(`⚠️  Skipping ${contract.name} - artifact not found`);
          continue;
        }
        
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        
        deploymentData.contracts.push({
          name: contract.name,
          bytecode: artifact.bytecode,
          abi: artifact.abi,
          constructorParams: contract.constructorParams,
          estimatedGas: '5000000', // 5M gas estimate
          description: `Deploy ${contract.name} contract`
        });
        
        console.log(`✅ Extracted ${contract.name} bytecode and ABI`);
        
      } catch (error) {
        console.log(`❌ Error extracting ${contract.name}:`, error.message);
      }
    }
    
    // Save deployment data
    fs.writeFileSync('sync2-deployment-data.json', JSON.stringify(deploymentData, null, 2));
    
    // Create step-by-step instructions
    const instructions = `
# VeChain Sync2 Deployment Instructions

## Prerequisites
1. Install Sync2 wallet: https://sync.vechain.org/
2. Fund your account with testnet VET: https://faucet.vechain.org/
3. Open Sync2 and connect to VeChain Testnet

## Deployment Steps

### Step 1: Deploy DeathVerifier
1. Open Sync2 wallet
2. Go to "Contracts" tab
3. Click "Deploy Contract"
4. Paste the bytecode from sync2-deployment-data.json (DeathVerifier)
5. Set constructor parameters: ${JSON.stringify(ORACLE_ADDRESSES)}
6. Deploy and note the contract address

### Step 2: Deploy OBOL Token
1. Deploy OBOL contract with no constructor parameters
2. Note the contract address

### Step 3: Deploy MultiSig Wallet
1. Deploy MultiSigWallet with parameters:
   - Signers: [your_address, 0x0000000000000000000000000000000000000001, 0x0000000000000000000000000000000000000002]
   - Weights: [1, 1, 1]
   - Threshold: 2

### Step 4: Deploy Sarcophagus
1. Use the addresses from previous steps
2. Constructor parameters: [VTHO_ADDRESS, B3TR_ADDRESS, OBOL_ADDRESS, GLO_ADDRESS, DEATHVERIFIER_ADDRESS, OBOL_ADDRESS, MULTISIG_ADDRESS]

### Step 5: Deploy B3TR Rewards
1. Use Sarcophagus address from step 4
2. Constructor parameters: [B3TR_ADDRESS, SARCOPHAGUS_ADDRESS, 80]

### Step 6: Set Up Roles
After deployment, call these methods on each contract:
- Grant ORACLE_ROLE to oracle addresses
- Grant ADMIN_ROLE to deployer
- Grant REWARD_MINTER_ROLE to B3TR Rewards
- Grant DEATH_VERIFIER_ROLE to DeathVerifier

## Contract Addresses
- VTHO: ${VTHO_ADDRESS}
- B3TR: ${B3TR_ADDRESS}
- GLO: ${GLO_ADDRESS}

## Oracle Addresses
${ORACLE_ADDRESSES.map((addr, i) => `${i + 1}. ${addr}`).join('\n')}
`;
    
    fs.writeFileSync('SYNC2_DEPLOYMENT_INSTRUCTIONS.md', instructions);
    
    console.log('\n🎉 === SYNC2 DEPLOYMENT DATA GENERATED ===');
    console.log('📄 Deployment data saved to: sync2-deployment-data.json');
    console.log('📋 Instructions saved to: SYNC2_DEPLOYMENT_INSTRUCTIONS.md');
    console.log('\n📋 Next Steps:');
    console.log('1. Open Sync2 wallet');
    console.log('2. Connect to VeChain Testnet');
    console.log('3. Follow the instructions in SYNC2_DEPLOYMENT_INSTRUCTIONS.md');
    console.log('4. Deploy contracts in order (DeathVerifier → OBOL → MultiSig → Sarcophagus → B3TR Rewards)');
    
  } catch (error) {
    console.error('❌ Error generating deployment data:', error);
    process.exit(1);
  }
}

generateSync2Deployment().catch(console.error); 