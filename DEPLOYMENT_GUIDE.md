# 🚀 Sarcophagus Protocol - Deployment Guide

This guide provides step-by-step instructions for deploying the Sarcophagus Protocol to VeChain testnet and mainnet.

## 📋 Prerequisites

### Required Software
- Node.js 18+ 
- npm or yarn
- Git
- VeChain wallet (Sync2 or similar)

### Required Accounts
- VeChain wallet with sufficient VET for deployment
- Access to VeChain RPC endpoints

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd sarcophagus-protocol
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```bash
# Required for deployment
PRIVATE_KEY=your_private_key_here
VECHAIN_TESTNET_URL=https://testnet.veblocks.net
VECHAIN_MAINNET_URL=https://mainnet.veblocks.net

# Optional settings
REPORT_GAS=true
VERBOSE_LOGGING=true
```

### 4. Verify Configuration
```bash
npx hardhat compile
npx hardhat test
```

## 🧪 Testnet Deployment

### Step 1: Prepare Testnet Environment
```bash
# Ensure you have testnet VET
# You can get testnet VET from: https://faucet.vechain.org/
```

### Step 2: Deploy to Testnet
```bash
npx hardhat run scripts/deploy.js --network testnet
```

### Step 3: Verify Deployment
The deployment script will output contract addresses. Verify them on the VeChain testnet explorer:

```bash
# Check deployment status
npx hardhat run scripts/verify-deployment.js --network testnet
```

### Step 4: Test Functionality
```bash
# Run integration tests on testnet
npx hardhat test test/integration-testnet.test.js --network testnet
```

## 🌐 Mainnet Deployment

### Step 1: Security Checklist
Before mainnet deployment, ensure:

- [ ] All tests pass
- [ ] Security analysis completed
- [ ] Gas optimization verified
- [ ] Documentation updated
- [ ] Team review completed

### Step 2: Prepare Mainnet Environment
```bash
# Ensure sufficient VET for deployment
# Estimated deployment cost: ~50 VET
```

### Step 3: Deploy to Mainnet
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

### Step 4: Verify Mainnet Deployment
```bash
# Verify contracts on mainnet
npx hardhat run scripts/verify-deployment.js --network mainnet
```

## 📊 Deployment Costs

### Gas Estimates
```
Contract Deployment Costs:
- Sarcophagus: ~3,314,767 gas (11% of block limit)
- OBOL: ~1,940,416 gas (6.5% of block limit)  
- DeathVerifier: ~1,159,236 gas (3.9% of block limit)
- B3TRRewards: ~1,200,000 gas (estimated)
- MultiSigWallet: ~1,500,000 gas (estimated)
- TokenManager: ~800,000 gas (estimated)
- MilestoneManager: ~600,000 gas (estimated)

Total Estimated Cost: ~50 VET
```

### Network Configuration
```javascript
// hardhat.config.js
module.exports = {
  networks: {
    testnet: {
      url: process.env.VECHAIN_TESTNET_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 39
    },
    mainnet: {
      url: process.env.VECHAIN_MAINNET_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1
    }
  }
}
```

## 🔒 Post-Deployment Security

### 1. Access Control Setup
```bash
# Set up roles and permissions
npx hardhat run scripts/setup-access-control.js --network mainnet
```

### 2. Oracle Configuration
```bash
# Configure death verification oracles
npx hardhat run scripts/setup-oracles.js --network mainnet
```

### 3. Emergency Procedures
```bash
# Set up emergency pause functionality
npx hardhat run scripts/setup-emergency.js --network mainnet
```

## 📈 Monitoring Setup

### 1. Event Monitoring
```bash
# Set up event listeners
npx hardhat run scripts/setup-monitoring.js --network mainnet
```

### 2. Performance Tracking
```bash
# Configure performance metrics
npx hardhat run scripts/setup-metrics.js --network mainnet
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Insufficient Gas
```
Error: insufficient funds for gas
```
**Solution**: Ensure wallet has sufficient VET for deployment

#### 2. Network Connection Issues
```
Error: connection timeout
```
**Solution**: Check RPC URL and network connectivity

#### 3. Contract Verification Failures
```
Error: contract verification failed
```
**Solution**: Verify contract source code and constructor parameters

### Debug Commands
```bash
# Check network status
npx hardhat console --network testnet

# Verify contract bytecode
npx hardhat verify --network testnet <contract-address> <constructor-args>

# Check deployment status
npx hardhat run scripts/check-deployment.js --network testnet
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] All tests passing
- [ ] Security analysis completed
- [ ] Gas optimization verified
- [ ] Documentation updated
- [ ] Team review completed

### Testnet Deployment
- [ ] Testnet VET acquired
- [ ] Contracts deployed successfully
- [ ] Contract addresses recorded
- [ ] Functionality tested
- [ ] Integration tests passed

### Mainnet Deployment
- [ ] Security checklist completed
- [ ] Mainnet VET prepared
- [ ] Contracts deployed successfully
- [ ] Access control configured
- [ ] Oracles configured
- [ ] Emergency procedures set up
- [ ] Monitoring configured

### Post-Deployment
- [ ] Contract addresses documented
- [ ] Frontend updated with new addresses
- [ ] Team notified of deployment
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested

## 🔗 Useful Links

- [VeChain Testnet Faucet](https://faucet.vechain.org/)
- [VeChain Explorer](https://explore.vechain.org/)
- [VeChain Documentation](https://docs.vechain.org/)
- [Hardhat Documentation](https://hardhat.org/docs)

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review error logs
3. Contact the development team
4. Create an issue on GitHub

---

**Last Updated**: June 22, 2025  
**Version**: 1.0.0 