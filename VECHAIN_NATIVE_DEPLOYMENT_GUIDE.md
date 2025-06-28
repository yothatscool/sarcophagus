# VeChain Native Deployment Guide

## Overview
This guide covers deploying the Sarcophagus Protocol using VeChain's native tools, ensuring optimal compatibility and performance.

## Prerequisites

### 1. VeChain Wallets
- **VeWorld** (Mobile): https://veworld.net/
- **Sync2** (Desktop): https://sync.vechain.org/

### 2. Testnet VET & Energy
- Get testnet VET: https://faucet.vechain.org/
- Energy is generated automatically from VET holdings

## Deployment Methods

### Method 1: Sync2 Wallet (Recommended)

#### Step 1: Install Sync2
1. Download Sync2 from https://sync.vechain.org/
2. Install and create a new wallet
3. Switch to VeChain Testnet

#### Step 2: Fund Your Account
1. Copy your wallet address
2. Visit https://faucet.vechain.org/
3. Request testnet VET (minimum 1000 VET recommended)

#### Step 3: Deploy Contracts
1. Open Sync2 wallet
2. Go to "Contracts" tab
3. Click "Deploy Contract"
4. Use the deployment data from `sync2-deployment-data.json`

#### Deployment Order:
1. **DeathVerifier** - Oracle management contract
2. **OBOL Token** - Reward token contract
3. **MultiSig Wallet** - Multi-signature wallet
4. **Sarcophagus** - Main protocol contract
5. **B3TR Rewards** - Bonus rewards contract

### Method 2: VeWorld Mobile Wallet

#### Step 1: Install VeWorld
1. Download VeWorld from App Store/Google Play
2. Create wallet and switch to testnet

#### Step 2: Deploy via dApp Browser
1. Open VeWorld dApp browser
2. Navigate to your deployment interface
3. Use the mobile-optimized deployment flow

## Contract Addresses (Testnet)

### Current Deployment
- **DeathVerifier**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **OBOL Token**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **MultiSig Wallet**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **Sarcophagus**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- **B3TR Rewards**: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

### Token Addresses
- **VET**: Native token (no contract address)
- **VTHO**: `0x0000000000000000000000000000456E65726779`
- **B3TR**: `0x5ef79995FE8a89e0812330E4378eB2660ceDe699`
- **GLO**: `0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e`

### Oracle Addresses
- `0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6`
- `0xa19f660abf4fed45226787cd17ef723d94d1ce31`
- `0x8c8d7c46219d9205f056f28fee5950ad564d9f23`
- `0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc`
- `0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c`

## Frontend Integration

### VeChain-Native Components
The frontend now uses VeChain-native components:

1. **VeChainConnect** - Native wallet connection
2. **VeChainContractInteraction** - Direct contract interaction
3. **Connex Integration** - VeChain's official framework

### Key Features
- ✅ Native VeChain wallet support (VeWorld, Sync2)
- ✅ Direct blockchain interaction via Connex
- ✅ No Ethereum compatibility layer
- ✅ Optimized for VeChain's dual-token model
- ✅ Real-time balance and energy monitoring

## Testing

### Testnet Explorer
- **URL**: https://explore-testnet.vechain.org/
- **Search**: Use contract addresses to verify deployment

### Test Scenarios
1. **Wallet Connection** - Test VeWorld/Sync2 integration
2. **Contract Deployment** - Verify all contracts deploy successfully
3. **Role Assignment** - Test admin and oracle role grants
4. **Asset Deposits** - Test VET/VTHO/B3TR/GLO deposits
5. **Reward Claims** - Test OBOL and B3TR reward distribution

## Security Considerations

### VeChain-Specific
- **Energy Management** - Ensure sufficient energy for transactions
- **Oracle Security** - Verify oracle addresses are correct
- **MultiSig Setup** - Test multi-signature wallet functionality
- **Role Permissions** - Verify proper role assignments

### Best Practices
- Test thoroughly on testnet before mainnet
- Use official VeChain tools only
- Verify contract addresses on explorer
- Monitor transaction status and gas usage

## Troubleshooting

### Common Issues
1. **Insufficient Energy** - Wait for VET to generate energy or buy VTHO
2. **Transaction Failures** - Check gas limits and parameters
3. **Wallet Connection** - Ensure wallet is on correct network (testnet)
4. **Contract Not Found** - Verify deployment was successful

### Support Resources
- **VeChain Documentation**: https://docs.vechain.org/
- **Connex Framework**: https://github.com/vechain/connex
- **VeChain Explorer**: https://explore.vechain.org/
- **Community**: https://t.me/vechain_official_english

## Next Steps

### After Deployment
1. **Verify Contracts** - Check all contracts on explorer
2. **Set Up Roles** - Grant necessary permissions
3. **Test Functionality** - Run through all protocol features
4. **Frontend Testing** - Test user interface and interactions
5. **Documentation** - Update user guides and documentation

### Mainnet Preparation
1. **Security Audit** - Complete security review
2. **Mainnet Deployment** - Deploy to VeChain mainnet
3. **Oracle Setup** - Configure mainnet oracles
4. **User Onboarding** - Launch user acquisition campaign

---

**Note**: This deployment uses VeChain's native tools exclusively, ensuring optimal performance and compatibility with the VeChain ecosystem. 