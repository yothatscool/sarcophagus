
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
5. Set constructor parameters: ["0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6","0xa19f660abf4fed45226787cd17ef723d94d1ce31","0x8c8d7c46219d9205f056f28fee5950ad564d9f23","0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc","0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c"]
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
- VTHO: 0x0000000000000000000000000000456E65726779
- B3TR: 0x5ef79995FE8a89e0812330E4378eB2660ceDe699
- GLO: 0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e

## Oracle Addresses
1. 0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6
2. 0xa19f660abf4fed45226787cd17ef723d94d1ce31
3. 0x8c8d7c46219d9205f056f28fee5950ad564d9f23
4. 0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc
5. 0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c
