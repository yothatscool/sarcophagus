require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');
const fs = require('fs');

async function main() {
  console.log("🔑 Generating stable private key...");
  
  const MNEMONIC = process.env.MNEMONIC;
  
  // Initialize Web3 with Thorify
  const web3 = thorify(new Web3(), "https://testnet.veblocks.net");
  
  // Generate the private key once
  const account = web3.eth.accounts.wallet.create(1, MNEMONIC)[0];
  
  console.log("Generated address:", account.address);
  console.log("Private key:", account.privateKey);
  
  // Save to a file for consistent use
  const keyData = {
    address: account.address,
    privateKey: account.privateKey,
    mnemonic: MNEMONIC,
    generatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync('stable-key.json', JSON.stringify(keyData, null, 2));
  
  console.log("\n✅ Stable key saved to: stable-key.json");
  console.log("Use this address for testnet VET:", account.address);
  console.log("\nTo deploy, run: node scripts/deploy-with-stable-key.js");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 