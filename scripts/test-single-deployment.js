const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🧪 Testing single contract deployment...\n");

  // Get the signer from Hardhat's configured network
  const [deployer] = await ethers.getSigners();
  
  console.log("👤 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  try {
    // Deploy just one simple contract
    console.log("\n📦 Deploying DeathVerifier contract...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    
    console.log("Contract factory created");
    
    const deathVerifier = await DeathVerifier.deploy();
    console.log("Deployment transaction sent");
    
    await deathVerifier.waitForDeployment();
    console.log("Deployment confirmed");
    
    const address = await deathVerifier.getAddress();
    console.log("✅ DeathVerifier deployed to:", address);
    
    // Check if we can interact with the contract
    console.log("\n🔍 Testing contract interaction...");
    try {
      const owner = await deathVerifier.hasRole(await deathVerifier.DEFAULT_ADMIN_ROLE(), deployer.address);
      console.log("✅ Contract interaction successful. Is deployer admin?", owner);
    } catch (error) {
      console.log("❌ Contract interaction failed:", error.message);
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 