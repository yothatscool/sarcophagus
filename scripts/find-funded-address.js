require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');

async function main() {
  console.log("🔍 Finding which derivation index generates the funded address...");
  
  const MNEMONIC = process.env.MNEMONIC;
  const FUNDED_ADDRESS = "0x9027A597D2A7cBBc54Cd8905f94e8B8Bd4cFe3Fc";
  
  // Initialize Web3 with Thorify
  const web3 = thorify(new Web3(), "https://testnet.veblocks.net");
  
  console.log("Looking for address:", FUNDED_ADDRESS);
  console.log("Using mnemonic:", MNEMONIC);
  
  // Try different derivation methods
  console.log("\nTesting different derivation methods:");
  
  // Method 1: Standard derivation with different indices
  for (let i = 0; i < 50; i++) {
    try {
      const hdNode = web3.eth.accounts.wallet.create(i + 1, MNEMONIC);
      const account = hdNode[i];
      
      if (i % 10 === 0) {
        console.log(`Index ${i}: ${account.address}`);
      }
      
      if (account.address.toLowerCase() === FUNDED_ADDRESS.toLowerCase()) {
        console.log(`✅ FOUND! Index ${i} generates the funded address`);
        console.log(`Private key: ${account.privateKey}`);
        return;
      }
    } catch (error) {
      console.log(`Index ${i} failed: ${error.message}`);
    }
  }
  
  // Method 2: Try different derivation paths
  console.log("\nTesting different derivation paths:");
  const paths = [
    "m/44'/60'/0'/0/0",
    "m/44'/60'/0'/0/1",
    "m/44'/60'/0'/0/2",
    "m/44'/60'/0'/0/3",
    "m/44'/60'/0'/0/4",
    "m/44'/60'/0'/0/5",
    "m/44'/60'/0'/0/6",
    "m/44'/60'/0'/0/7",
    "m/44'/60'/0'/0/8",
    "m/44'/60'/0'/0/9",
    "m/44'/60'/0'/0/10",
    "m/44'/818'/0'/0/0",
    "m/44'/818'/0'/0/1",
    "m/44'/818'/0'/0/2",
    "m/44'/818'/0'/0/3",
    "m/44'/818'/0'/0/4",
    "m/44'/818'/0'/0/5"
  ];
  
  for (const path of paths) {
    try {
      const hdNode = web3.eth.accounts.wallet.create(1, MNEMONIC, path);
      const account = hdNode[0];
      console.log(`${path}: ${account.address}`);
      
      if (account.address.toLowerCase() === FUNDED_ADDRESS.toLowerCase()) {
        console.log(`✅ FOUND! Path ${path} generates the funded address`);
        console.log(`Private key: ${account.privateKey}`);
        return;
      }
    } catch (error) {
      console.log(`${path} failed: ${error.message}`);
    }
  }
  
  console.log("\n❌ Could not find the funded address in standard derivation");
  console.log("This suggests the address was created with a different method");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 