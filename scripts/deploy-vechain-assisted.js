const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🏛️ VeChain Assisted Deployment - Generating deployment data...");

  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deployer account:", deployer.address);

    // Contract addresses for testnet
    const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779";
    const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
    const GLO_ADDRESS = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e";

    // Oracle addresses (testnet)
    const ORACLE_ADDRESSES = [
      "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
      "0xa19f660abf4fed45226787cd17ef723d94d1ce31",
      "0x8c8d7c46219d9205f056f28fee5950ad564d9f23",
      "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc",
      "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c"
    ];

    // Get contract factories
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const OBOL = await ethers.getContractFactory("OBOL");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");

    // Generate deployment data
    const deploymentData = {
      deployer: deployer.address,
      network: "VeChain Testnet",
      contracts: {
        DeathVerifier: {
          bytecode: DeathVerifier.bytecode,
          abi: DeathVerifier.interface.format(),
          constructorArgs: [ORACLE_ADDRESSES],
          description: "Death verification contract with oracle addresses"
        },
        OBOL: {
          bytecode: OBOL.bytecode,
          abi: OBOL.interface.format(),
          constructorArgs: [],
          description: "OBOL reward token contract"
        },
        MultiSigWallet: {
          bytecode: MultiSigWallet.bytecode,
          abi: MultiSigWallet.interface.format(),
          constructorArgs: [
            [deployer.address, "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"],
            [1, 1, 1],
            2
          ],
          description: "Multi-signature wallet contract"
        },
        Sarcophagus: {
          bytecode: Sarcophagus.bytecode,
          abi: Sarcophagus.interface.format(),
          constructorArgs: [
            VTHO_ADDRESS,
            B3TR_ADDRESS,
            "OBOL_ADDRESS_PLACEHOLDER", // Will be replaced after OBOL deployment
            GLO_ADDRESS,
            "DEATH_VERIFIER_ADDRESS_PLACEHOLDER", // Will be replaced after DeathVerifier deployment
            "OBOL_ADDRESS_PLACEHOLDER", // Same as above
            "MULTISIG_ADDRESS_PLACEHOLDER" // Will be replaced after MultiSig deployment
          ],
          description: "Main Sarcophagus protocol contract"
        },
        B3TRRewards: {
          bytecode: B3TRRewards.bytecode,
          abi: B3TRRewards.interface.format(),
          constructorArgs: [
            B3TR_ADDRESS,
            "SARCOPHAGUS_ADDRESS_PLACEHOLDER", // Will be replaced after Sarcophagus deployment
            80
          ],
          description: "B3TR rewards distribution contract"
        }
      },
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      oracles: ORACLE_ADDRESSES,
      roleConstants: {
        ORACLE_ROLE: "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
        ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
        REWARD_MINTER_ROLE: "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
        DEATH_VERIFIER_ROLE: "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6"
      }
    };

    // Save deployment data
    fs.writeFileSync('vechain-assisted-deployment.json', JSON.stringify(deploymentData, null, 2));

    // Generate step-by-step instructions
    const instructions = generateInstructions(deploymentData);
    fs.writeFileSync('VECHAIN_ASSISTED_DEPLOYMENT.md', instructions);

    console.log("\n✅ Deployment data generated successfully!");
    console.log("\n📄 Files created:");
    console.log("- vechain-assisted-deployment.json (contract data)");
    console.log("- VECHAIN_ASSISTED_DEPLOYMENT.md (step-by-step guide)");
    
    console.log("\n🚀 Next Steps:");
    console.log("1. Open VeChain Sync2 or VeWorld");
    console.log("2. Switch to Testnet");
    console.log("3. Follow the guide in VECHAIN_ASSISTED_DEPLOYMENT.md");
    console.log("4. Deploy contracts in order and update addresses");
    console.log("5. Set up roles and permissions");

  } catch (error) {
    console.error("❌ Error generating deployment data:", error);
    throw error;
  }
}

