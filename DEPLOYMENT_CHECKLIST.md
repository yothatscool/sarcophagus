# 🏛️ Sarcophagus Protocol - VeChain Deployment Checklist

## ✅ Pre-Deployment Checklist
- [ ] VeChain Sync2 or VeWorld wallet installed
- [ ] Switched to **Testnet** network
- [ ] Have testnet VET (get from https://faucet.vechain.org/)
- [ ] Contract artifacts ready (✅ already compiled)
- [ ] Deployment instructions ready (✅ already generated)

## 📋 Deployment Steps

### 1. DeathVerifier Contract
**Status**: ⏳ Ready to deploy

**Constructor Parameters**:
```json
[
  "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
  "0xa19f660abf4fed45226787cd17ef723d94d1ce31", 
  "0x8c8d7c46219d9205f056f28fee5950ad564d9f23",
  "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc",
  "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c"
]
```

**Steps**:
- [ ] Open VeChain Sync2/VeWorld
- [ ] Go to Contract Deployment
- [ ] Paste DeathVerifier bytecode
- [ ] Paste DeathVerifier ABI
- [ ] Set constructor parameters (above)
- [ ] Deploy and save address: `[DEATH_VERIFIER_ADDRESS]`

### 2. OBOL Token Contract
**Status**: ⏳ Ready to deploy

**Constructor Parameters**: `[]` (no parameters)

**Steps**:
- [ ] Paste OBOL bytecode
- [ ] Paste OBOL ABI
- [ ] No constructor parameters needed
- [ ] Deploy and save address: `[OBOL_ADDRESS]`

### 3. MultiSig Wallet Contract
**Status**: ⏳ Ready to deploy

**Constructor Parameters**:
```json
[
  ["YOUR_DEPLOYER_ADDRESS", "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"],
  [1, 1, 1],
  2
]
```

**Steps**:
- [ ] Replace `YOUR_DEPLOYER_ADDRESS` with your actual address
- [ ] Paste MultiSig bytecode
- [ ] Paste MultiSig ABI
- [ ] Set constructor parameters (above)
- [ ] Deploy and save address: `[MULTISIG_ADDRESS]`

### 4. Sarcophagus Contract
**Status**: ⏳ Ready to deploy

**Constructor Parameters**:
```json
[
  "0x0000000000000000000000000000456E65726779",  // VTHO
  "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",  // B3TR
  "[OBOL_ADDRESS]",                               // OBOL (from step 2)
  "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e",  // GLO
  "[DEATH_VERIFIER_ADDRESS]",                     // DeathVerifier (from step 1)
  "[OBOL_ADDRESS]",                               // OBOL (same as above)
  "[MULTISIG_ADDRESS]"                            // MultiSig (from step 3)
]
```

**Steps**:
- [ ] Replace placeholder addresses with actual deployed addresses
- [ ] Paste Sarcophagus bytecode
- [ ] Paste Sarcophagus ABI
- [ ] Set constructor parameters (above)
- [ ] Deploy and save address: `[SARCOPHAGUS_ADDRESS]`

### 5. B3TR Rewards Contract
**Status**: ⏳ Ready to deploy

**Constructor Parameters**:
```json
[
  "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",  // B3TR
  "[SARCOPHAGUS_ADDRESS]",                        // Sarcophagus (from step 4)
  80                                               // rateAdjustmentThreshold
]
```

**Steps**:
- [ ] Replace `[SARCOPHAGUS_ADDRESS]` with actual address
- [ ] Paste B3TR Rewards bytecode
- [ ] Paste B3TR Rewards ABI
- [ ] Set constructor parameters (above)
- [ ] Deploy and save address: `[B3TR_REWARDS_ADDRESS]`

## 🔐 Post-Deployment Role Setup

### DeathVerifier Roles
- [ ] Grant ORACLE_ROLE to each oracle address
- [ ] Grant ADMIN_ROLE to your deployer address

### OBOL Roles
- [ ] Grant ADMIN_ROLE to your deployer address
- [ ] Grant REWARD_MINTER_ROLE to B3TR Rewards address

### Sarcophagus Roles
- [ ] Grant DEATH_VERIFIER_ROLE to DeathVerifier address
- [ ] Grant ORACLE_ROLE to each oracle address

### B3TR Rewards Roles
- [ ] Grant ADMIN_ROLE to your deployer address

## 📝 Contract Addresses Tracker

| Contract | Address | Status |
|----------|---------|--------|
| DeathVerifier | `[TO BE DEPLOYED]` | ⏳ |
| OBOL | `[TO BE DEPLOYED]` | ⏳ |
| MultiSig | `[TO BE DEPLOYED]` | ⏳ |
| Sarcophagus | `[TO BE DEPLOYED]` | ⏳ |
| B3TR Rewards | `[TO BE DEPLOYED]` | ⏳ |

## 🔗 Role Constants
- ORACLE_ROLE: `0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6`
- ADMIN_ROLE: `0x0000000000000000000000000000000000000000000000000000000000000000`
- REWARD_MINTER_ROLE: `0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`
- DEATH_VERIFIER_ROLE: `0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6`

## 🌐 Verification
- [ ] Check all contracts on VeChain testnet explorer
- [ ] Verify contract addresses are correct
- [ ] Test basic contract functions
- [ ] Update frontend configuration

## 📞 Support
If you encounter issues:
1. Check VeChain documentation: https://docs.vechain.org/
2. Join VeChain Discord: https://discord.gg/vechain
3. Use VeChain forum: https://forum.vechain.org/

---

**Ready to start deployment?** 🚀 