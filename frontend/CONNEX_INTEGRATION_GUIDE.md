# 🔗 Connex Integration Guide for Sarcophagus Protocol

## Overview
This guide shows how to integrate the Sarcophagus Protocol frontend with VeChain's Connex framework for seamless dApp interaction.

## Prerequisites
1. **Connex** library installed
2. **VeChainThor Wallet** or **Sync2** for user wallet connection
3. **Deployed contract addresses** from VeChain deployment

## 📦 Installation

```bash
npm install connex
```

## 🔧 Basic Setup

### 1. Initialize Connex

```typescript
import Connex from 'connex'

// Initialize Connex for testnet
const connex = new Connex({
  node: 'https://testnet.veblocks.net',
  network: 'test'
})

// For mainnet
// const connex = new Connex({
//   node: 'https://mainnet.veblocks.net', 
//   network: 'main'
// })
```

### 2. Wallet Connection

```typescript
// Check if wallet is connected
const isConnected = connex.thor.account.isConnected()

// Request wallet connection
async function connectWallet() {
  try {
    await connex.thor.account.connect()
    const account = connex.thor.account
    console.log('Connected wallet:', account.address)
    return account.address
  } catch (error) {
    console.error('Wallet connection failed:', error)
    throw error
  }
}
```

## 🏗️ Contract Integration

### 1. Contract Instance Setup

```typescript
// Contract addresses (replace with deployed addresses)
const CONTRACT_ADDRESSES = {
  sarcophagus: '0x...',
  obol: '0x...',
  b3trRewards: '0x...',
  deathVerifier: '0x...',
  multiSig: '0x...'
}

// Contract ABIs (import from artifacts)
import sarcophagusABI from '../artifacts/contracts/Sarcophagus.sol/Sarcophagus.json'
import obolABI from '../artifacts/contracts/OBOL.sol/OBOL.json'
import b3trRewardsABI from '../artifacts/contracts/B3TRRewards.sol/B3TRRewards.json'

// Create contract instances
const sarcophagusContract = connex.thor.account(CONTRACT_ADDRESSES.sarcophagus)
const obolContract = connex.thor.account(CONTRACT_ADDRESSES.obol)
const b3trRewardsContract = connex.thor.account(CONTRACT_ADDRESSES.b3trRewards)
```

### 2. Contract Interactions

#### Reading Contract Data

```typescript
// Read vault data
async function getVaultData(vaultId: string) {
  try {
    const result = await connex.thor
      .account(CONTRACT_ADDRESSES.sarcophagus)
      .method(sarcophagusABI.abi.find(m => m.name === 'getVault'))
      .call(vaultId)
    
    return result.decoded[0]
  } catch (error) {
    console.error('Error reading vault data:', error)
    throw error
  }
}

// Read user's vaults
async function getUserVaults(userAddress: string) {
  try {
    const result = await connex.thor
      .account(CONTRACT_ADDRESSES.sarcophagus)
      .method(sarcophagusABI.abi.find(m => m.name === 'getUserVaults'))
      .call(userAddress)
    
    return result.decoded[0]
  } catch (error) {
    console.error('Error reading user vaults:', error)
    throw error
  }
}
```

#### Writing Contract Data

```typescript
// Create a new vault
async function createVault(
  beneficiaryAddress: string,
  lockDuration: number,
  vetAmount: string,
  vthoAmount: string,
  b3trAmount: string,
  gloAmount: string,
  obolAmount: string
) {
  try {
    const clause = connex.thor
      .account(CONTRACT_ADDRESSES.sarcophagus)
      .method(sarcophagusABI.abi.find(m => m.name === 'createVault'))
      .value([
        beneficiaryAddress,
        lockDuration,
        vetAmount,
        vthoAmount,
        b3trAmount,
        gloAmount,
        obolAmount
      ])

    const result = await connex.thor
      .signer()
      .sign(clause)
      .comment('Create Sarcophagus Vault')

    console.log('Transaction sent:', result.txid)
    return result.txid
  } catch (error) {
    console.error('Error creating vault:', error)
    throw error
  }
}

// Claim inheritance
async function claimInheritance(vaultId: string) {
  try {
    const clause = connex.thor
      .account(CONTRACT_ADDRESSES.sarcophagus)
      .method(sarcophagusABI.abi.find(m => m.name === 'claimInheritance'))
      .value([vaultId])

    const result = await connex.thor
      .signer()
      .sign(clause)
      .comment('Claim Inheritance')

    console.log('Transaction sent:', result.txid)
    return result.txid
  } catch (error) {
    console.error('Error claiming inheritance:', error)
    throw error
  }
}
```

