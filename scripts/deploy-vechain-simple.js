const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Simple VeChain Deployment Test...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("VET Balance:", ethers.formatEther(balance), "VET");
    
    // Get current nonce
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("Current nonce:", nonce);
    
    // Try deploying just the OBOL token with minimal settings
    console.log("\n📋 Deploying OBOL Token (Simple)...");
    
    const OBOL = await ethers.getContractFactory("OBOL");
    
    // Try with different deployment approaches
    console.log("Attempting deployment...");
    
    const obol = await OBOL.deploy();
    console.log("Deployment transaction:", obol.deploymentTransaction().hash);
    
    console.log("Waiting for deployment...");
    await obol.waitForDeployment();
    
    const address = await obol.getAddress();
    console.log("Deployed to:", address);
    
    // Check if contract actually has code
    console.log("\n🔍 Checking contract code...");
    const code = await ethers.provider.getCode(address);
    console.log("Code length:", code.length);
    console.log("Has code:", code !== "0x");
    
    if (code === "0x" || code.length < 100) {
      console.log("❌ No contract code found!");
      
      // Check transaction receipt
      console.log("\n📋 Checking transaction receipt...");
      const receipt = await ethers.provider.getTransactionReceipt(obol.deploymentTransaction().hash);
      
      if (receipt) {
        console.log("Transaction status:", receipt.status === 1 ? "Success" : "Failed");
        console.log("Gas used:", receipt.gasUsed.toString());
        console.log("Contract address from receipt:", receipt.contractAddress);
        
        if (receipt.contractAddress && receipt.contractAddress !== address) {
          console.log("⚠️ Address mismatch!");
          console.log("Expected:", address);
          console.log("Actual:", receipt.contractAddress);
          
          // Check the actual address
          const actualCode = await ethers.provider.getCode(receipt.contractAddress);
          console.log("Actual address code length:", actualCode.length);
        }
      }
      
      console.log("\n💡 This appears to be a VeChain-specific deployment issue.");
      console.log("Possible solutions:");
      console.log("1. Use VeChain's official deployment tools");
      console.log("2. Deploy to mainnet instead of testnet");
      console.log("3. Use a different RPC endpoint");
      console.log("4. Check VeChain documentation for deployment quirks");
      
    } else {
      console.log("✅ Contract deployed successfully!");
      
      // Test the contract
      try {
        const name = await obol.name();
        const symbol = await obol.symbol();
        console.log("✅ Contract Name:", name);
        console.log("✅ Contract Symbol:", symbol);
      } catch (error) {
        console.log("❌ Contract test failed:", error.message);
      }
    }
    
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