function generateInstructions(deploymentData) {
  return `# 🏛️ VeChain Assisted Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Sarcophagus Protocol to VeChain testnet using VeChain Sync2 or VeWorld.

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

**Description**: ${deploymentData.contracts.DeathVerifier.description}

**Bytecode**: \`${deploymentData.contracts.DeathVerifier.bytecode}\`

**ABI**: \`${deploymentData.contracts.DeathVerifier.abi}\`

**Constructor Parameters**:
\`\`\`json
${JSON.stringify(deploymentData.contracts.DeathVerifier.constructorArgs, null, 2)}
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

**Description**: ${deploymentData.contracts.OBOL.description}

**Bytecode**: \`${deploymentData.contracts.OBOL.bytecode}\`

**ABI**: \`${deploymentData.contracts.OBOL.abi}\`

**Constructor Parameters**: No parameters needed

**Steps**:
1. Paste the bytecode above
2. Paste the ABI above
3. No constructor parameters needed
4. Deploy and save the address: \`[OBOL_ADDRESS]\`

---

### Step 3: MultiSig Wallet Contract

**Description**: ${deploymentData.contracts.MultiSigWallet.description}

**Bytecode**: \`${deploymentData.contracts.MultiSigWallet.bytecode}\`

**ABI**: \`${deploymentData.contracts.MultiSigWallet.abi}\`

**Constructor Parameters**:
\`\`\`json
${JSON.stringify(deploymentData.contracts.MultiSigWallet.constructorArgs, null, 2)}
\`\`\`

**Steps**:
1. Replace \`${deploymentData.deployer}\` with your actual address if different
2. Paste the bytecode above
3. Paste the ABI above
4. Set constructor parameters
5. Deploy and save the address: \`[MULTISIG_ADDRESS]\`

---

### Step 4: Sarcophagus Contract

**Description**: ${deploymentData.contracts.Sarcophagus.description}

**Bytecode**: \`${deploymentData.contracts.Sarcophagus.bytecode}\`

**ABI**: \`${deploymentData.contracts.Sarcophagus.abi}\`

**Constructor Parameters** (replace placeholders):
\`\`\`json
[
  "${deploymentData.tokens.vtho}",
  "${deploymentData.tokens.b3tr}",
  "[OBOL_ADDRESS]",  // Replace with actual OBOL address
  "${deploymentData.tokens.glo}",
  "[DEATH_VERIFIER_ADDRESS]",  // Replace with actual DeathVerifier address
  "[OBOL_ADDRESS]",  // Same as above
  "[MULTISIG_ADDRESS]"  // Replace with actual MultiSig address
]
\`\`\`

**Steps**:
1. Replace all placeholder addresses with actual deployed addresses
2. Paste the bytecode above
3. Paste the ABI above
4. Set constructor parameters
5. Deploy and save the address: \`[SARCOPHAGUS_ADDRESS]\`

---

### Step 5: B3TR Rewards Contract

**Description**: ${deploymentData.contracts.B3TRRewards.description}

**Bytecode**: \`${deploymentData.contracts.B3TRRewards.bytecode}\`

**ABI**: \`${deploymentData.contracts.B3TRRewards.abi}\`

**Constructor Parameters** (replace placeholder):
\`\`\`json
[
  "${deploymentData.tokens.b3tr}",
  "[SARCOPHAGUS_ADDRESS]",  // Replace with actual Sarcophagus address
  80
]
\`\`\`

**Steps**:
1. Replace \`[SARCOPHAGUS_ADDRESS]\` with actual Sarcophagus address
2. Paste the bytecode above
3. Paste the ABI above
4. Set constructor parameters
5. Deploy and save the address: \`[B3TR_REWARDS_ADDRESS]\`

---

## 🔐 Post-Deployment Role Setup

After all contracts are deployed, set up roles:

### DeathVerifier Roles
- Grant ORACLE_ROLE (\`${deploymentData.roleConstants.ORACLE_ROLE}\`) to each oracle
- Grant ADMIN_ROLE (\`${deploymentData.roleConstants.ADMIN_ROLE}\`) to your deployer address

### OBOL Roles
- Grant ADMIN_ROLE (\`${deploymentData.roleConstants.ADMIN_ROLE}\`) to your deployer address
- Grant REWARD_MINTER_ROLE (\`${deploymentData.roleConstants.REWARD_MINTER_ROLE}\`) to B3TR Rewards address

### Sarcophagus Roles
- Grant DEATH_VERIFIER_ROLE (\`${deploymentData.roleConstants.DEATH_VERIFIER_ROLE}\`) to DeathVerifier address
- Grant ORACLE_ROLE (\`${deploymentData.roleConstants.ORACLE_ROLE}\`) to each oracle

### B3TR Rewards Roles
- Grant ADMIN_ROLE (\`${deploymentData.roleConstants.ADMIN_ROLE}\`) to your deployer address

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