const { ethers } = require("hardhat");
const { hdkey } = require('ethereumjs-wallet');
const bip39 = require('bip39');
require("dotenv").config();

async function main() {
  console.log("🔍 Testing Mnemonic Configuration...\n");

  const { MNEMONIC, PRIVATE_KEY } = process.env;

  if (!MNEMONIC && !PRIVATE_KEY) {
    console.error("❌ Error: Neither MNEMONIC nor PRIVATE_KEY found in environment variables");
    console.log("Please add your mnemonic phrase to your .env file:");
    console.log("MNEMONIC=your twelve or twenty four word mnemonic phrase here");
    return;
  }

  if (MNEMONIC) {
    console.log("✅ MNEMONIC found in environment");
    
    // Function to get private key from mnemonic
    function getPrivateKeyFromMnemonic(mnemonic, index = 0) {
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const hdwallet = hdkey.fromMasterSeed(seed);
      const wallet = hdwallet.derivePath(`m/44'/818'/0'/0/${index}`).getWallet();
      return wallet.getPrivateKey().toString('hex');
    }

    // Get private key from mnemonic
    const privateKey = getPrivateKeyFromMnemonic(MNEMONIC);
    const wallet = new ethers.Wallet(privateKey);
    
    console.log(`📝 Mnemonic: ${MNEMONIC.substring(0, 20)}...`);
    console.log(`🔑 Derived Private Key: ${privateKey.substring(0, 10)}...`);
    console.log(`👤 Wallet Address: ${wallet.address}`);
    console.log(`💰 Balance: ${await ethers.provider.getBalance(wallet.address)} wei`);
    
    // Test with different derivation paths
    console.log("\n🔍 Testing different derivation paths:");
    for (let i = 0; i < 3; i++) {
      const pk = getPrivateKeyFromMnemonic(MNEMONIC, i);
      const w = new ethers.Wallet(pk);
      console.log(`  Path ${i}: ${w.address}`);
    }
    
  } else if (PRIVATE_KEY) {
    console.log("✅ PRIVATE_KEY found in environment");
    const wallet = new ethers.Wallet(PRIVATE_KEY);
    console.log(`👤 Wallet Address: ${wallet.address}`);
    console.log(`💰 Balance: ${await ethers.provider.getBalance(wallet.address)} wei`);
  }

  console.log("\n✅ Mnemonic configuration test completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 