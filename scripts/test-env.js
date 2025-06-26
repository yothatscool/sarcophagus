require('dotenv').config();
const { ethers } = require("hardhat");

console.log('Testing .env configuration:');
console.log('VECHAIN_URL exists:', !!process.env.VECHAIN_URL);
console.log('MNEMONIC exists:', !!process.env.MNEMONIC);
console.log('File path:', require('path').resolve('.env'));

async function main() {
  console.log("Testing environment setup for VeChain testnet deployment...");

  try {
    // Check if we can connect to the network
    console.log("\n1. Testing network connection...");
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name);
    console.log("Chain ID:", network.chainId);

    // Check if we have a signer
    console.log("\n2. Testing wallet connection...");
    const [signer] = await ethers.getSigners();
    console.log("Wallet address:", signer.address);
    
    // Check balance
    const balance = await provider.getBalance(signer.address);
    console.log("VET balance:", ethers.formatEther(balance), "VET");

    if (balance === 0n) {
      console.log("\n⚠️  WARNING: No VET balance found!");
      console.log("Please get testnet VET from: https://faucet.vechain.org/");
      console.log("Enter your wallet address:", signer.address);
    } else if (balance < ethers.parseEther("100")) {
      console.log("\n⚠️  WARNING: Low VET balance!");
      console.log("Consider getting more testnet VET for deployment");
    } else {
      console.log("\n✅ Sufficient VET balance for deployment");
    }

    // Test contract compilation
    console.log("\n3. Testing contract compilation...");
    try {
      await ethers.getContractFactory("Sarcophagus");
      await ethers.getContractFactory("DeathVerifier");
      await ethers.getContractFactory("OBOL");
      console.log("✅ All contracts compiled successfully");
    } catch (error) {
      console.log("❌ Contract compilation failed:", error.message);
    }

    console.log("\n=== ENVIRONMENT TEST COMPLETE ===");
    
    if (balance > ethers.parseEther("50")) {
      console.log("✅ Ready for deployment!");
      console.log("Run: npx hardhat run scripts/deploy-testnet.js --network vechain_testnet");
    } else {
      console.log("❌ Need more testnet VET before deployment");
    }

  } catch (error) {
    console.error("Environment test failed:", error.message);
    console.log("\nCommon issues:");
    console.log("- Check your PRIVATE_KEY in .env file");
    console.log("- Ensure you're connected to the internet");
    console.log("- Verify VeChain testnet RPC is accessible");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 