require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');

async function main() {
  console.log("🔍 Testing different derivation methods...");
  
  const MNEMONIC = process.env.MNEMONIC;
  const EXPECTED_ADDRESS = "0x3d32fE6e85066240f3018c9FC664db7967d2d313";
  
  console.log("Expected address:", EXPECTED_ADDRESS);
  console.log("Mnemonic:", MNEMONIC);
  
  // Initialize Web3 with Thorify
  const web3 = thorify(new Web3(), "https://testnet.veblocks.net");
  
  // Test different derivation methods
  console.log("\nTesting different derivation methods:");
  
  // Method 1: Standard derivation (m/44'/60'/0'/0/0)
  try {
    const hdNode1 = web3.eth.accounts.wallet.create(1, MNEMONIC);
    const account1 = hdNode1[0];
    console.log("Method 1 (index 0):", account1.address);
    if (account1.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
      console.log("✅ MATCH FOUND! Using index 0");
    }
  } catch (error) {
    console.log("Method 1 failed:", error.message);
  }
  
  // Method 2: Try different indices
  for (let i = 1; i <= 5; i++) {
    try {
      const hdNode = web3.eth.accounts.wallet.create(i + 1, MNEMONIC);
      const account = hdNode[i];
      console.log(`Method 2 (index ${i}):`, account.address);
      if (account.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
        console.log(`✅ MATCH FOUND! Using index ${i}`);
      }
    } catch (error) {
      console.log(`Method 2 (index ${i}) failed:`, error.message);
    }
  }
  
  // Method 3: Try with different derivation path
  try {
    const hdNode3 = web3.eth.accounts.wallet.create(1, MNEMONIC, "m/44'/60'/0'/0/1");
    const account3 = hdNode3[0];
    console.log("Method 3 (path m/44'/60'/0'/0/1):", account3.address);
    if (account3.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
      console.log("✅ MATCH FOUND! Using path m/44'/60'/0'/0/1");
    }
  } catch (error) {
    console.log("Method 3 failed:", error.message);
  }
  
  // Method 4: Try with different derivation path
  try {
    const hdNode4 = web3.eth.accounts.wallet.create(1, MNEMONIC, "m/44'/60'/0'/0/2");
    const account4 = hdNode4[0];
    console.log("Method 4 (path m/44'/60'/0'/0/2):", account4.address);
    if (account4.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
      console.log("✅ MATCH FOUND! Using path m/44'/60'/0'/0/2");
    }
  } catch (error) {
    console.log("Method 4 failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 