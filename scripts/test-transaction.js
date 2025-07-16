const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing basic transaction on VeChain Testnet...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("VET Balance:", ethers.formatEther(balance), "VET");
    
    // Try to send a small amount of VET to ourselves (just to test)
    const testAmount = ethers.parseEther("0.001"); // 0.001 VET
    
    console.log("Attempting to send", ethers.formatEther(testAmount), "VET to self...");
    
    const tx = await deployer.sendTransaction({
      to: deployer.address,
      value: testAmount,
      gasLimit: 21000 // Standard transfer gas limit
    });
    
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    
  } catch (error) {
    console.log("❌ Transaction failed:", error.message);
    
    if (error.message.includes("insufficient energy")) {
      console.log("\n💡 The issue is with VTHO/energy:");
      console.log("1. Try getting more VTHO from: https://faucet.vechain.org/");
      console.log("2. Or wait for VTHO to generate from your VET holdings");
      console.log("3. The deployment contracts might need more VTHO than a simple transfer");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 