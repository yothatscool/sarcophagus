
# 🏛️ Sarcophagus Protocol - VeChain Deployment Instructions

## Deployment Order
1. DeathVerifier
2. OBOL Token  
3. MultiSig Wallet
4. Sarcophagus
5. B3TR Rewards

## Contract Data

### DeathVerifier
- **Bytecode**: 0x6040608081523462000168576001908180556200001c336200016d565b506200002833620001ed565b5062000034336200...
- **ABI**: [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AccessControlBadConfirmation","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"addr...
- **Constructor Parameters**: Oracle addresses array
  ```json
  [
  "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
  "0xa19f660abf4fed45226787cd17ef723d94d1ce31",
  "0x8c8d7c46219d9205f056f28fee5950ad564d9f23",
  "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc",
  "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c"
]
  ```


### OBOL
- **Bytecode**: 0x604060c081523462000451576200001562000456565b906200002062000456565b82519092906001600160401b03908181...
- **ABI**: [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AccessControlBadConfirmation","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"addr...
- **Constructor Parameters**: No parameters
  ```json
  []
  ```


### MultiSigWallet
- **Bytecode**: 0x604060808152346200057b5762002840803803806200001e81620005a1565b92833981016060906060838203126200057b...
- **ABI**: [{"inputs":[{"internalType":"address[]","name":"initialSigners","type":"address[]"},{"internalType":"uint256[]","name":"weights","type":"uint256[]"},{"internalType":"uint256","name":"_requiredWeight",...
- **Constructor Parameters**: Signers array, weights array, threshold
  ```json
  [
  [
    "YOUR_DEPLOYER_ADDRESS",
    "0x0000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000002"
  ],
  [
    1,
    1,
    1
  ],
  2
]
  ```


### Sarcophagus
- **Bytecode**: 0x61016034620002be57601f62005c5638819003918201601f19168301916001600160401b03831184841017620002c35780...
- **ABI**: [{"inputs":[{"internalType":"address","name":"_vthoToken","type":"address"},{"internalType":"address","name":"_b3trToken","type":"address"},{"internalType":"address","name":"_obolToken","type":"addres...
- **Constructor Parameters**: VTHO, B3TR, OBOL, GLO, DeathVerifier, OBOL, MultiSig
  ```json
  [
  "0x0000000000000000000000000000456E65726779",
  "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",
  "OBOL_CONTRACT_ADDRESS",
  "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e",
  "DEATH_VERIFIER_ADDRESS",
  "OBOL_CONTRACT_ADDRESS",
  "MULTISIG_ADDRESS"
]
  ```


### B3TRRewards
- **Bytecode**: 0x60e0346200016557601f62001d1a38819003918201601f19168301916001600160401b038311848410176200016a578084...
- **ABI**: [{"inputs":[{"internalType":"address","name":"_b3trToken","type":"address"},{"internalType":"address","name":"_sarcophagusContract","type":"address"},{"internalType":"uint256","name":"_rateAdjustmentT...
- **Constructor Parameters**: B3TR token, Sarcophagus contract, rate threshold
  ```json
  [
  "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",
  "SARCOPHAGUS_CONTRACT_ADDRESS",
  80
]
  ```


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
