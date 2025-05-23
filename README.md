# Vereavement Protocol

A decentralized protocol for digital inheritance and legacy preservation on VeChain.

## Contract Architecture

The protocol consists of the following smart contracts:

### Core Contracts

1. **Vereavement.sol**
   - Main contract that orchestrates the protocol
   - Handles vault creation and management
   - Manages beneficiary relationships
   - Coordinates with specialized contracts

2. **VereavementRitual.sol**
   - Base contract for ritual mechanics
   - Handles ritual power calculation
   - Manages ritual completion and rewards

3. **VereavementBase.sol**
   - Base contract with core functionality
   - Implements role-based access control
   - Provides security features and storage management

### Specialized Contracts

4. **AgeVerification.sol**
   - Handles age verification for users and beneficiaries
   - Manages authorized verifiers
   - Stores and validates age proofs

5. **TokenManager.sol**
   - Manages VIP-180 token support
   - Handles VTHO generation and distribution
   - Controls B3TR token functionality

6. **MilestoneManager.sol**
   - Manages milestone-based fund releases
   - Handles milestone verification
   - Tracks milestone achievements

### Libraries

7. **VereavementStorage.sol**
   - Defines storage structures
   - Provides storage access patterns
   - Optimizes gas usage

8. **VereavementShared.sol**
   - Shared utilities and constants
   - Common error definitions
   - Helper functions

9. **VereavementRitualLib.sol**
   - Ritual calculation utilities
   - Ritual power formulas
   - Ritual state management

## Features

- Digital inheritance management
- Multi-token support (VET, VTHO, B3TR)
- VeChain Name Service integration
- Age verification system
- Death confirmation system
- Beneficiary management
- Milestone-based fund releases
- Guardian system for underage beneficiaries
- Sustainability-based growth mechanics
- Environmental impact tracking

## Security Features

- Role-based access control
- Emergency pause functionality
- Rate limiting
- Reentrancy protection
- Oracle-based verification
- Challenge periods for death declarations

## Gas Optimizations

- Efficient storage patterns
- Minimal storage operations
- Batch processing capabilities
- Memory vs storage optimization
- Unchecked math where safe

## Development

### Prerequisites

- Node.js v14+
- npm or yarn
- VeChain Thor node

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vereavement-contracts.git
cd vereavement-contracts
```

2. Install dependencies:
```bash
npm install
```

3. Compile contracts:
```bash
npm run compile
```

4. Run tests:
```bash
npm test
```

### Deployment

1. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. Deploy contracts:
```bash
npm run deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License - see LICENSE file for details

## Contact

- Author: yothatscool
- GitHub: [your-github-profile]
- Email: [your-email]

## Testing

The project includes comprehensive test coverage across all contracts:

### Unit Tests
- `AgeVerification.test.js`: Tests age verification functionality and access control
- `TokenManager.test.js`: Tests token management operations and permissions
- `MilestoneManager.test.js`: Tests milestone creation, completion, and verification
- `VereavementAccess.test.js`: Tests the access control system and permissions

### Integration Tests
- `VereavementIntegration.test.js`: Tests cross-contract interactions and complete user journeys

### Test Coverage Areas

#### Access Control Tests
- Contract authorization and deauthorization
- Permission granting and revocation
- Role-based access control
- Cross-contract permission checks

#### Functional Tests
- Age verification and proof management
- Token minting, burning, and transfers
- Milestone creation and completion
- Event emission verification
- Error handling and input validation

#### Integration Tests
- Complete user journeys
- Cross-contract interactions
- Permission hierarchy
- Event propagation

### Running Tests

To run the test suite:

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/AgeVerification.test.js

# Generate coverage report
npx hardhat coverage
```

### Test Coverage Goals
- Maintain >95% line coverage
- Maintain >90% branch coverage
- All critical functions must have both positive and negative test cases
- All events must have emission tests
- All access control must have permission tests 