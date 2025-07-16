// Single Contract Deployment Test
// Deploy just DeathVerifier with timeout handling

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying single contract to test VTHO requirements...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("VET Balance:", ethers.formatEther(balance), "VET");
    
    // Deploy just the DeathVerifier contract with explicit gas settings
    console.log("\nDeploying DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    
    // Try with explicit gas settings
    const deathVerifier = await DeathVerifier.deploy({
      gasLimit: 3000000, // 3 million gas limit
      gasPrice: ethers.parseUnits("1", "gwei") // 1 gwei
    });
    
    console.log("Transaction sent:", deathVerifier.deploymentTransaction().hash);
    console.log("Waiting for deployment...");
    
    await deathVerifier.waitForDeployment();
    const address = await deathVerifier.getAddress();
    
    console.log("✅ DeathVerifier deployed successfully!");
    console.log("Contract address:", address);
    
    // Save the address
    const fs = require('fs');
    const deploymentInfo = {
      network: "VeChain Testnet",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        DeathVerifier: address
      }
    };
    
    fs.writeFileSync('single-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to: single-deployment.json");
    
  } catch (error) {
    console.log("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient energy")) {
      console.log("\n💡 The contract deployment requires more VTHO than available.");
      console.log("Solutions:");
      console.log("1. Get more VTHO from: https://faucet.vechain.org/");
      console.log("2. Try with a smaller contract first");
      console.log("3. Wait for more VTHO to generate from VET holdings");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 