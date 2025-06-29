require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');

async function main() {
  console.log("🔍 Testing more derivation methods...");
  
  const MNEMONIC = process.env.MNEMONIC;
  const EXPECTED_ADDRESS = "0x3d32fE6e85066240f3018c9FC664db7967d2d313";
  
  console.log("Expected address:", EXPECTED_ADDRESS);
  console.log("Mnemonic:", MNEMONIC);
  
  // Initialize Web3 with Thorify
  const web3 = thorify(new Web3(), "https://testnet.veblocks.net");
  
  // Test more indices
  console.log("\nTesting more indices:");
  for (let i = 6; i <= 20; i++) {
    try {
      const hdNode = web3.eth.accounts.wallet.create(i + 1, MNEMONIC);
      const account = hdNode[i];
      console.log(`Index ${i}:`, account.address);
      if (account.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
        console.log(`✅ MATCH FOUND! Using index ${i}`);
        break;
      }
    } catch (error) {
      console.log(`Index ${i} failed:`, error.message);
    }
  }
  
  // Test different derivation paths
  console.log("\nTesting different derivation paths:");
  const paths = [
    "m/44'/60'/0'/0/0",
    "m/44'/60'/0'/0/1", 
    "m/44'/60'/0'/0/2",
    "m/44'/60'/0'/0/3",
    "m/44'/60'/0'/0/4",
    "m/44'/60'/0'/0/5",
    "m/44'/60'/1'/0/0",
    "m/44'/60'/2'/0/0",
    "m/44'/60'/0'/1/0",
    "m/44'/60'/0'/2/0"
  ];
  
  for (const path of paths) {
    try {
      const hdNode = web3.eth.accounts.wallet.create(1, MNEMONIC, path);
      const account = hdNode[0];
      console.log(`${path}:`, account.address);
      if (account.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
        console.log(`✅ MATCH FOUND! Using path ${path}`);
        break;
      }
    } catch (error) {
      console.log(`${path} failed:`, error.message);
    }
  }
  
  // Test if mnemonic might have extra spaces or different format
  console.log("\nTesting mnemonic format variations:");
  const mnemonicVariations = [
    MNEMONIC.trim(),
    MNEMONIC.replace(/\s+/g, ' '),
    MNEMONIC.replace(/\s+/g, '  '),
    MNEMONIC.toLowerCase(),
    MNEMONIC.toUpperCase()
  ];
  
  for (let i = 0; i < mnemonicVariations.length; i++) {
    const variation = mnemonicVariations[i];
    if (variation === MNEMONIC) continue; // Skip original
    
    try {
      const hdNode = web3.eth.accounts.wallet.create(1, variation);
      const account = hdNode[0];
      console.log(`Variation ${i + 1}:`, account.address);
      if (account.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
        console.log(`✅ MATCH FOUND! Using variation ${i + 1}`);
        break;
      }
    } catch (error) {
      console.log(`Variation ${i + 1} failed:`, error.message);
    }
  }
  
  console.log("\n💡 If no match found, the address might have been:");
  console.log("1. Generated from a different mnemonic");
  console.log("2. Imported from a private key");
  console.log("3. Generated with a custom derivation path");
  console.log("4. Created by a different wallet application");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 