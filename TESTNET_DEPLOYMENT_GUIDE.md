# 🚀 VeChain Testnet Deployment Guide

This guide will walk you through deploying the Sarcophagus Protocol to VeChain testnet.

## 📋 Prerequisites

1. **VeChain Testnet VET**: You need testnet VET for deployment gas fees
2. **Private Key**: Your deployment wallet private key
3. **Environment Setup**: Node.js, npm/yarn, and Hardhat configured

## 🔧 Environment Setup

### 1. Set up environment variables

Create or update your `.env` file:

```bash
# Deployment wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# VeChain RPC URLs (optional - defaults are provided)
VECHAIN_TESTNET_URL=https://testnet.veblocks.net
VECHAIN_MAINNET_URL=https://mainnet.veblocks.net

# Gas reporting (optional)
REPORT_GAS=true
```

### 2. Get VeChain Testnet VET

1. Visit the [VeChain Faucet](https://faucet.vechain.org/)
2. Enter your wallet address
3. Request testnet VET (you'll receive 1000 VET)

## 🚀 Deployment Steps

### Step 1: Compile Contracts

```bash
npx hardhat compile
```

### Step 2: Run Tests (Optional but Recommended)

```bash
npx hardhat test
```

### Step 3: Deploy to Testnet

```bash
npx hardhat run scripts/deploy-testnet.js --network vechain_testnet
```

This will:
- Deploy all core contracts (DeathVerifier, Sarcophagus, OBOL, B3TR Rewards, MultiSig)
- Set up proper roles and permissions
- Initialize OBOL token with rewards
- Save deployment info to `deployment-testnet.json`

### Step 4: Update Frontend Configuration

```bash
node scripts/update-frontend-config.js
```

This automatically updates your frontend config with the deployed contract addresses.

### Step 5: Verify Contracts (Optional)

1. Visit [VeChain Testnet Explorer](https://explore-testnet.vechain.org/)
2. Search for your deployed contract addresses
3. Verify contract source code if needed

## 📊 Expected Deployment Output

```
🚀 Deploying Sarcophagus Protocol to VeChain Testnet...
Deploying contracts with account: 0x...
Account balance: 1000.0 VET

📋 Using token addresses:
B3TR: 0x0000000000000000000000000000000000000000
VTHO: 0x0000000000000000000000000000456E65726779
VET: Native token (no contract address)

🔍 Deploying DeathVerifier...
✅ DeathVerifier deployed to: 0x...

⚰️ Deploying Sarcophagus...
✅ Sarcophagus deployed to: 0x...

🪙 Deploying OBOL Token...
✅ OBOL Token deployed to: 0x...

🎁 Deploying B3TR Rewards...
✅ B3TR Rewards deployed to: 0x...

🔐 Deploying MultiSig Wallet...
✅ MultiSig Wallet deployed to: 0x...

🔑 Setting up roles and permissions...
✅ Roles configured successfully

💰 Initializing OBOL token...
✅ OBOL token initialized

🎉 === DEPLOYMENT COMPLETE ===
📄 Deployment info saved to: deployment-testnet.json

📋 Contract Addresses:
DeathVerifier: 0x...
Sarcophagus: 0x...
OBOL Token: 0x...
B3TR Rewards: 0x...
MultiSig Wallet: 0x...

🔗 Testnet Explorer: https://explore-testnet.vechain.org
```

## 🧪 Testing Your Deployment

### 1. Start Frontend

```bash
cd frontend
npm run dev
```

### 2. Connect Wallet

1. Open your browser to `http://localhost:3000`
2. Connect your wallet (MetaMask, etc.)
3. Switch to VeChain testnet (Chain ID: 39)

### 3. Test Core Functions

- ✅ User verification
- ✅ Vault creation
- ✅ Token deposits (VET, VTHO, B3TR)
- ✅ Beneficiary management
- ✅ OBOL token locking
- ✅ Death verification
- ✅ Inheritance claiming
- ✅ B3TR rewards claiming

## 🔍 Troubleshooting

### Common Issues

1. **Insufficient VET**: Get more testnet VET from the faucet
2. **Network Issues**: Check your RPC URL and internet connection
3. **Gas Issues**: VeChain uses fee delegation, so gas price should be 0
4. **Contract Verification**: Use the testnet explorer to verify contracts

### Error Messages

- `"insufficient funds"`: Get more testnet VET
- `"nonce too low"`: Wait a moment and retry
- `"contract deployment failed"`: Check contract compilation and dependencies

## 📝 Post-Deployment Checklist

- [ ] All contracts deployed successfully
- [ ] Frontend config updated with new addresses
- [ ] All core functions tested on testnet
- [ ] Contract addresses documented
- [ ] Team members have access to testnet
- [ ] Security review completed
- [ ] Documentation updated

## 🔗 Useful Links

- [VeChain Testnet Explorer](https://explore-testnet.vechain.org/)
- [VeChain Faucet](https://faucet.vechain.org/)
- [VeChain Documentation](https://docs.vechain.org/)
- [Hardhat VeChain Plugin](https://github.com/vechain/hardhat-plugin)

## 🎉 Success!

Once you've completed all steps and tested the functionality, your Sarcophagus Protocol is ready for testnet launch! 

**Next steps:**
1. Share with your team for testing
2. Monitor for any issues
3. Prepare for mainnet deployment
4. Announce testnet launch

---

*For support or questions, refer to the main README or create an issue in the repository.* 
