const { ethers } = require("hardhat");

async function main() {
  console.log("🔋 Checking Main Account VET and VTHO balances...");
  
  const MAIN_ACCOUNT = "0x0BD562C50eDD56e2627a3078d02A3782fF03F67D";
  const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779"; // VTHO contract address
  
  try {
    const provider = ethers.provider;
    
    // Check VET balance
    const vetBalance = await provider.getBalance(MAIN_ACCOUNT);
    console.log("Address:", MAIN_ACCOUNT);
    console.log("VET Balance:", ethers.formatEther(vetBalance), "VET");
    
    // Check VTHO balance using the VTHO contract
    const vthoAbi = ["function balanceOf(address owner) view returns (uint256)"];
    const vthoContract = new ethers.Contract(VTHO_ADDRESS, vthoAbi, provider);
    
    try {
      const vthoBalance = await vthoContract.balanceOf(MAIN_ACCOUNT);
      console.log("VTHO Balance:", ethers.formatEther(vthoBalance), "VTHO");
      
      // Check if we have enough for deployment
      const estimatedGasCost = ethers.parseEther("0.000000000005"); // Very small amount
      
      if (vthoBalance > estimatedGasCost) {
        console.log("✅ Sufficient VTHO for deployment");
      } else {
        console.log("❌ Insufficient VTHO for deployment");
        console.log("\n💡 Solutions:");
        console.log("1. Get VTHO from VeChain testnet faucet: https://faucet.vechain.org/");
        console.log("2. Wait for VTHO to generate from VET holdings");
        console.log("3. Transfer VTHO from another account");
      }
    } catch (vthoError) {
      console.log("⚠️  Could not check VTHO balance:", vthoError.message);
      console.log("This might be normal if VTHO contract is not available on testnet");
    }
    
  } catch (error) {
    console.log("❌ Error checking balance:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 