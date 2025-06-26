# 🏺 Sarcophagus Protocol Frontend

A modern, responsive frontend for the Sarcophagus Protocol - Digital Inheritance on VeChain.

## 🚀 Features

- **Digital Inheritance Management**: Create and manage secure vaults for digital assets
- **Multi-Token Support**: VET, VTHO, B3TR, and OBOL token integration
- **Beneficiary Management**: Add and manage inheritance beneficiaries
- **Death Verification**: Oracle-based death verification system
- **Reward System**: OBOL token rewards for participation
- **Carbon Offset**: B3TR rewards for environmental impact
- **Multi-Signature Security**: Enhanced security for critical operations
- **Real-time Updates**: Live contract state monitoring

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Connex for VeChain integration
- **Wallet**: VeWorld/Sync2 via Connex
- **Testing**: Jest, Cypress, React Testing Library
- **State Management**: React Context + Hooks

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.local.example .env.local
# Edit .env.local with your configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# VeChain RPC URLs
NEXT_PUBLIC_VECHAIN_TESTNET_RPC=https://testnet.veblocks.net
NEXT_PUBLIC_VECHAIN_MAINNET_RPC=https://mainnet.veblocks.net

# Contract addresses (will be auto-updated after deployment)
NEXT_PUBLIC_TESTNET_SARCOPHAGUS=0x...
NEXT_PUBLIC_TESTNET_DEATH_VERIFIER=0x...
NEXT_PUBLIC_TESTNET_OBOL=0x...
NEXT_PUBLIC_TESTNET_B3TR_REWARDS=0x...
NEXT_PUBLIC_TESTNET_MULTISIG=0x...
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run e2e tests
npm run e2e

# Build for production
npm run build
```

## 🧪 Testing

### Unit Tests
```bash
npm test
npm run test:watch
npm run test:coverage
```

### E2E Tests
```bash
npm run cypress:open
npm run cypress:run
```

## 📱 Usage

### For Users
1. **Install VeWorld/Sync2**: Download and install a VeChain wallet
2. **Connect Wallet**: Use VeWorld or Sync2 wallet via Connex
3. **Switch to VeChain Testnet**: Ensure you're on Chain ID 39
4. **Create Vault**: Set up your digital inheritance
5. **Add Beneficiaries**: Specify who gets your assets
6. **Deposit Tokens**: Add VET, VTHO, B3TR to your vault
7. **Lock OBOL**: Earn rewards for participation

### For Developers
1. **Testnet Deployment**: Use `scripts/deploy-testnet.js`
2. **Frontend Integration**: Contract addresses auto-update
3. **Local Testing**: Use Hardhat local network
4. **Contract Interaction**: All functions available via Connex

## 🔗 Contract Integration

The frontend automatically integrates with deployed contracts via Connex:

- **Sarcophagus**: Main vault contract
- **DeathVerifier**: Oracle verification system
- **OBOL**: Reward token (100M supply)
- **B3TRRewards**: Bonus rewards system
- **MultiSigWallet**: Enhanced security

## 🎨 UI Components

- **Vault Management**: Create and manage vaults
- **Beneficiary Modal**: Add/remove beneficiaries
- **Token Deposits**: Deposit VET, VTHO, B3TR
- **OBOL Rewards**: Lock tokens and earn rewards
- **Death Verification**: Oracle verification interface
- **Inheritance Claims**: Claim inherited assets

## 🔒 Security

- **Access Control**: Role-based permissions
- **Multi-Signature**: Enhanced security
- **Input Validation**: Client-side validation
- **Error Handling**: Comprehensive error management
- **Gas Optimization**: Efficient contract calls

## 📊 Performance

- **Optimized Builds**: Next.js optimization
- **Code Splitting**: Automatic code splitting
- **Image Optimization**: Next.js image optimization
- **Caching**: Efficient caching strategies

## 🚀 Deployment

### Testnet
```bash
# Deploy contracts
npx hardhat run scripts/deploy-testnet.js --network vechain_testnet

# Update frontend config
node scripts/update-frontend-config.js

# Start frontend
npm run dev
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the docs folder
- **Issues**: Create an issue on GitHub
- **Security**: Report security issues privately

---

**Ready for testnet launch with VeWorld/Sync2!** 🎉 