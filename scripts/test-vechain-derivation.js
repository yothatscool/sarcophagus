require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');

async function main() {
  console.log("🔍 Testing VeChain-specific derivation methods...");
  
  const MNEMONIC = process.env.MNEMONIC;
  const EXPECTED_ADDRESS = "0x3d32fE6e85066240f3018c9FC664db7967d2d313";
  
  console.log("Expected address:", EXPECTED_ADDRESS);
  console.log("Mnemonic:", MNEMONIC);
  
  // Initialize Web3 with Thorify
  const web3 = thorify(new Web3(), "https://testnet.veblocks.net");
  
  // Test VeChain-specific derivation paths
  console.log("\nTesting VeChain-specific derivation paths:");
  const vechainPaths = [
    "m/44'/818'/0'/0/0",  // VeChain coin type 818
    "m/44'/818'/0'/0/1",
    "m/44'/818'/0'/0/2",
    "m/44'/818'/0'/0/3",
    "m/44'/818'/0'/0/4",
    "m/44'/818'/0'/0/5",
    "m/44'/818'/1'/0/0",
    "m/44'/818'/2'/0/0",
    "m/44'/818'/0'/1/0",
    "m/44'/818'/0'/2/0"
  ];
  
  for (const path of vechainPaths) {
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
  
  // Test more VeChain indices
  console.log("\nTesting more VeChain indices:");
  for (let i = 6; i <= 20; i++) {
    try {
      const path = `m/44'/818'/0'/0/${i}`;
      const hdNode = web3.eth.accounts.wallet.create(1, MNEMONIC, path);
      const account = hdNode[0];
      console.log(`Index ${i} (${path}):`, account.address);
      if (account.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
        console.log(`✅ MATCH FOUND! Using index ${i}`);
        break;
      }
    } catch (error) {
      console.log(`Index ${i} failed:`, error.message);
    }
  }
  
  // Test some other common derivation paths
  console.log("\nTesting other common derivation paths:");
  const otherPaths = [
    "m/44'/60'/0'/0/0",  // Standard Ethereum
    "m/44'/60'/0'/0/1",
    "m/44'/60'/0'/0/2",
    "m/44'/60'/0'/0/3",
    "m/44'/60'/0'/0/4",
    "m/44'/60'/0'/0/5",
    "m/44'/60'/0'/0/6",
    "m/44'/60'/0'/0/7",
    "m/44'/60'/0'/0/8",
    "m/44'/60'/0'/0/9",
    "m/44'/60'/0'/0/10"
  ];
  
  for (const path of otherPaths) {
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
  
  console.log("\n💡 If still no match, VeWorld might be using:");
  console.log("1. A custom derivation path");
  console.log("2. A different HD wallet implementation");
  console.log("3. A different mnemonic format");
  console.log("4. A different address generation algorithm");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 