const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔧 Manual deployment test...\n");

  // Get the signer from Hardhat's configured network
  const [deployer] = await ethers.getSigners();
  
  console.log("👤 Deployer address:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  try {
    // Get current nonce
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("📊 Current nonce:", nonce);
    
    // Create contract factory
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    console.log("✅ Contract factory created");
    
    // Get deployment transaction
    const deploymentTx = await DeathVerifier.getDeployTransaction();
    console.log("✅ Deployment transaction created");
    
    // Add nonce and gas limit
    deploymentTx.nonce = nonce;
    deploymentTx.gasLimit = 3000000; // Set explicit gas limit
    
    console.log("📄 Deployment transaction details:");
    console.log("  Nonce:", deploymentTx.nonce);
    console.log("  Gas limit:", deploymentTx.gasLimit);
    console.log("  Data length:", deploymentTx.data.length);
    
    // Sign and send the transaction manually
    console.log("\n📤 Sending deployment transaction...");
    const signedTx = await deployer.signTransaction(deploymentTx);
    console.log("✅ Transaction signed");
    
    const txResponse = await ethers.provider.broadcastTransaction(signedTx);
    console.log("✅ Transaction broadcasted");
    console.log("📄 Transaction hash:", txResponse.hash);
    
    // Wait for confirmation
    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await txResponse.wait();
    console.log("✅ Transaction confirmed!");
    console.log("📄 Block number:", receipt.blockNumber);
    console.log("📄 Gas used:", receipt.gasUsed.toString());
    console.log("📄 Status:", receipt.status === 1 ? "Success" : "Failed");
    
    if (receipt.contractAddress) {
      console.log("📄 Contract deployed to:", receipt.contractAddress);
      
      // Try to interact with the deployed contract
      console.log("\n🔍 Testing deployed contract...");
      const deployedContract = DeathVerifier.attach(receipt.contractAddress);
      
      try {
        const adminRole = await deployedContract.DEFAULT_ADMIN_ROLE();
        console.log("✅ Contract interaction successful");
        console.log("📄 Admin role:", adminRole);
      } catch (error) {
        console.log("❌ Contract interaction failed:", error.message);
      }
    } else {
      console.log("❌ No contract address in receipt");
    }

  } catch (error) {
    console.error("❌ Manual deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 