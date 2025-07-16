// Simple VeChain Deployment Script
// Uses lower gas limits and better error handling

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Simple Contract Deployment Test...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("VET Balance:", ethers.formatEther(balance), "VET");
    
    // Deploy just the OBOL token (simplest contract)
    console.log("\n📋 Deploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    
    console.log("Creating deployment transaction...");
    const obol = await OBOL.deploy();
    
    console.log("Deployment transaction sent:", obol.deploymentTransaction().hash);
    console.log("Waiting for deployment...");
    
    await obol.waitForDeployment();
    const address = await obol.getAddress();
    
    console.log("✅ OBOL deployed to:", address);
    
    // Verify the contract actually has code
    console.log("\n🔍 Verifying contract code...");
    const code = await ethers.provider.getCode(address);
    console.log("Contract has code:", code !== "0x");
    console.log("Code length:", code.length);
    
    if (code === "0x") {
      console.log("❌ No contract code found! Deployment may have failed.");
      return;
    }
    
    // Test the deployed contract
    console.log("\n🧪 Testing deployed contract...");
    const name = await obol.name();
    const symbol = await obol.symbol();
    const totalSupply = await obol.totalSupply();
    
    console.log("✅ Contract Name:", name);
    console.log("✅ Contract Symbol:", symbol);
    console.log("✅ Total Supply:", ethers.formatEther(totalSupply));
    
    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contract: "OBOL",
      address: address,
      transactionHash: obol.deploymentTransaction().hash
    };
    
    const fs = require('fs');
    fs.writeFileSync('simple-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 === DEPLOYMENT SUCCESSFUL ===");
    console.log("Contract Address:", address);
    console.log("Transaction Hash:", obol.deploymentTransaction().hash);
    console.log("Explorer Link: https://explore-testnet.vechain.org/address/" + address);
    console.log("Deployment info saved to: simple-deployment.json");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    if (error.message.includes("insufficient energy")) {
      console.log("\n💡 VTHO issue detected. Try getting more VTHO from the faucet.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 