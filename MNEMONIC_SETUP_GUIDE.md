# Mnemonic Setup Guide for VeChain Deployment

## Overview
Since Sync2 and VeWorld don't allow private key export, this guide shows you how to use your mnemonic phrase for Hardhat deployment.

## Step 1: Get Your Mnemonic Phrase

### From Sync2:
1. Open Sync2 wallet
2. Go to Settings → Security → Backup Wallet
3. Write down your 12 or 24-word mnemonic phrase
4. **Keep this secure and never share it!**

### From VeWorld:
1. Open VeWorld wallet
2. Go to Settings → Security → Export Mnemonic
3. Write down your 12 or 24-word mnemonic phrase
4. **Keep this secure and never share it!**

## Step 2: Set Up Environment Variables

1. Copy your `.env.example` file to `.env`:
```bash
cp env.example .env
```

2. Edit your `.env` file and add your mnemonic:
```env
# Comment out or remove PRIVATE_KEY if you have it
# PRIVATE_KEY=your_private_key_here

# Add your mnemonic phrase (12 or 24 words)
MNEMONIC=your twelve or twenty four word mnemonic phrase here
```

**Example:**
```env
MNEMONIC=abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
```

## Step 3: Test Your Configuration

Run the mnemonic test script to verify everything is working:

```bash
npx hardhat run scripts/test-mnemonic.js --network vechainTestnet
```

This will:
- Verify your mnemonic is valid
- Show the derived wallet address
- Display the account balance
- Test different derivation paths

## Step 4: Deploy Contracts

Once your mnemonic is configured and tested, deploy your contracts:

```bash
npx hardhat run scripts/deploy-with-mnemonic.js --network vechainTestnet
```

## Security Best Practices

1. **Never commit your `.env` file to version control**
2. **Keep your mnemonic phrase secure and offline**
3. **Use a dedicated wallet for development/testing**
4. **Consider using a hardware wallet for mainnet deployments**

## Troubleshooting

### "Invalid mnemonic" error
- Check that your mnemonic phrase is exactly 12 or 24 words
- Ensure all words are from the BIP39 word list
- Verify there are no extra spaces or typos

### "Insufficient balance" error
- Fund your wallet with testnet VET and VTHO
- Use the VeChain testnet faucet: https://faucet.vechain.org/

### "Network connection" error
- Check your internet connection
- Verify the VeChain testnet RPC URL is accessible
- Try using a different RPC endpoint

## Derivation Path

The configuration uses the VeChain derivation path: `m/44'/818'/0'/0/0`

- `44'` - BIP44 standard
- `818'` - VeChain coin type
- `0'` - Account index
- `0` - Change (0 for external, 1 for internal)
- `0` - Address index

## Multiple Wallets

If you want to use different wallet addresses from the same mnemonic, you can modify the index in the `getPrivateKeyFromMnemonic` function:

```javascript
// Use first wallet (index 0)
const privateKey0 = getPrivateKeyFromMnemonic(MNEMONIC, 0);

// Use second wallet (index 1)
const privateKey1 = getPrivateKeyFromMnemonic(MNEMONIC, 1);
```

## Verification

After deployment, verify your contracts on the VeChain testnet explorer:
https://explore-testnet.vechain.org/

## Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your mnemonic phrase is correct
3. Ensure your wallet has sufficient balance
4. Check network connectivity 