# Sarcophagus Protocol - UI Integration Guide

## 🎯 Overview

This guide documents the comprehensive UI integration for the Sarcophagus Protocol, a blockchain-powered digital inheritance management system built on VeChain.

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React Context + Custom Hooks
- **Blockchain Integration**: Ethers.js v6
- **Testing**: Jest + Cypress

### Key Components

#### 1. MainDashboard.tsx
The primary dashboard component that provides:
- **Overview Tab**: Quick stats, recent activity, and quick actions
- **Vault Tab**: Vault management and fund deposits
- **Beneficiaries Tab**: Beneficiary management and setup
- **Rewards Tab**: OBOL and B3TR rewards tracking
- **Settings Tab**: Account verification and network settings

#### 2. Contract Integration
- **useSarcophagusContract Hook**: Main contract interaction hook
- **useWallet Hook**: Wallet connection and account management
- **useNotification Hook**: Toast notifications
- **useLoading Hook**: Loading state management

## 🚀 Getting Started

### Prerequisites
```bash
# Install dependencies
cd frontend
npm install

# Set up environment variables
cp env.local.example env.local
```

### Environment Configuration
```env
# .env.local
NEXT_PUBLIC_NETWORK=LOCAL  # LOCAL, TESTNET, MAINNET
NEXT_PUBLIC_RPC_URL=https://testnet.veblocks.net
NEXT_PUBLIC_CHAIN_ID=39
```

### Running the Application
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Testing
npm test
npm run cypress:open
```

## 📱 User Flows

### 1. Wallet Connection
```typescript
// Users connect their VeChain wallet
const { account, connect, disconnect } = useWallet()

// Connect wallet
await connect()

// Check connection status
if (account) {
  // User is connected
}
```

### 2. Identity Verification
```typescript
// Users must verify their identity before creating a vault
const { verifyUser } = useSarcophagusContract()

await verifyUser(
  userAddress,
  age,
  verificationHash // IPFS hash of verification documents
)
```

### 3. Vault Creation
```typescript
// Create inheritance vault with beneficiaries
const { createSarcophagus } = useSarcophagusContract()

await createSarcophagus(
  ['0x1234...', '0x5678...'], // Beneficiary addresses
  [60, 40] // Percentage splits
)
```

### 4. Fund Deposits
```typescript
// Deposit tokens into vault
const { depositTokens } = useSarcophagusContract()

await depositTokens(
  '100', // VTHO amount
  '50'   // B3TR amount
  // VET is sent via msg.value
)
```

### 5. Reward Claims
```typescript
// Claim OBOL rewards
const { claimObolRewards } = useSarcophagusContract()

await claimObolRewards()
```

## 🎨 UI Components

### Dashboard Layout
```tsx
<MainDashboard>
  <Header />           {/* Navigation and wallet info */}
  <TabNavigation />    {/* Overview, Vault, Beneficiaries, etc. */}
  <MainContent />      {/* Tab-specific content */}
</MainDashboard>
```

### Quick Stats Cards
```tsx
<StatsCard
  icon={<CurrencyDollarIcon />}
  label="Total Value"
  value="1,250.50 VET"
  color="green"
/>
```

### Action Buttons
```tsx
<ActionButton
  onClick={handleAction}
  variant="primary"
  loading={isLoading}
>
  Connect Wallet
</ActionButton>
```

## 🔧 Contract Integration

### Contract Addresses
```typescript
// Automatically loaded based on network
const addresses = getCurrentNetworkAddresses()

