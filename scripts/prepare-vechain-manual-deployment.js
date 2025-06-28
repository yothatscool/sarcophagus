const fs = require('fs');
const path = require('path');

async function main() {
  console.log("📋 Preparing contract data for VeChain manual deployment...");

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
      
      console.log(`✅ ${contractName}: Data prepared`);
    } catch (error) {
      console.log(`❌ ${contractName}: Error preparing data - ${error.message}`);
    }
  }

  // Create deployment guide
  const deploymentGuide = createDeploymentGuide(deploymentData);
  
  // Save to files
  fs.writeFileSync('vechain-manual-deployment-data.json', JSON.stringify(deploymentData, null, 2));
  fs.writeFileSync('VECHAIN_MANUAL_DEPLOYMENT_GUIDE.md', deploymentGuide);
  
  console.log("\n📄 Files created:");
  console.log("- vechain-manual-deployment-data.json (contract data)");
  console.log("- VECHAIN_MANUAL_DEPLOYMENT_GUIDE.md (step-by-step guide)");
  console.log("\n🚀 Ready for manual deployment with VeChain Sync2 or VeWorld!");
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

function createDeploymentGuide(deploymentData) {
  return `# 🏛️ Sarcophagus Protocol - VeChain Manual Deployment Guide

## Prerequisites
- VeChain Sync2 or VeWorld wallet
- Testnet VET (get from https://faucet.vechain.org/)
- Switch to **Testnet** network

## 📋 Deployment Order
1. DeathVerifier
2. OBOL Token  
3. MultiSig Wallet
4. Sarcophagus
5. B3TR Rewards

## 🚀 Step-by-Step Deployment

### Step 1: DeathVerifier Contract

**Bytecode**: \`${deploymentData.DeathVerifier.bytecode}\`

**ABI**: \`${JSON.stringify(deploymentData.DeathVerifier.abi)}\`

**Constructor Parameters**:
\`\`\`json
${JSON.stringify(deploymentData.DeathVerifier.constructorParams.value, null, 2)}
\`\`\`

**Steps**:
1. Open VeChain Sync2/VeWorld
2. Go to Contract Deployment
3. Paste the bytecode above
4. Paste the ABI above
5. Set constructor parameters (oracle addresses array)
6. Deploy and save the address: \`[DEATH_VERIFIER_ADDRESS]\`

---

### Step 2: OBOL Token Contract

**Bytecode**: \`${deploymentData.OBOL.bytecode}\`

**ABI**: \`${JSON.stringify(deploymentData.OBOL.abi)}\`

**Constructor Parameters**: No parameters needed

**Steps**:
1. Paste the bytecode above
2. Paste the ABI above
3. No constructor parameters needed
4. Deploy and save the address: \`[OBOL_ADDRESS]\`

---

### Step 3: MultiSig Wallet Contract

**Bytecode**: \`${deploymentData.MultiSigWallet.bytecode}\`

**ABI**: \`${JSON.stringify(deploymentData.MultiSigWallet.abi)}\`

**Constructor Parameters**:
\`\`\`json
${JSON.stringify(deploymentData.MultiSigWallet.constructorParams.value, null, 2)}
\`\`\`

**Steps**:
1. Replace \`YOUR_DEPLOYER_ADDRESS\` with your actual address
2. Paste the bytecode above
3. Paste the ABI above
4. Set constructor parameters
5. Deploy and save the address: \`[MULTISIG_ADDRESS]\`

---

### Step 4: Sarcophagus Contract

**Bytecode**: \`${deploymentData.Sarcophagus.bytecode}\`

**ABI**: \`${JSON.stringify(deploymentData.Sarcophagus.abi)}\`

**Constructor Parameters**:
\`\`\`json
${JSON.stringify(deploymentData.Sarcophagus.constructorParams.value, null, 2)}
\`\`\`

**Steps**:
1. Replace placeholder addresses with actual deployed addresses:
   - \`OBOL_CONTRACT_ADDRESS\` → [OBOL_ADDRESS] from Step 2
   - \`DEATH_VERIFIER_ADDRESS\` → [DEATH_VERIFIER_ADDRESS] from Step 1
   - \`MULTISIG_ADDRESS\` → [MULTISIG_ADDRESS] from Step 3
2. Paste the bytecode above
3. Paste the ABI above
4. Set constructor parameters
5. Deploy and save the address: \`[SARCOPHAGUS_ADDRESS]\`

---

### Step 5: B3TR Rewards Contract

**Bytecode**: \`${deploymentData.B3TRRewards.bytecode}\`

**ABI**: \`${JSON.stringify(deploymentData.B3TRRewards.abi)}\`

**Constructor Parameters**:
\`\`\`json
${JSON.stringify(deploymentData.B3TRRewards.constructorParams.value, null, 2)}
\`\`\`

**Steps**:
1. Replace \`SARCOPHAGUS_CONTRACT_ADDRESS\` with [SARCOPHAGUS_ADDRESS] from Step 4
2. Paste the bytecode above
3. Paste the ABI above
4. Set constructor parameters
5. Deploy and save the address: \`[B3TR_REWARDS_ADDRESS]\`

---

## 🔐 Post-Deployment Role Setup

After all contracts are deployed, you need to set up roles:

### DeathVerifier Roles
- Grant ORACLE_ROLE to each oracle address
- Grant ADMIN_ROLE to your deployer address

### OBOL Roles
- Grant ADMIN_ROLE to your deployer address
- Grant REWARD_MINTER_ROLE to B3TR Rewards address

### Sarcophagus Roles
- Grant DEATH_VERIFIER_ROLE to DeathVerifier address
- Grant ORACLE_ROLE to each oracle address

### B3TR Rewards Roles
- Grant ADMIN_ROLE to your deployer address

## 📝 Role Constants
- ORACLE_ROLE: \`0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6\`
- ADMIN_ROLE: \`0x0000000000000000000000000000000000000000000000000000000000000000\`
- REWARD_MINTER_ROLE: \`0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\`
- DEATH_VERIFIER_ROLE: \`0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6\`

## 📊 Contract Addresses Tracker

| Contract | Address | Status |
|----------|---------|--------|
| DeathVerifier | \`[TO BE DEPLOYED]\` | ⏳ |
| OBOL | \`[TO BE DEPLOYED]\` | ⏳ |
| MultiSig | \`[TO BE DEPLOYED]\` | ⏳ |
| Sarcophagus | \`[TO BE DEPLOYED]\` | ⏳ |
| B3TR Rewards | \`[TO BE DEPLOYED]\` | ⏳ |

## 🌐 Verification
- Check all contracts on VeChain testnet explorer: https://explore-testnet.vechain.org
- Verify contract addresses are correct
- Test basic contract functions

## 📞 Support
If you encounter issues:
1. Check VeChain documentation: https://docs.vechain.org/
2. Join VeChain Discord: https://discord.gg/vechain
3. Use VeChain forum: https://forum.vechain.org/

---

**Ready to deploy!** 🚀
`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 