## 🎯 Frontend Integration Examples

### 1. React Hook for Contract Interaction

```typescript
// hooks/useSarcophagusContract.ts
import { useState, useEffect } from 'react'
import Connex from 'connex'

export function useSarcophagusContract() {
  const [connex, setConnex] = useState<Connex | null>(null)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initConnex = new Connex({
      node: 'https://testnet.veblocks.net',
      network: 'test'
    })
    setConnex(initConnex)
  }, [])

  const connectWallet = async () => {
    if (!connex) return
    
    try {
      setLoading(true)
      await connex.thor.account.connect()
      const address = connex.thor.account.address
      setUserAddress(address)
      return address
    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createVault = async (vaultData: any) => {
    if (!connex || !userAddress) throw new Error('Wallet not connected')
    
    try {
      setLoading(true)
      // Implementation here
    } catch (error) {
      console.error('Error creating vault:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    connex,
    userAddress,
    loading,
    connectWallet,
    createVault
  }
}
```

### 2. Component Integration

```typescript
// components/CreateVault.tsx
import { useSarcophagusContract } from '../hooks/useSarcophagusContract'

export function CreateVault() {
  const { userAddress, loading, createVault } = useSarcophagusContract()
  const [formData, setFormData] = useState({
    beneficiary: '',
    duration: '',
    vetAmount: '',
    vthoAmount: '',
    b3trAmount: '',
    gloAmount: '',
    obolAmount: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const txId = await createVault(formData)
      console.log('Vault created:', txId)
      // Show success message
    } catch (error) {
      console.error('Failed to create vault:', error)
      // Show error message
    }
  }

  if (!userAddress) {
    return <div>Please connect your wallet first</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Vault'}
      </button>
    </form>
  )
}
```

## 🔍 Event Listening

```typescript
// Listen for contract events
async function listenToEvents() {
  const filter = {
    range: {
      unit: 'block',
      from: 0,
      to: 'best'
    },
    criteriaSet: [{
      address: CONTRACT_ADDRESSES.sarcophagus,
      topic0: '0x...' // Event signature
    }]
  }

  const events = await connex.thor.filter(filter).apply()
  
  events.forEach(event => {
    console.log('Event:', event)
    // Handle event data
  })
}
```

## 🚀 Transaction Monitoring

```typescript
// Monitor transaction status
async function monitorTransaction(txId: string) {
  const transaction = connex.thor.transaction(txId)
  
  // Wait for transaction to be mined
  const receipt = await transaction.getReceipt()
  
  if (receipt) {
    console.log('Transaction confirmed:', receipt)
    return receipt
  } else {
    console.log('Transaction pending...')
    // Retry after delay
    setTimeout(() => monitorTransaction(txId), 5000)
  }
}
```

## 📱 Mobile Wallet Support

```typescript
// Check if mobile wallet is available
function isMobileWalletAvailable() {
  return typeof window !== 'undefined' && 
         (window.vechain || window.sync2)
}

// Connect to mobile wallet
async function connectMobileWallet() {
  if (window.vechain) {
    // VeChainThor Wallet
    return await window.vechain.request({ method: 'eth_requestAccounts' })
  } else if (window.sync2) {
    // Sync2 Wallet
    return await window.sync2.request({ method: 'eth_requestAccounts' })
  }
}
```

## 🔒 Security Considerations

1. **Always validate user input** before sending to contracts
2. **Use proper error handling** for all contract interactions
3. **Implement transaction confirmation** before updating UI
4. **Validate contract addresses** before interactions
5. **Use proper gas estimation** for transactions

## 📚 Additional Resources

- [Connex Documentation](https://docs.vechain.org/connex/)
- [VeChain Developer Portal](https://developer.vechain.org/)
- [VeChain Forum](https://forum.vechain.org/)
- [VeChain Discord](https://discord.gg/vechain)

## 🎯 Next Steps

1. Replace placeholder contract addresses with deployed addresses
2. Test all contract interactions on testnet
3. Implement proper error handling and user feedback
4. Add transaction monitoring and status updates
5. Test with different wallet types (Sync2, VeWorld, mobile)
6. Deploy to mainnet when ready 