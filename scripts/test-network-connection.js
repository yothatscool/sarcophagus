const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🌐 Testing VeChain network connection...\n");

  // Get the signer from Hardhat's configured network
  const [deployer] = await ethers.getSigners();
  
  console.log("👤 Deployer address:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  try {
    // Test 1: Check network connection
    console.log("\n🔍 Test 1: Network Connection");
    const network = await ethers.provider.getNetwork();
    console.log("Network chain ID:", network.chainId);
    console.log("Network name:", network.name);
    
    // Test 2: Check latest block
    console.log("\n🔍 Test 2: Latest Block");
    const latestBlock = await ethers.provider.getBlock("latest");
    console.log("Latest block number:", latestBlock.number);
    console.log("Latest block hash:", latestBlock.hash);
    
    // Test 3: Send a simple transaction (transfer 0 VET to self)
    console.log("\n🔍 Test 3: Simple Transaction");
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("Current nonce:", nonce);
    
    const tx = {
      to: deployer.address,
      value: 0,
      nonce: nonce
    };
    
    console.log("Sending test transaction...");
    const txResponse = await deployer.sendTransaction(tx);
    console.log("Transaction hash:", txResponse.hash);
    
    // Wait for confirmation
    console.log("Waiting for confirmation...");
    const receipt = await txResponse.wait();
    console.log("Transaction confirmed!");
    console.log("Block number:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
    
    // Test 4: Check new nonce
    const newNonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("New nonce:", newNonce);
    
    if (newNonce > nonce) {
      console.log("✅ Network connection and transaction sending working!");
    } else {
      console.log("❌ Transaction may not have been sent to network");
    }

  } catch (error) {
    console.error("❌ Network test failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 