// Available contracts
addresses.SARCOPHAGUS    // Main vault contract
addresses.OBOL_TOKEN     // OBOL rewards token
addresses.B3TR_REWARDS   // B3TR rewards contract
addresses.DEATH_VERIFIER // Death verification oracle
```

### Contract Interactions
```typescript
// All contract calls are handled through the hook
const {
  userSarcophagus,    // Current user's vault data
  userBeneficiaries,  // Beneficiary list
  isUserVerified,     // Verification status
  hasSarcophagus,     // Vault existence
  // ... all contract methods
} = useSarcophagusContract()
```

## 📊 Data Flow

### 1. User Data Loading
```typescript
useEffect(() => {
  if (account) {
    loadUserData() // Loads vault, beneficiaries, rewards
  }
}, [account])
```

### 2. Real-time Updates
```typescript
// Contract events trigger UI updates
useContractEvents((eventName, data) => {
  switch (eventName) {
    case 'SarcophagusCreated':
      showNotification('Vault created successfully!', 'success')
      break
    case 'TokensDeposited':
      showNotification('Funds deposited!', 'success')
      break
    // ... other events
  }
})
```

### 3. State Management
```typescript
// Centralized state management
const { showNotification } = useNotification()
const { isLoading, setLoading } = useLoading()
const { account } = useWallet()
```

## 🎯 Key Features

### 1. Multi-Token Support
- **VET**: Native VeChain token
- **VTHO**: Energy token
- **B3TR**: Carbon offset token
- **GLO**: Legacy token
- **OBOL**: Rewards token

### 2. Beneficiary Management
- Multiple beneficiaries with percentage splits
- Survivorship requirements
- Automatic inheritance distribution

### 3. Reward System
- **OBOL Rewards**: Daily staking rewards (1% APY, 15% after 1 year)
- **B3TR Carbon Offset**: Rewards for early passing
- **B3TR Legacy**: Rewards for living to/beyond life expectancy

### 4. Security Features
- Multi-sig wallet integration
- Oracle-based death verification
- Circuit breaker mechanisms
- Access control and role management

## 🧪 Testing

### Unit Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm run test:coverage      # Coverage report
```

### E2E Tests
```bash
npm run cypress:open       # Open Cypress UI
npm run cypress:run        # Run headless
npm run e2e               # Full E2E suite
```

### Test Structure
```
frontend/app/components/__tests__/
├── MainDashboard.test.tsx
├── BeneficiaryModal.test.tsx
└── VaultManagement.test.tsx
```

## 🚀 Deployment

### Development
```bash
npm run dev
# Access at http://localhost:3000
```

### Production
```bash
npm run build
npm start
# Or deploy to Vercel/Netlify
```

### Environment Variables
```env
# Production
NEXT_PUBLIC_NETWORK=MAINNET
NEXT_PUBLIC_RPC_URL=https://mainnet.veblocks.net
NEXT_PUBLIC_CHAIN_ID=1
```

## 📱 Responsive Design

The UI is fully responsive with:
- **Mobile-first** design approach
- **Tailwind CSS** for responsive utilities
- **Flexible grid** layouts
- **Touch-friendly** interactions

### Breakpoints
```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

## 🔒 Security Considerations

### 1. Wallet Security
- Secure wallet connection handling
- Transaction confirmation flows
- Error handling for failed transactions

### 2. Data Validation
- Input validation on all forms
- Contract parameter validation
- Error boundaries for component failures

### 3. Privacy
- No sensitive data stored locally
- IPFS-based verification documents
- Minimal data collection

## 🎨 Customization

### Theming
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        }
      }
    }
  }
}
```

### Component Styling
```tsx
// Custom component with Tailwind
<button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
  Custom Button
</button>
```

## 📈 Performance Optimization

### 1. Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting
- Lazy loading of non-critical features

### 2. Caching
- Contract data caching
- User data persistence
- Optimistic updates

### 3. Bundle Optimization
- Tree shaking
- Minification
- Image optimization

## 🔄 Future Enhancements

### Planned Features
1. **Mobile App**: React Native version
2. **Advanced Analytics**: Detailed vault analytics
3. **NFT Integration**: NFT inheritance support
4. **Multi-chain**: Support for other blockchains
5. **Social Features**: Family vault sharing

### Technical Improvements
1. **Web3Modal**: Enhanced wallet connection
2. **GraphQL**: Optimized data fetching
3. **PWA**: Progressive web app features
4. **Offline Support**: Basic offline functionality

## 📞 Support

### Documentation
- [API Documentation](./docs/API_INTEGRATION_GUIDE.md)
- [Contract Documentation](./docs/CONTRACT_INTEGRATION.md)
- [Testing Guide](./docs/TESTING_GUIDE.md)

### Community
- GitHub Issues: Bug reports and feature requests
- Discord: Community discussions
- Telegram: Announcements and updates

---

**Built with ❤️ for the VeChain ecosystem** 