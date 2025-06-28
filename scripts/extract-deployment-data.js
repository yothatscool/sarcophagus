const fs = require('fs');
const path = require('path');

async function main() {
  console.log("📋 Extracting contract data for VeChain deployment...");

  const contracts = [
    'DeathVerifier',
    'OBOL', 
    'MultiSigWallet',
    'Sarcophagus',
    'B3TRRewards'
  ];

  const deploymentData = {};

  for (const contractName of contracts) {
    try {
      const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      
      deploymentData[contractName] = {
        bytecode: artifact.bytecode,
        abi: artifact.abi,
        constructorParams: getConstructorParams(contractName)
      };
      
      console.log(`✅ ${contractName}: Data extracted`);
    } catch (error) {
      console.log(`❌ ${contractName}: Error extracting data - ${error.message}`);
    }
  }

  // Save to file
  fs.writeFileSync('vechain-deployment-data.json', JSON.stringify(deploymentData, null, 2));
  console.log("\n📄 Deployment data saved to: vechain-deployment-data.json");
  
  // Create deployment instructions
  createDeploymentInstructions(deploymentData);
}

function getConstructorParams(contractName) {
  switch (contractName) {
    case 'DeathVerifier':
      return {
        description: "Oracle addresses array",
        value: [
          "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
          "0xa19f660abf4fed45226787cd17ef723d94d1ce31",
          "0x8c8d7c46219d9205f056f28fee5950ad564d9f23",
          "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc",
          "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c"
        ]
      };
    
    case 'OBOL':
      return {
        description: "No parameters",
        value: []
      };
    
    case 'MultiSigWallet':
      return {
        description: "Signers array, weights array, threshold",
        value: [
          ["YOUR_DEPLOYER_ADDRESS", "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"],
          [1, 1, 1],
          2
        ]
      };
    
    case 'Sarcophagus':
      return {
        description: "VTHO, B3TR, OBOL, GLO, DeathVerifier, OBOL, MultiSig",
        value: [
          "0x0000000000000000000000000000456E65726779",  // VTHO
          "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",  // B3TR
          "OBOL_CONTRACT_ADDRESS",                        // OBOL (replace with actual)
          "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e",  // GLO
          "DEATH_VERIFIER_ADDRESS",                       // DeathVerifier (replace with actual)
          "OBOL_CONTRACT_ADDRESS",                        // OBOL (same as above)
          "MULTISIG_ADDRESS"                              // MultiSig (replace with actual)
        ]
      };
    
    case 'B3TRRewards':
      return {
        description: "B3TR token, Sarcophagus contract, rate threshold",
        value: [
          "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",  // B3TR
          "SARCOPHAGUS_CONTRACT_ADDRESS",                 // Sarcophagus (replace with actual)
          80                                               // rateAdjustmentThreshold
        ]
      };
    
    default:
      return { description: "Unknown", value: [] };
  }
}

function createDeploymentInstructions(deploymentData) {
  const instructions = `
# 🏛️ Sarcophagus Protocol - VeChain Deployment Instructions

## Deployment Order
1. DeathVerifier
2. OBOL Token  
3. MultiSig Wallet
4. Sarcophagus
5. B3TR Rewards

## Contract Data
${Object.entries(deploymentData).map(([name, data]) => `
### ${name}
- **Bytecode**: ${data.bytecode.substring(0, 100)}...
- **ABI**: ${JSON.stringify(data.abi).substring(0, 200)}...
- **Constructor Parameters**: ${data.constructorParams.description}
  \`\`\`json
  ${JSON.stringify(data.constructorParams.value, null, 2)}
  \`\`\`
`).join('\n')}

## Steps
1. Open VeChain Sync2 or VeWorld
2. Switch to Testnet
3. Go to Contract Deployment
4. For each contract:
   - Paste the bytecode
   - Paste the ABI
   - Set constructor parameters (replace placeholder addresses)
   - Deploy and save the address
5. Set up roles and permissions
6. Update frontend configuration

## Role Setup
After deployment, call these functions:

### DeathVerifier
- grantRole(ORACLE_ROLE, oracle_address) for each oracle
- grantRole(ADMIN_ROLE, your_address)

### OBOL
- grantRole(ADMIN_ROLE, your_address)
- grantRole(REWARD_MINTER_ROLE, B3TR_REWARDS_ADDRESS)

### Sarcophagus
- grantRole(DEATH_VERIFIER_ROLE, DEATH_VERIFIER_ADDRESS)
- grantRole(ORACLE_ROLE, oracle_address) for each oracle

### B3TR Rewards
- grantRole(ADMIN_ROLE, your_address)

## Role Constants
- ORACLE_ROLE: 0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6
- ADMIN_ROLE: 0x0000000000000000000000000000000000000000000000000000000000000000
- REWARD_MINTER_ROLE: 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
- DEATH_VERIFIER_ROLE: 0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6
`;

  fs.writeFileSync('VECHAIN_DEPLOYMENT_INSTRUCTIONS.md', instructions);
  console.log("📄 Deployment instructions saved to: VECHAIN_DEPLOYMENT_INSTRUCTIONS.md");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 