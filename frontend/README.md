# Vereavement Protocol Frontend

A decentralized application for preserving digital legacies on the VeChain blockchain.

## Features

- **Ritual Vault Management**: Create and manage digital legacy vaults
- **Beneficiary System**: Add and manage beneficiaries with percentage-based allocations
- **Ritual Completion**: Perform various types of rituals to enhance your digital legacy
- **Memorial Preservation**: Store and preserve memorial messages
- **Transaction History**: Track all interactions with the protocol
- **Carbon Offset Tracking**: Monitor environmental impact
- **Longevity Scoring**: Track the permanence of your digital legacy

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- VeChain Thor Wallet (Sync2)
- Access to VeChain Thor network (testnet or mainnet)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vereavement-protocol.git
cd vereavement-contracts/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_VECHAIN_NODE=https://testnet.veblocks.net
NEXT_PUBLIC_NETWORK=testnet
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Smart Contract Integration

The frontend interacts with the following smart contracts:

- `Vereavement.sol`: Main protocol contract
- `RitualVault.sol`: Individual vault management
- `BeneficiaryManager.sol`: Beneficiary system
- `MemorialStorage.sol`: Memorial data storage

### Contract Functions

#### Ritual Vault
- `createRitualVault()`: Create a new vault
- `processSymbolicGrowth()`: Process growth calculations
- `getRitualValue()`: Get current ritual value

#### Beneficiary Management
- `addBeneficiary(address, uint256)`: Add a beneficiary with allocation
- `removeBeneficiary(address)`: Remove a beneficiary
- `getBeneficiaries()`: List all beneficiaries

#### Ritual System
- `completeRitual(string)`: Complete a ritual
- `getRitualHistory()`: Get ritual completion history
- `getLongevityScore()`: Get current longevity score

#### Memorial System
- `preserveMemorial(string)`: Store a memorial message
- `getMemorial(uint256)`: Retrieve a memorial

## Development

### Project Structure

```
frontend/
├── app/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utility functions
│   └── config/        # Configuration files
├── public/            # Static assets
└── tests/            # Test files
```

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test:watch
```

### Building for Production

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- All contract interactions require wallet signatures
- Beneficiary management includes percentage validation
- Memorial data is hashed and stored securely
- Error handling for all contract interactions

## License

This project is licensed under the MIT License - see the LICENSE file for details. 