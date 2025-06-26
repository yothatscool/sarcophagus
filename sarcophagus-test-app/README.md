# 🧪 Sarcophagus Protocol Test App

A comprehensive testing and development environment for the Sarcophagus Protocol - Digital Inheritance on VeChain.

## 🎯 Purpose

This test app provides developers with:
- **Contract Testing Interface**: Direct interaction with all smart contracts
- **Function Testing**: Test all protocol functions in a controlled environment
- **Gas Optimization**: Monitor gas usage for all operations
- **Security Testing**: Test edge cases and security scenarios
- **Integration Testing**: Verify frontend-backend integration

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Ethers.js for VeChain integration
- **Build Tool**: Craco for custom webpack configuration
- **Testing**: Jest, React Testing Library

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
# VeChain RPC URLs
REACT_APP_VECHAIN_TESTNET_RPC=https://testnet.veblocks.net
REACT_APP_VECHAIN_MAINNET_RPC=https://mainnet.veblocks.net

# Contract addresses (will be auto-updated after deployment)
REACT_APP_TESTNET_SARCOPHAGUS=0x...
REACT_APP_TESTNET_DEATH_VERIFIER=0x...
REACT_APP_TESTNET_OBOL=0x...
REACT_APP_TESTNET_B3TR_REWARDS=0x...
REACT_APP_TESTNET_MULTISIG=0x...
```

## 🚀 Development

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## 🧪 Testing Features

### Contract Testing
- **Deployment Testing**: Test contract deployment
- **Function Testing**: Test all contract functions
- **Event Testing**: Verify contract events
- **State Testing**: Check contract state changes

### Security Testing
- **Access Control**: Test role-based permissions
- **Input Validation**: Test parameter validation
- **Edge Cases**: Test boundary conditions
- **Reentrancy**: Test reentrancy protection

### Gas Testing
- **Gas Measurement**: Monitor gas usage
- **Optimization**: Identify gas optimization opportunities
- **Cost Analysis**: Calculate transaction costs
- **Batch Testing**: Test multiple operations

### Integration Testing
- **Frontend Integration**: Test UI-contract integration
- **Wallet Integration**: Test wallet connections
- **Network Integration**: Test different networks
- **Error Handling**: Test error scenarios

## 📱 Test Interface

### Contract Management
- **Deploy Contracts**: Deploy all protocol contracts
- **Initialize Contracts**: Set up contract parameters
- **Upgrade Contracts**: Test upgrade functionality
- **Verify Contracts**: Verify contract addresses

### User Testing
- **Create Users**: Test user registration
- **Verify Users**: Test age verification
- **Manage Users**: Test user management functions
- **User Permissions**: Test access control

### Vault Testing
- **Create Vaults**: Test vault creation
- **Manage Vaults**: Test vault management
- **Deposit Tokens**: Test token deposits
- **Withdraw Tokens**: Test token withdrawals

### Beneficiary Testing
- **Add Beneficiaries**: Test beneficiary addition
- **Remove Beneficiaries**: Test beneficiary removal
- **Update Percentages**: Test percentage updates
- **Beneficiary Limits**: Test maximum beneficiary limits

### Death Verification
- **Submit Death**: Test death verification submission
- **Verify Death**: Test oracle verification
- **Death Proof**: Test proof validation
- **Verification Limits**: Test verification constraints

### Inheritance Testing
- **Claim Inheritance**: Test inheritance claims
- **Distribution**: Test asset distribution
- **Multiple Claims**: Test multiple beneficiary claims
- **Claim Limits**: Test claim restrictions

### OBOL Rewards
- **Lock Tokens**: Test OBOL token locking
- **Earn Rewards**: Test reward accumulation
- **Claim Rewards**: Test reward claiming
- **Vesting**: Test token vesting

### B3TR Rewards
- **Carbon Offset**: Test carbon offset calculations
- **Legacy Bonus**: Test legacy bonus system
- **Grandfathering**: Test grandfathering benefits
- **Bonus Claims**: Test bonus claiming

## 🔒 Security Testing

### Access Control
- **Role Testing**: Test all roles and permissions
- **Admin Functions**: Test admin-only functions
- **Oracle Functions**: Test oracle-specific functions
- **User Functions**: Test user-specific functions

### Input Validation
- **Parameter Testing**: Test all function parameters
- **Boundary Testing**: Test parameter boundaries
- **Type Testing**: Test data type validation
- **Format Testing**: Test data format validation

### Error Handling
- **Error Scenarios**: Test all error conditions
- **Revert Testing**: Test contract reverts
- **Exception Handling**: Test exception scenarios
- **Error Messages**: Verify error messages

## 📊 Performance Testing

### Gas Optimization
- **Gas Measurement**: Measure gas usage for all functions
- **Optimization Analysis**: Identify optimization opportunities
- **Cost Comparison**: Compare costs across functions
- **Batch Optimization**: Test batch operation efficiency

### Transaction Testing
- **Transaction Speed**: Test transaction processing speed
- **Confirmation Time**: Test confirmation times
- **Network Congestion**: Test under high load
- **Failover Testing**: Test network failover scenarios

## 🚀 Deployment Testing

### Testnet Deployment
```bash
# Deploy to testnet
npx hardhat run scripts/deploy-testnet.js --network vechain_testnet

# Update test app config
node scripts/update-test-config.js

# Start test app
npm start
```

### Local Testing
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy-simplified.js --network localhost

# Start test app
npm start
```

## 📈 Monitoring

### Contract Monitoring
- **Event Logging**: Monitor all contract events
- **State Changes**: Track contract state changes
- **Function Calls**: Monitor function execution
- **Error Tracking**: Track errors and failures

### Performance Monitoring
- **Gas Usage**: Monitor gas consumption
- **Transaction Speed**: Track transaction times
- **Success Rates**: Monitor success rates
- **Error Rates**: Track error rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your test cases
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the docs folder
- **Issues**: Create an issue on GitHub
- **Testing**: Report test failures

---

**Ready for comprehensive testing!** 🧪
