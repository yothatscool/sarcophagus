# 🏺 Sarcophagus Protocol

**A revolutionary digital inheritance platform on VeChain that combines secure asset inheritance with environmental impact rewards and earning opportunities on locked assets.**

[![VeChain](https://img.shields.io/badge/VeChain-Platform-blue)](https://vechain.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-green)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Framework-yellow)](https://hardhat.org/)
[![Security](https://img.shields.io/badge/Security-Audited-brightgreen)](security-reports/comprehensive-security-report.md)

## 🎯 **Live Demo & Progress**

### **🚀 Demo Links**
- **Frontend Demo**: [Coming Soon - Deploying for Grant Application]
- **Smart Contracts**: [View on GitHub](https://github.com/your-username/sarcophagus-protocol)
- **Test Coverage**: 74/74 tests passing ✅
- **Security Audit**: Complete ✅

### **📱 Screenshots**
- [Vault Management Interface](docs/screenshots/vault-management.png)
- [NFT Locking Dashboard](docs/screenshots/nft-dashboard.png)
- [Environmental Rewards System](docs/screenshots/rewards-system.png)

## 🎯 Overview

Sarcophagus Protocol enables users to create secure digital inheritance vaults while earning rewards for environmental impact, healthy lifestyle choices, and long-term asset locking. The platform uses innovative dual-token economics:

- **OBOL**: Rewards for long-term participation, vault creation, and locked assets (100M total supply)
- **B3TR**: Environmental impact rewards for carbon savings and healthy longevity (external supply)

### **🌟 Key Innovations**
- **Secure Digital Inheritance**: Multi-signature vaults for all digital assets
- **Environmental Impact Rewards**: Earn B3TR for carbon offset and longevity
- **Asset Earning System**: OBOL rewards on all locked tokens and NFTs
- **VeChain Integration**: Built specifically for VeChain's efficiency and sustainability
- **NFT Inheritance**: Advanced NFT locking with beneficiary assignment

## 🏗️ Architecture

### Core Contracts

- **Sarcophagus.sol** (14.378 KiB) - Main vault contract for asset storage, inheritance management, and NFT locking
- **OBOL.sol** (8.014 KiB) - Reward token with weighted average staking rates
- **DeathVerifier.sol** (5.189 KiB) - Oracle-based death verification with weighted bonus calculations
- **B3TRRewards.sol** (4.241 KiB) - Environmental impact rewards system
- **MultiSigWallet.sol** (8.127 KiB) - Multi-signature wallet for enhanced security

### **🖼️ NFT Integration**
- **Whitelist System**: Curated NFT collections for quality control
- **Value Caps**: Maximum VET-equivalent values per NFT
- **Beneficiary Assignment**: Direct NFT-to-beneficiary mapping
- **OBOL Rewards**: NFTs earn OBOL based on VET-equivalent value
- **Inheritance Transfer**: Automatic NFT transfer to assigned beneficiaries

## 🌱 **B3TR Environmental Rewards**

### **B3TR Tokenomics**
- **Supply**: DAO-controlled allocations from Vebetter DAO
- **Allocation**: Varies based on DAO voting and available funding
- **Purpose**: Environmental impact rewards for inheritance planning
- **Earning**: Only upon inheritance claim

### **B3TR Earning Mechanisms**

#### **1. Carbon Offset Rewards (Early Death)**
- **Rate**: 5% of inheritance value per year of early death (adjustable)
- **Cap**: Maximum 30 years of carbon offset
- **Example**: Die 10 years early = 50% of inheritance value in B3TR

#### **2. Legacy Bonus (Living to Expectancy)**
- **Base Bonus**: 3% of inheritance value for living to expectancy (adjustable)
- **Additional Bonus**: +0.5% per year beyond expectancy (adjustable, uncapped!)
- **Example**: Live 5 years beyond expectancy = 5.5% of inheritance value in B3TR

### **DAO Funding Management**
- **Allocation Periods**: DAO allocates B3TR in periodic batches
- **Rate Adjustment**: Rates automatically adjust based on funding availability
- **Usage Tracking**: Real-time monitoring of allocation usage
- **Funding Protection**: Rewards reduced if insufficient funding available

## 📊 Performance Metrics

### Gas Usage (Optimized)
```
Contract Deployment:
- Sarcophagus: 3,314,767 gas (11% of block limit)
- OBOL: 1,940,416 gas (6.5% of block limit)
- DeathVerifier: 1,159,236 gas (3.9% of block limit)

Key Functions:
- createSarcophagus: 159,376 - 207,004 gas
- lockNFT: 89,234 - 156,789 gas
- verifyUser: 116,984 gas (average)
- grantRole: 29,121 - 51,303 gas
- approve: 45,987 gas (average)
```

### Security Analysis Results
- ✅ **74/74 security tests passed**
- ✅ **Reentrancy protection** properly implemented
- ✅ **Access control** mechanisms functioning
- ✅ **OpenZeppelin v5 compatibility** achieved
- ✅ **No critical vulnerabilities** found
- ✅ **NFT security** validated

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Hardhat

### Installation
```bash
git clone <repository-url>
cd sarcophagus-protocol
npm install
```

### Compilation
```bash
npx hardhat compile
```

### Testing
```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run security tests
npx hardhat test test/security-audit.test.js

# Run NFT tests
npx hardhat test test/nft-integration-test.js
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Deployment
```bash
# Deploy to testnet
npx hardhat run scripts/deploy-testnet.js --network vechain_testnet

# Update frontend config after deployment
node scripts/update-frontend-config.js

# Verify deployment
npx hardhat run scripts/verify-deployment.js --network vechain_testnet

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet
```

## 🔒 Security

### Security Analysis
The protocol has undergone comprehensive security analysis:

- **Static Analysis**: Slither analysis completed
- **Security Tests**: 74/74 tests passing
- **Gas Optimization**: All contracts optimized for efficiency
- **Access Control**: Role-based security implemented
- **NFT Security**: Whitelist and value cap protection

### Security Report
See `security-reports/comprehensive-security-report.md` for detailed analysis.

## 📚 Documentation

- [Security Analysis Report](security-reports/comprehensive-security-report.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [NFT Integration Guide](docs/NFT_INTEGRATION.md)

## 🛠️ Development

### Project Structure
```
├── contracts/           # Smart contracts
│   ├── Sarcophagus.sol  # Main vault contract with NFT support
│   ├── OBOL.sol         # Reward token
│   ├── DeathVerifier.sol # Death verification
│   └── interfaces/      # Contract interfaces
├── test/               # Test files
│   ├── Sarcophagus.test.js
│   ├── nft-integration-test.js
│   └── security-audit.test.js
├── scripts/            # Deployment scripts
├── docs/               # Documentation
├── security-reports/   # Security analysis reports
└── frontend/           # Frontend application
    ├── app/
    │   ├── components/ # React components
    │   ├── hooks/      # Custom hooks
    │   └── config/     # Configuration
    └── cypress/        # E2E tests
```

### Key Features
- **Digital Inheritance**: Secure vault creation and management
- **NFT Integration**: Lock NFTs with beneficiary assignment
- **Oracle Verification**: Trusted death verification system
- **Weighted Average Rewards**: OBOL token rewards (100M supply, 95M for rewards)
- **Environmental Impact**: B3TR rewards for carbon savings and longevity
- **Multi-signature**: Enhanced security for critical operations
- **Access Control**: Role-based permissions and security

## 🔧 Configuration

### Environment Variables
```bash
# Required for deployment
PRIVATE_KEY=your_private_key
VECHAIN_RPC_URL=your_rpc_url

# Optional for gas reporting
REPORT_GAS=true
```

### Network Configuration
The protocol supports:
- **Testnet**: VeChain testnet for development
- **Mainnet**: VeChain mainnet for production

## 📈 Monitoring

### On-chain Monitoring
- Contract events and state changes
- Gas usage optimization
- Security incident detection
- NFT locking/unlocking events

### Performance Metrics
- Transaction success rates
- Gas cost optimization
- User adoption metrics
- NFT collection participation

## 🌟 **Grant Application Highlights**

### **Innovation**
- First NFT inheritance protocol on VeChain
- Environmental impact rewards system
- Multi-signature security for digital assets

### **Technical Excellence**
- Complete smart contract implementation
- Professional frontend with enhanced UX
- Comprehensive security audit
- 74/74 tests passing

### **Environmental Impact**
- Carbon offset rewards for early death
- Longevity bonuses for healthy living
- Integration with Vebetter DAO sustainability goals

### **VeChain Ecosystem Value**
- Built specifically for VeChain efficiency
- Leverages VeChain's low gas costs
- Integrates with existing VeChain infrastructure

---

**Ready for VeBetter DAO Grant Application** 🚀

## 🏦 Time-Locked Withdrawal System

The Sarcophagus protocol implements a sophisticated time-locked withdrawal system to ensure commitment and prevent gaming:

### Withdrawal Timeline
- **Years 0-7**: No withdrawals allowed (irrevocable period)
- **Years 7-15**: Emergency withdrawal only (90% penalty)
- **Years 15+**: Full withdrawal options available

### Withdrawal Options
1. **Partial Withdrawal** (after 15 years)
   - Up to 30% of funds
   - 35% penalty
   - Flexible percentage selection (10%, 20%, 30%)

2. **Full Withdrawal** (after 15 years)
   - 100% of funds
   - 20% penalty
   - Complete vault closure

3. **Emergency Withdrawal** (after 7 years)
   - 100% of funds
   - 90% penalty
   - Requires emergency reason
   - Only for true emergencies

### Penalty System
- All penalties are collected by the protocol
- Penalties discourage premature withdrawals
- Emergency penalties prevent gaming of the system

## ⚠️ Comprehensive Warning System

The Sarcophagus protocol implements a **multi-layered warning system** to ensure users understand the serious, irrevocable nature of inheritance vaults:

### Warning Layers
1. **Global Warning Banner** - Constant reminder on all pages
2. **Vault Creation Warnings** - 5-step confirmation process with checkboxes
3. **Deposit Warnings** - Pre-deposit confirmation with penalty reminders
4. **Withdrawal Warnings** - Timeline and penalty displays with severe warnings

### Key Warning Elements
- **🔒 Irrevocable Commitment** - 7-year complete lock
- **⏰ Severe Time Lock** - No access for 7 years, penalties after
- **💀 Death-Triggered Only** - Funds only released upon verified death
- **💸 Severe Penalties** - 20-90% penalties for withdrawals
- **⚖️ Legal Implications** - Encourages professional consultation

### User Protection
- **Explicit consent** required via checkboxes
- **Clear language** with no legal jargon
- **Professional advice** encouraged
- **Documentation** of all warnings maintained

## ⚖️ Comprehensive Legal Disclosure System

The Sarcophagus protocol implements a **legally binding disclosure system** to ensure regulatory compliance and user protection:

### Legal Disclosure Categories
1. **Terms of Service Agreement** - Irrevocable commitment and penalty structure
2. **Privacy Policy & Data Handling** - Public blockchain and data retention
3. **Comprehensive Risk Disclosure** - All material risks and potential losses
4. **Legal Disclaimer & Professional Advice** - Encourages legal consultation
5. **Tax Implications & Responsibilities** - User tax obligations and responsibilities

### Legal Protection Features
- **Explicit consent** required for each legal category
- **Professional consultation** strongly encouraged
- **Clear language** with plain English explanations
- **Permanent documentation** of user acceptance
- **Regulatory compliance** with applicable laws

### User Consent Management
- **Pre-use requirement** - Must accept all terms before using protocol
- **Individual checkboxes** - Each category requires separate consent
- **Timestamp recording** - Permanent record of acceptance date/time
- **Wallet-linked storage** - User-specific acceptance records

---

**Sarcophagus Protocol** - Secure Digital Inheritance with Environmental Impact

## Tokenomics

### OBOL Token (Inheritance Rewards)
- **Total Supply**: 100,000,000 OBOL
- **Initial Vesting**: 5,000,000 OBOL (5%) - Team/DAO controlled
- **Reward Pool**: 95,000,000 OBOL (95%) - For inheritance rewards
- **Earning Mechanics**:
  - Initial bonus: 5% of deposit value
  - Daily rewards: 0.1% daily rate
  - Long-term bonus: 0.15% daily rate after 1 year
- **Inheritance Distribution**: 
  - **Important**: Users must explicitly lock earned OBOL tokens in their vault using `lockObolTokens()`
  - Only locked OBOL tokens are distributed to beneficiaries upon inheritance
  - Users can choose to lock all, some, or none of their earned OBOL
  - Users can withdraw earned OBOL to their VeWorld wallet anytime
- **Supply Management**: Daily caps and rate decay ensure decades of sustainable distribution

### B3TR Token (Environmental Rewards)
- **Total Supply**: 100,000,000 B3TR
- **DAO-Controlled**: All allocations managed by community governance
- **Reward Categories**: Environmental awareness, protocol participation, emergency relief
- **Sustainability**: Rate adjustments and funding limits prevent rapid exhaustion