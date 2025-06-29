const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Debugging deployment issues...\n");

  // Get the signer from Hardhat's configured network
  const [deployer] = await ethers.getSigners();
  
  console.log("👤 Deployer address:", deployer.address);

  try {
    // Check the current nonce
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("📊 Current nonce:", nonce);
    
    // Check recent transactions
    console.log("\n🔍 Checking recent transactions...");
    
    // Try to get the latest block
    const latestBlock = await ethers.provider.getBlock("latest");
    console.log("📦 Latest block number:", latestBlock.number);
    console.log("📦 Latest block timestamp:", new Date(latestBlock.timestamp * 1000).toISOString());
    
    // Check if there are any transactions in the latest block
    if (latestBlock.transactions.length > 0) {
      console.log("📦 Transactions in latest block:", latestBlock.transactions.length);
      
      // Get the first few transactions
      for (let i = 0; i < Math.min(5, latestBlock.transactions.length); i++) {
        const txHash = latestBlock.transactions[i];
        try {
          const tx = await ethers.provider.getTransaction(txHash);
          const receipt = await ethers.provider.getTransactionReceipt(txHash);
          
          console.log(`\n📄 Transaction ${i + 1}:`);
          console.log("  Hash:", txHash);
          console.log("  From:", tx.from);
          console.log("  To:", tx.to);
          console.log("  Value:", ethers.formatEther(tx.value), "VET");
          console.log("  Gas used:", receipt.gasUsed.toString());
          console.log("  Status:", receipt.status === 1 ? "Success" : "Failed");
          
          if (receipt.contractAddress) {
            console.log("  Contract deployed to:", receipt.contractAddress);
          }
        } catch (error) {
          console.log(`  Error getting transaction ${txHash}:`, error.message);
        }
      }
    } else {
      console.log("📦 No transactions in latest block");
    }
    
    // Try to deploy a simple contract with explicit nonce
    console.log("\n🧪 Testing deployment with explicit nonce...");
    
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deploymentTx = await DeathVerifier.getDeployTransaction();
    
    console.log("Deployment transaction data length:", deploymentTx.data.length);
    console.log("Deployment transaction data (first 100 chars):", deploymentTx.data.substring(0, 100));
    
    // Try to estimate gas
    try {
      const gasEstimate = await ethers.provider.estimateGas(deploymentTx);
      console.log("Gas estimate:", gasEstimate.toString());
    } catch (error) {
      console.log("Gas estimation failed:", error.message);
    }

  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 