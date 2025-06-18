# Vereavement Protocol Features

## Ritual System

The ritual system is a core component of the Vereavement Protocol that allows users to enhance their digital legacy through meaningful actions.

### Ritual Types

1. **Meditation Ritual**
   - A mindful practice to honor and remember loved ones
   - Increases ritual value by 10 points
   - No carbon offset impact
   - Enhances longevity score by 5 points

2. **Tree Planting**
   - Physical action with environmental impact
   - Increases ritual value by 15 points
   - Adds 100kg to carbon offset
   - Enhances longevity score by 10 points

3. **Story Sharing**
   - Preserves memories through written narratives
   - Increases ritual value by 20 points
   - No carbon offset impact
   - Enhances longevity score by 15 points

4. **Charitable Giving**
   - Supports causes aligned with the legacy
   - Increases ritual value by 25 points
   - Variable carbon offset based on charity
   - Enhances longevity score by 20 points

### Ritual Completion Process

1. Select ritual type from the modal
2. Complete required actions for the ritual
3. Submit transaction through VeChain wallet
4. Receive confirmation and updated metrics
5. View in transaction history

## Beneficiary Management

The beneficiary system ensures proper distribution of digital legacy assets.

### Features

- Add multiple beneficiaries with percentage allocations
- Total allocation must equal 100%
- Remove beneficiaries with automatic reallocation
- View complete beneficiary list with shares
- Transaction history for all beneficiary changes

### Validation Rules

1. Valid VeChain address required
2. Percentage between 1 and 100
3. Total allocation check
4. Duplicate address prevention
5. Minimum 1 beneficiary required

## Memorial Preservation

The memorial system provides permanent storage of memories and tributes.

### Storage System

- IPFS integration for decentralized storage
- Content hashing for integrity verification
- Permanent storage with redundancy
- Access control through smart contracts

### Memorial Types

1. **Text Memorials**
   - Written tributes and memories
   - Markdown formatting support
   - Maximum 10,000 characters

2. **Image Memorials**
   - Photo preservation
   - Supported formats: JPG, PNG
   - Maximum size: 10MB

3. **Audio Memorials**
   - Voice recordings and music
   - Supported formats: MP3, WAV
   - Maximum duration: 10 minutes

## Transaction History

Comprehensive tracking of all protocol interactions.

### Tracked Events

1. **Ritual Completion**
   - Timestamp
   - Ritual type
   - Impact metrics
   - Transaction hash

2. **Beneficiary Management**
   - Address changes
   - Allocation updates
   - Removal events
   - Transaction hash

3. **Memorial Preservation**
   - Content type
   - IPFS hash
   - Storage confirmation
   - Transaction hash

### History Features

- Filterable by event type
- Sortable by date
- Exportable records
- Detailed transaction info

## Metrics System

Real-time tracking of protocol impact and engagement.

### Ritual Value

- Cumulative score from all completed rituals
- Weighted by ritual type and frequency
- Historical trend analysis
- Achievement milestones

### Carbon Offset

- Environmental impact tracking
- Tree planting verification
- Offset certificates
- Impact visualization

### Longevity Score

- Legacy permanence metric
- Influenced by:
  - Ritual diversity
  - Beneficiary stability
  - Memorial preservation
  - Engagement frequency

## Security Features

Comprehensive security measures for protocol integrity.

### Smart Contract Security

- Multi-signature requirements
- Time-locked transactions
- Upgrade mechanisms
- Emergency pause functionality

### Access Control

- Role-based permissions
- Beneficiary verification
- Memorial access rules
- Admin functions

### Data Protection

- Encrypted storage
- Backup mechanisms
- Privacy controls
- Data integrity checks

## Integration Guidelines

### VeChain Wallet Integration

```typescript
// Initialize wallet connection
const initializeWallet = async () => {
  if (window.connex) {
    const address = await window.connex.vendor.sign('cert', {
      purpose: 'identification',
      payload: {
        type: 'text',
        content: 'Connect to Vereavement Protocol'
      }
    });
    return address;
  }
  throw new Error('VeChain wallet not found');
};

// Sign transaction
const signTransaction = async (method: string, params: any[]) => {
  const clause = {
    to: CONTRACT_ADDRESS,
    value: '0x0',
    data: contract.interface.encodeFunctionData(method, params)
  };
  return await window.connex.vendor.sign('tx', [clause]);
};
```

### IPFS Integration

```typescript
// Upload to IPFS
const uploadToIPFS = async (content: File | string) => {
  const formData = new FormData();
  formData.append('file', content);
  
  const response = await fetch('/api/ipfs/upload', {
    method: 'POST',
    body: formData
  });
  
  const { hash } = await response.json();
  return hash;
};

// Retrieve from IPFS
const getFromIPFS = async (hash: string) => {
  const response = await fetch(`/api/ipfs/${hash}`);
  return await response.json();
};
``` 