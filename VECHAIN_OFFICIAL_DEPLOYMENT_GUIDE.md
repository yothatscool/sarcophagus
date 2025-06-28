# 🏛️ Sarcophagus Protocol - VeChain Official Deployment Guide

## Overview
This guide shows how to deploy the Sarcophagus Protocol using VeChain's official tools:
- **VeChain Sync2** or **VeWorld** for contract deployment
- **Connex framework** for dApp integration
- **VeChainThor Wallet** for contract interaction

## Prerequisites
1. **VeChain Sync2 Wallet** or **VeWorld** installed
2. **Testnet VET** (get from https://faucet.vechain.org/)
3. **Contract artifacts** (already compiled in `artifacts/` folder)

## 📋 Contract Deployment Order

### 1. DeathVerifier Contract
**File**: `artifacts/contracts/DeathVerifier.sol/DeathVerifier.json`

**Constructor Parameters**:
```json
[
  [
    "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
    "0xa19f660abf4fed45226787cd17ef723d94d1ce31", 
    "0x8c8d7c46219d9205f056f28fee5950ad564d9f23",
    "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc",
    "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c"
  ]
]
```

### 2. OBOL Token Contract
**File**: `artifacts/contracts/OBOL.sol/OBOL.json`

**Constructor Parameters**: `[]` (no parameters)

### 3. MultiSig Wallet Contract
**File**: `artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json`

**Constructor Parameters**:
```json
[
  [
    "YOUR_DEPLOYER_ADDRESS",
    "0x0000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000002"
  ],
  [1, 1, 1],
  2
]
```

### 4. Sarcophagus Contract
**File**: `artifacts/contracts/Sarcophagus.sol/Sarcophagus.json`

**Constructor Parameters**:
```json
[
  "0x0000000000000000000000000000456E65726779",  // VTHO
  "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",  // B3TR
  "OBOL_CONTRACT_ADDRESS",                        // OBOL (from step 2)
  "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e",  // GLO
  "DEATH_VERIFIER_ADDRESS",                       // DeathVerifier (from step 1)
  "OBOL_CONTRACT_ADDRESS",                        // OBOL (same as above)
  "MULTISIG_ADDRESS"                              // MultiSig (from step 3)
]
```

### 5. B3TR Rewards Contract
**File**: `artifacts/contracts/B3TRRewards.sol/B3TRRewards.json`

**Constructor Parameters**:
```json
[
  "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",  // B3TR
  "SARCOPHAGUS_CONTRACT_ADDRESS",                 // Sarcophagus (from step 4)
  80                                               // rateAdjustmentThreshold
]
```

## 🚀 Deployment Steps

### Step 1: Open VeChain Sync2 or VeWorld
1. Open your VeChain wallet
2. Switch to **Testnet**
3. Ensure you have testnet VET

### Step 2: Deploy Contracts
For each contract:

1. **Go to Contract Deployment**
   - In Sync2: Tools → Contract Deployment
   - In VeWorld: Similar option

2. **Load Contract**
   - Copy the bytecode from the corresponding JSON file
   - Copy the ABI from the corresponding JSON file

3. **Set Constructor Parameters**
   - Use the parameters listed above
   - Replace placeholder addresses with actual deployed addresses

4. **Deploy**
   - Confirm the transaction
   - Save the deployed contract address

### Step 3: Set Up Roles and Permissions

After all contracts are deployed, you need to set up roles:

#### DeathVerifier Roles
```javascript
// Grant ORACLE_ROLE to oracle addresses
await deathVerifier.grantRole(ORACLE_ROLE, "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6");
await deathVerifier.grantRole(ORACLE_ROLE, "0xa19f660abf4fed45226787cd17ef723d94d1ce31");
await deathVerifier.grantRole(ORACLE_ROLE, "0x8c8d7c46219d9205f056f28fee5950ad564d9f23");
await deathVerifier.grantRole(ORACLE_ROLE, "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc");
await deathVerifier.grantRole(ORACLE_ROLE, "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c");

// Grant ADMIN_ROLE to deployer
await deathVerifier.grantRole(ADMIN_ROLE, "YOUR_DEPLOYER_ADDRESS");
```

#### OBOL Roles
```javascript
// Grant ADMIN_ROLE to deployer
await obol.grantRole(ADMIN_ROLE, "YOUR_DEPLOYER_ADDRESS");

// Grant REWARD_MINTER_ROLE to B3TR Rewards
await obol.grantRole(REWARD_MINTER_ROLE, "B3TR_REWARDS_ADDRESS");
```

#### Sarcophagus Roles
```javascript
// Grant DEATH_VERIFIER_ROLE to DeathVerifier
await sarcophagus.grantRole(DEATH_VERIFIER_ROLE, "DEATH_VERIFIER_ADDRESS");

// Grant ORACLE_ROLE to oracle addresses
await sarcophagus.grantRole(ORACLE_ROLE, "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6");
await sarcophagus.grantRole(ORACLE_ROLE, "0xa19f660abf4fed45226787cd17ef723d94d1ce31");
await sarcophagus.grantRole(ORACLE_ROLE, "0x8c8d7c46219d9205f056f28fee5950ad564d9f23");
await sarcophagus.grantRole(ORACLE_ROLE, "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc");
await sarcophagus.grantRole(ORACLE_ROLE, "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c");
```

#### B3TR Rewards Roles
```javascript
// Grant ADMIN_ROLE to deployer
await b3trRewards.grantRole(ADMIN_ROLE, "YOUR_DEPLOYER_ADDRESS");
```

## 🔗 Role Constants

Use these role hashes:
```javascript
const ORACLE_ROLE = "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6";
const ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const REWARD_MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const DEATH_VERIFIER_ROLE = "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6";
```

## 📝 Contract Addresses to Track

Keep track of these addresses as you deploy:
- DeathVerifier: `[deployed address]`
- OBOL: `[deployed address]`
- MultiSig: `[deployed address]`
- Sarcophagus: `[deployed address]`
- B3TR Rewards: `[deployed address]`

## 🌐 Testnet Explorer
View your deployed contracts at: https://explore-testnet.vechain.org

## 🔧 Frontend Integration

After deployment, update your frontend configuration with the deployed contract addresses and use the Connex framework for dApp integration.

## 📞 Support
If you encounter issues:
1. Check VeChain documentation: https://docs.vechain.org/
2. Join VeChain Discord: https://discord.gg/vechain
3. Use VeChain forum: https://forum.vechain.org/ 