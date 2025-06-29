const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Checking deployed contract addresses...\n");

  // Get the signer from Hardhat's configured network
  const [deployer] = await ethers.getSigners();
  
  console.log("👤 Checking with account:", deployer.address);

  try {
    // Get the latest deployment data
    const fs = require('fs');
    const deploymentData = JSON.parse(fs.readFileSync('deployment-mnemonic.json', 'utf8'));
    
    console.log("📄 Deployment data from file:");
    console.log(JSON.stringify(deploymentData, null, 2));
    
    // Check if all addresses are the same
    const addresses = Object.values(deploymentData.contracts);
    const uniqueAddresses = [...new Set(addresses)];
    
    console.log("\n🔍 Analysis:");
    console.log("Total contracts:", addresses.length);
    console.log("Unique addresses:", uniqueAddresses.length);
    
    if (uniqueAddresses.length === 1) {
      console.log("❌ PROBLEM: All contracts have the same address!");
      console.log("This indicates a deployment issue.");
    } else {
      console.log("✅ Good: Contracts have different addresses");
    }
    
    // Try to get contract instances and check their addresses
    console.log("\n🔍 Checking contract instances...");
    
    try {
      const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
      const sarcophagus = await Sarcophagus.attach(deploymentData.contracts.Sarcophagus);
      console.log("Sarcophagus instance address:", await sarcophagus.getAddress());
    } catch (error) {
      console.log("❌ Could not attach to Sarcophagus:", error.message);
    }
    
    try {
      const OBOL = await ethers.getContractFactory("OBOL");
      const obol = await OBOL.attach(deploymentData.contracts.OBOL);
      console.log("OBOL instance address:", await obol.getAddress());
    } catch (error) {
      console.log("❌ Could not attach to OBOL:", error.message);
    }
    
    try {
      const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
      const b3trRewards = await B3TRRewards.attach(deploymentData.contracts.B3TRRewards);
      console.log("B3TRRewards instance address:", await b3trRewards.getAddress());
    } catch (error) {
      console.log("❌ Could not attach to B3TRRewards:", error.message);
    }

  } catch (error) {
    console.error("❌ Error checking addresses:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 