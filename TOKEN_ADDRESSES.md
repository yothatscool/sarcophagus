# 🪙 VeChain Token Addresses Reference

## Testnet Token Addresses

### Native Tokens
- **VET**: Native token (no contract address needed)
- **VTHO**: `0x0000000000000000000000000000456E65726779`

### ERC-20 Tokens
- **B3TR**: `0x5ef79995FE8a89e0812330E4378eB2660ceDe699`
- **GLO**: `0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e`

### Custom Tokens
- **OBOL**: `[TO BE DEPLOYED]` - Your custom reward token

## Mainnet Token Addresses (for future reference)

### Native Tokens
- **VET**: Native token
- **VTHO**: `0x0000000000000000000000000000456E65726779`

### ERC-20 Tokens
- **B3TR**: `0x5ef79995FE8a89e0812330E4378eB2660ceDe699`
- **GLO**: `0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e`

## Oracle Addresses (Testnet)
```json
[
  "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
  "0xa19f660abf4fed45226787cd17ef723d94d1ce31",
  "0x8c8d7c46219d9205f056f28fee5950ad564d9f23",
  "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc",
  "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c"
]
```

## Contract Deployment Order
1. **DeathVerifier** - Uses oracle addresses
2. **OBOL** - No dependencies
3. **MultiSig** - Uses your deployer address
4. **Sarcophagus** - Uses VTHO, B3TR, GLO, OBOL, DeathVerifier, MultiSig
5. **B3TR Rewards** - Uses B3TR and Sarcophagus

## Frontend Configuration
After deployment, update `frontend/app/config/contracts.ts` with:
- DeathVerifier address
- OBOL address
- MultiSig address
- Sarcophagus address
- B3TR Rewards address 