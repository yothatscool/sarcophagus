const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging Deployment Issue...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Debugging with account:", deployer.address);
    
    // Your original working contracts
    const ORIGINAL_CONTRACTS = {
      sarcophagus: "0xDdC3EA7774D8159cA36941Cd8C2242f0BddDDD86",
      obol: "0x7Bf213e820f681BcdEDB2595B1Aeb304A6638dB9",
      b3trRewards: "0x354f8114254f985fB5ebc4401B4330bB6393ed18",
      deathVerifier: "0xe010129bE20F85845d169BF656310e9F695687A7",
      multiSigWallet: "0x8077A68349049658f5d8E387AaD7475422E04aF7"
    };
    
    console.log("\n📋 Analyzing Original vs Current Contracts...");
    
    // Check contract sizes
    console.log("\n📏 Contract Size Comparison:");
    
    const contractNames = ['DeathVerifier', 'OBOL', 'MultiSigWallet', 'Sarcophagus', 'B3TRRewards'];
    
    for (const name of contractNames) {
      try {
        const ContractFactory = await ethers.getContractFactory(name);
        
        // Get the bytecode size
        const bytecode = ContractFactory.bytecode;
        const sizeInBytes = bytecode.length / 2 - 1; // Remove '0x' prefix
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        
        console.log(`${name}: ${sizeInKB} KB (${sizeInBytes} bytes)`);
        
        // Check if it's too large for VeChain
        if (sizeInBytes > 24576) { // 24KB limit
          console.log(`  ⚠️ ${name} is LARGER than VeChain's 24KB limit!`);
        }
        
      } catch (error) {
        console.log(`${name}: Error getting size - ${error.message}`);
      }
    }
    
    // Check gas estimates
    console.log("\n⛽ Gas Estimation:");
    
    try {
      // Test DeathVerifier deployment
      const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
      const deathVerifierDeploy = DeathVerifier.getDeployTransaction();
      console.log("DeathVerifier deployment gas estimate:", deathVerifierDeploy.gasLimit?.toString() || "Unknown");
      
      // Test OBOL deployment
      const OBOL = await ethers.getContractFactory("OBOL");
      const obolDeploy = OBOL.getDeployTransaction();
      console.log("OBOL deployment gas estimate:", obolDeploy.gasLimit?.toString() || "Unknown");
      
      // Test Sarcophagus deployment
      const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
      const sarcophagusDeploy = Sarcophagus.getDeployTransaction(
        "0x0000000000000000000000000000456E65726779", // VTHO
        "0x5ef79995FE8a89e0812330E4378eB2660ceDe699", // B3TR
        "0x7Bf213e820f681BcdEDB2595B1Aeb304A6638dB9", // OBOL
        "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e", // GLO
        "0xe010129bE20F85845d169BF656310e9F695687A7", // DeathVerifier
        "0x7Bf213e820f681BcdEDB2595B1Aeb304A6638dB9", // OBOL (again)
        "0x8077A68349049658f5d8E387AaD7475422E04aF7"  // MultiSig
      );
      console.log("Sarcophagus deployment gas estimate:", sarcophagusDeploy.gasLimit?.toString() || "Unknown");
      
    } catch (error) {
      console.log("❌ Gas estimation failed:", error.message);
    }
    
    // Check constructor arguments
    console.log("\n🔧 Constructor Arguments Check:");
    
    try {
      const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
      const constructorFragment = Sarcophagus.interface.getConstructor();
      console.log("Sarcophagus constructor parameters:", constructorFragment.inputs.length);
      
      for (let i = 0; i < constructorFragment.inputs.length; i++) {
        const input = constructorFragment.inputs[i];
        console.log(`  Parameter ${i}: ${input.type} ${input.name}`);
      }
      
    } catch (error) {
      console.log("❌ Constructor check failed:", error.message);
    }
    
    // Try a minimal deployment test
    console.log("\n🧪 Minimal Deployment Test:");
    
    try {
      // Try deploying just the OBOL token (simplest contract)
      console.log("Attempting minimal OBOL deployment...");
      
      const OBOL = await ethers.getContractFactory("OBOL");
      const obol = await OBOL.deploy({
        gasLimit: 5000000 // Higher gas limit
      });
      
      console.log("OBOL deployment transaction:", obol.deploymentTransaction().hash);
      console.log("Waiting for deployment...");
      
      await obol.waitForDeployment();
      const address = await obol.getAddress();
      console.log("OBOL deployed to:", address);
      
      // Check if it actually has code
      const code = await ethers.provider.getCode(address);
      console.log("Contract code length:", code.length);
      
      if (code === "0x" || code.length < 100) {
        console.log("❌ Deployment failed - no code found");
        
        // Check transaction receipt
        const receipt = await ethers.provider.getTransactionReceipt(obol.deploymentTransaction().hash);
        if (receipt) {
          console.log("Transaction status:", receipt.status === 1 ? "Success" : "Failed");
          console.log("Gas used:", receipt.gasUsed.toString());
          console.log("Contract address from receipt:", receipt.contractAddress);
        }
        
      } else {
        console.log("✅ Minimal deployment successful!");
        
        // Test the contract
        const name = await obol.name();
        console.log("Contract name:", name);
      }
      
    } catch (error) {
      console.log("❌ Minimal deployment failed:", error.message);
      
      if (error.message.includes("insufficient energy")) {
        console.log("💡 VTHO issue - try getting more VTHO from faucet");
      } else if (error.message.includes("gas")) {
        console.log("💡 Gas issue - try increasing gas limit");
      } else if (error.message.includes("size")) {
        console.log("💡 Contract size issue - contract might be too large");
      }
    }
    
    // Check network status
    console.log("\n🌐 Network Status:");
    
    try {
      const blockNumber = await ethers.provider.getBlockNumber();
      console.log("Current block:", blockNumber);
      
      const gasPrice = await ethers.provider.getFeeData();
      console.log("Gas price:", ethers.formatUnits(gasPrice.gasPrice || 0, "gwei"), "gwei");
      
    } catch (error) {
      console.log("❌ Network status check failed:", error.message);
    }
    
    console.log("\n💡 Debug Summary:");
    console.log("1. Check if any contracts exceed VeChain's 24KB limit");
    console.log("2. Verify gas estimates are reasonable");
    console.log("3. Ensure constructor arguments are correct");
    console.log("4. Check if VTHO balance is sufficient");
    console.log("5. Try deploying with higher gas limits");
    
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 