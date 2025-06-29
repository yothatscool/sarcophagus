require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');

async function main() {
  console.log("🔍 Testing VeWorld-compatible derivation methods...");
  
  const MNEMONIC = process.env.MNEMONIC;
  const EXPECTED_ADDRESS = "0x3d32fE6e85066240f3018c9FC664db7967d2d313";
  
  console.log("Expected address:", EXPECTED_ADDRESS);
  console.log("Mnemonic:", MNEMONIC);
  
  // Initialize Web3 with Thorify
  const web3 = thorify(new Web3(), "https://testnet.veblocks.net");
  
  // Test different HD wallet implementations that VeWorld might use
  console.log("\nTesting different HD wallet implementations:");
  
  // Method 1: Try with different account indices (VeWorld might use a different default)
  console.log("\nMethod 1: Different account indices:");
  for (let accountIndex = 0; accountIndex <= 10; accountIndex++) {
    try {
      // Try different derivation paths for each account
      const paths = [
        `m/44'/60'/${accountIndex}'/0/0`,  // Ethereum style
        `m/44'/818'/${accountIndex}'/0/0`, // VeChain style
        `m/44'/60'/0'/${accountIndex}/0`,  // Change path
        `m/44'/818'/0'/${accountIndex}/0`, // VeChain change path
      ];
      
      for (const path of paths) {
        try {
          const hdNode = web3.eth.accounts.wallet.create(1, MNEMONIC, path);
          const account = hdNode[0];
          console.log(`Account ${accountIndex}, Path ${path}:`, account.address);
          if (account.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
            console.log(`✅ MATCH FOUND! Account ${accountIndex}, Path ${path}`);
            return;
          }
        } catch (error) {
          // Silently continue
        }
      }
    } catch (error) {
      // Silently continue
    }
  }
  
  // Method 2: Try with different address indices
  console.log("\nMethod 2: Different address indices:");
  for (let addressIndex = 0; addressIndex <= 50; addressIndex++) {
    try {
      const paths = [
        `m/44'/60'/0'/0/${addressIndex}`,
        `m/44'/818'/0'/0/${addressIndex}`,
      ];
      
      for (const path of paths) {
        try {
          const hdNode = web3.eth.accounts.wallet.create(1, MNEMONIC, path);
          const account = hdNode[0];
          if (addressIndex % 10 === 0) {
            console.log(`Address index ${addressIndex}, Path ${path}:`, account.address);
          }
          if (account.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
            console.log(`✅ MATCH FOUND! Address index ${addressIndex}, Path ${path}`);
            return;
          }
        } catch (error) {
          // Silently continue
        }
      }
    } catch (error) {
      // Silently continue
    }
  }
  
  // Method 3: Try with different mnemonic processing
  console.log("\nMethod 3: Different mnemonic processing:");
  const mnemonicVariations = [
    MNEMONIC.trim(),
    MNEMONIC.replace(/\s+/g, ' '),
    MNEMONIC.replace(/\s+/g, '  '),
    MNEMONIC.toLowerCase(),
    MNEMONIC.toUpperCase(),
    MNEMONIC.split(' ').join(' '),
    MNEMONIC.split(' ').filter(word => word.length > 0).join(' ')
  ];
  
  for (let i = 0; i < mnemonicVariations.length; i++) {
    const variation = mnemonicVariations[i];
    if (variation === MNEMONIC) continue;
    
    try {
      const hdNode = web3.eth.accounts.wallet.create(1, variation);
      const account = hdNode[0];
      console.log(`Variation ${i + 1}:`, account.address);
      if (account.address.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
        console.log(`✅ MATCH FOUND! Using variation ${i + 1}`);
        return;
      }
    } catch (error) {
      console.log(`Variation ${i + 1} failed:`, error.message);
    }
  }
  
  console.log("\n❌ No match found with standard derivation methods.");
  console.log("\n💡 VeWorld might be using:");
  console.log("1. A completely custom derivation algorithm");
  console.log("2. A different HD wallet library");
  console.log("3. A different mnemonic format or processing");
  console.log("4. A different address generation method");
  
  console.log("\n🔧 Alternative solutions:");
  console.log("1. Use one of the generated addresses for deployment");
  console.log("2. Create a new wallet with a different mnemonic");
  console.log("3. Contact VeWorld support for clarification");
  console.log("4. Use a different wallet that supports private key export");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 