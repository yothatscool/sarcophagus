// VeChain Native Deployment Script
// Uses only VeChain's native tools and protocols

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 VeChain Native Contract Deployment...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("VET Balance:", ethers.formatEther(balance), "VET");
    
    // Testnet token addresses
    const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779";
    const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
    const GLO_ADDRESS = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e";
    
    const deployedAddresses = {};
    
    // Deploy contracts one by one with explicit gas settings
    console.log("\n📋 Deploying contracts with explicit gas settings...");
    
    // Step 1: Deploy DeathVerifier
    console.log("\n📋 Step 1: Deploying DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy({
      gasLimit: 3000000
    });
    
    console.log("DeathVerifier deployment transaction:", deathVerifier.deploymentTransaction().hash);
    await deathVerifier.waitForDeployment();
    const deathVerifierAddress = await deathVerifier.getAddress();
    deployedAddresses.deathVerifier = deathVerifierAddress;
    console.log("✅ DeathVerifier deployed to:", deathVerifierAddress);
    
    // Wait and verify
    await new Promise(resolve => setTimeout(resolve, 5000));
    const code1 = await ethers.provider.getCode(deathVerifierAddress);
    console.log("Contract code length:", code1.length);
    
    if (code1 === "0x" || code1.length < 100) {
      console.log("❌ DeathVerifier deployment failed - no code found");
      return;
    }
    
    // Step 2: Deploy OBOL Token
    console.log("\n📋 Step 2: Deploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy({
      gasLimit: 3000000
    });
    
    console.log("OBOL deployment transaction:", obol.deploymentTransaction().hash);
    await obol.waitForDeployment();
    const obolAddress = await obol.getAddress();
    deployedAddresses.obol = obolAddress;
    console.log("✅ OBOL Token deployed to:", obolAddress);
    
    // Wait and verify
    await new Promise(resolve => setTimeout(resolve, 5000));
    const code2 = await ethers.provider.getCode(obolAddress);
    console.log("Contract code length:", code2.length);
    
    if (code2 === "0x" || code2.length < 100) {
      console.log("❌ OBOL deployment failed - no code found");
      return;
    }
    
    // Step 3: Deploy MultiSig Wallet
    console.log("\n📋 Step 3: Deploying MultiSig Wallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const signers = [deployer.address, "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"];
    const weights = [1, 1, 1];
    const threshold = 2;
    
    const multiSigWallet = await MultiSigWallet.deploy(signers, weights, threshold, {
      gasLimit: 4000000
    });
    
    console.log("MultiSig deployment transaction:", multiSigWallet.deploymentTransaction().hash);
    await multiSigWallet.waitForDeployment();
    const multiSigAddress = await multiSigWallet.getAddress();
    deployedAddresses.multiSig = multiSigAddress;
    console.log("✅ MultiSig Wallet deployed to:", multiSigAddress);
    
    // Wait and verify
    await new Promise(resolve => setTimeout(resolve, 5000));
    const code3 = await ethers.provider.getCode(multiSigAddress);
    console.log("Contract code length:", code3.length);
    
    if (code3 === "0x" || code3.length < 100) {
      console.log("❌ MultiSig deployment failed - no code found");
      return;
    }
    
    // Step 4: Deploy Sarcophagus
    console.log("\n📋 Step 4: Deploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = await Sarcophagus.deploy(
      VTHO_ADDRESS,
      B3TR_ADDRESS,
      obolAddress,
      GLO_ADDRESS,
      deathVerifierAddress,
      obolAddress,
      multiSigAddress,
      {
        gasLimit: 8000000
      }
    );
    
    console.log("Sarcophagus deployment transaction:", sarcophagus.deploymentTransaction().hash);
    await sarcophagus.waitForDeployment();
    const sarcophagusAddress = await sarcophagus.getAddress();
    deployedAddresses.sarcophagus = sarcophagusAddress;
    console.log("✅ Sarcophagus deployed to:", sarcophagusAddress);
    
    // Wait and verify
    await new Promise(resolve => setTimeout(resolve, 5000));
    const code4 = await ethers.provider.getCode(sarcophagusAddress);
    console.log("Contract code length:", code4.length);
    
    if (code4 === "0x" || code4.length < 100) {
      console.log("❌ Sarcophagus deployment failed - no code found");
      return;
    }
    
    // Step 5: Deploy B3TR Rewards
    console.log("\n📋 Step 5: Deploying B3TR Rewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(
      B3TR_ADDRESS,
      sarcophagusAddress,
      80,
      {
        gasLimit: 5000000
      }
    );
    
    console.log("B3TR Rewards deployment transaction:", b3trRewards.deploymentTransaction().hash);
    await b3trRewards.waitForDeployment();
    const b3trRewardsAddress = await b3trRewards.getAddress();
    deployedAddresses.b3trRewards = b3trRewardsAddress;
    console.log("✅ B3TR Rewards deployed to:", b3trRewardsAddress);
    
    // Wait and verify
    await new Promise(resolve => setTimeout(resolve, 5000));
    const code5 = await ethers.provider.getCode(b3trRewardsAddress);
    console.log("Contract code length:", code5.length);
    
    if (code5 === "0x" || code5.length < 100) {
      console.log("❌ B3TR Rewards deployment failed - no code found");
      return;
    }
    
    // Test all contracts
    console.log("\n🧪 Testing deployed contracts...");
    
    try {
      // Test OBOL
      const obolName = await obol.name();
      const obolSymbol = await obol.symbol();
      console.log("✅ OBOL:", obolName, `(${obolSymbol})`);
      
      // Test DeathVerifier
      const expiry = await deathVerifier.VERIFICATION_EXPIRY();
      console.log("✅ DeathVerifier: Expiry", expiry.toString());
      
      // Test Sarcophagus
      const minDeposit = await sarcophagus.MIN_DEPOSIT();
      console.log("✅ Sarcophagus: Min Deposit", ethers.formatEther(minDeposit), "VET");
      
      // Test MultiSig
      const requiredWeight = await multiSigWallet.requiredWeight();
      console.log("✅ MultiSig: Required Weight", requiredWeight.toString());
      
      // Test B3TR Rewards
      const threshold2 = await b3trRewards.rateAdjustmentThreshold();
      console.log("✅ B3TR Rewards: Threshold", threshold2.toString());
      
    } catch (error) {
      console.log("❌ Contract testing failed:", error.message);
    }
    
    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet (Native Deployment)",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedAddresses,
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      status: "Successfully deployed with explicit gas settings"
    };
    
    const fs = require('fs');
    fs.writeFileSync('vechain-native-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 === VECHAIN NATIVE DEPLOYMENT COMPLETE ===");
    console.log("All contracts deployed successfully!");
    console.log("\nContract Addresses:");
    for (const [name, address] of Object.entries(deployedAddresses)) {
      console.log(`${name}: ${address}`);
    }
    console.log("\nExplorer: https://explore-testnet.vechain.org");
    console.log("Deployment info saved to: vechain-native-deployment.json");
    
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