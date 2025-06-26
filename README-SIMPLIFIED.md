# Vereavement Protocol - Simplified Version

A streamlined digital inheritance protocol that locks tokens until death verification, with bonus rewards for sustainable living.

## Core Concept

Users lock their VET, VTHO, and B3TR tokens in a "sarcophagus" that only unlocks upon verified death. The protocol rewards users with B3TR bonuses based on their life choices:

- **Carbon Offset Bonus**: For those who pass before life expectancy (sustainable living)
- **Legacy Bonus**: For those who exceed life expectancy (healthy choices)

## Key Features

### 🔒 Token Locking
- Lock VET, VTHO, and B3TR tokens permanently until death
- Add more tokens at any time (also permanently locked)
- No withdrawal mechanism - tokens are truly locked

### 🏥 Death Verification
- Official death certificate verification through oracles
- Multi-signature verification system
- IPFS storage of verification documents

### 🎁 Bonus System
- **Carbon Offset Bonus**: 10% B3TR per year saved by dying before life expectancy (max 20 years)
- **Legacy Bonus**: 5% base + 2% per year in system + 1% per 1000 VET deposited (max 50%)
- **Grace Period**: No bonus if death occurs within 5 years of life expectancy (standard inheritance)

### 🛡️ Anti-Farming Measures
- KYC verification required before creating sarcophagus
- Rate limiting on deposits (1M VET equivalent per day)
- Minimum deposit requirements (100 VET)
- Oracle-based death verification

## Smart Contracts

### Sarcophagus.sol
Main contract handling:
- Token deposits and locking
- Beneficiary designation
- Death verification coordination
- Inheritance distribution

### DeathVerifier.sol
Handles:
- Death verification with oracle signatures
- Bonus calculations
- Proof validation and storage

## User Flow

1. **Verification**: User completes KYC verification
2. **Creation**: User creates sarcophagus and designates beneficiary
3. **Deposits**: User deposits tokens (permanently locked)
4. **Death**: Oracle verifies death with official documents
5. **Bonus**: System calculates and adds B3TR bonus
6. **Claim**: Beneficiary claims all tokens

## Security Features

- **Reentrancy Protection**: All external calls protected
- **Access Control**: Role-based permissions
- **Pausable**: Emergency pause functionality
- **Rate Limiting**: Prevents abuse and farming
- **Oracle Verification**: Multi-signature death verification

## Anti-Farming Measures

1. **KYC Verification**: Required before participation
2. **Rate Limiting**: 1M VET equivalent per day maximum
3. **Minimum Deposits**: 100 VET minimum per deposit
4. **Oracle Verification**: Official death certificates required
5. **Proof Validation**: Unique proof hashes prevent reuse

## Bonus Calculation Examples

### Carbon Offset Bonus (Early Death)
- Life Expectancy: 80 years
- Actual Death: 65 years (15 years early, 10 years outside grace period)
- Bonus: 10% × 10 years = 100% of B3TR tokens
- Example: 1000 B3TR → 2000 B3TR (+1000 B3TR bonus)

### Legacy Bonus (Longevity + Participation)
- Life Expectancy: 80 years
- Actual Death: 90 years (10 years late, 5 years outside grace period)
- Years in System: 15 years
- Total Deposits: 5000 VET equivalent
- Bonus: 5% base + (15 × 2%) + (5 × 1%) = 40% of B3TR tokens
- Example: 1000 B3TR → 1400 B3TR (+400 B3TR bonus)

### Standard Inheritance (No Bonus)
- Life Expectancy: 80 years
- Actual Death: 77 years (within 5-year grace period)
- Bonus: 0% (standard inheritance)
- Example: 1000 B3TR → 1000 B3TR (no bonus)

## Deployment

```bash
# Deploy contracts
npx hardhat run scripts/deploy-simplified.js --network <network>

# Run tests
npx hardhat test test/Sarcophagus.test.js
```

## Contract Addresses

After deployment, you'll need:
- DeathVerifier contract address
- Sarcophagus contract address
- B3TR token contract address

## Roles

- **DEFAULT_ADMIN_ROLE**: Can pause/unpause, manage roles
- **VERIFIER_ROLE**: Can verify user KYC
- **ORACLE_ROLE**: Can verify deaths and calculate bonuses

## Gas Optimization

- Custom errors instead of revert strings
- Packed structs for storage efficiency
- Batch operations where possible
- Minimal external calls

This simplified version focuses on the core value proposition while maintaining security and preventing abuse. 