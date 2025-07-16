const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Clean Contract Deployment on VeChain Testnet...");
  
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
    
    // Step 1: Deploy DeathVerifier
    console.log("\n📋 Step 1: Deploying DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();
    const deathVerifierAddress = await deathVerifier.getAddress();
    deployedAddresses.deathVerifier = deathVerifierAddress;
    console.log("✅ DeathVerifier deployed to:", deathVerifierAddress);
    
    // Verify deployment
    const code1 = await ethers.provider.getCode(deathVerifierAddress);
    console.log("Contract code length:", code1.length);
    
    // Step 2: Deploy OBOL Token
    console.log("\n📋 Step 2: Deploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy();
    await obol.waitForDeployment();
    const obolAddress = await obol.getAddress();
    deployedAddresses.obol = obolAddress;
    console.log("✅ OBOL Token deployed to:", obolAddress);
    
    // Verify deployment
    const code2 = await ethers.provider.getCode(obolAddress);
    console.log("Contract code length:", code2.length);
    
    // Step 3: Deploy MultiSig Wallet
    console.log("\n📋 Step 3: Deploying MultiSig Wallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const signers = [deployer.address, "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"];
    const weights = [1, 1, 1];
    const threshold = 2;
    
    const multiSigWallet = await MultiSigWallet.deploy(signers, weights, threshold);
    await multiSigWallet.waitForDeployment();
    const multiSigAddress = await multiSigWallet.getAddress();
    deployedAddresses.multiSig = multiSigAddress;
    console.log("✅ MultiSig Wallet deployed to:", multiSigAddress);
    
    // Verify deployment
    const code3 = await ethers.provider.getCode(multiSigAddress);
    console.log("Contract code length:", code3.length);
    
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
      multiSigAddress
    );
    await sarcophagus.waitForDeployment();
    const sarcophagusAddress = await sarcophagus.getAddress();
    deployedAddresses.sarcophagus = sarcophagusAddress;
    console.log("✅ Sarcophagus deployed to:", sarcophagusAddress);
    
    // Verify deployment
    const code4 = await ethers.provider.getCode(sarcophagusAddress);
    console.log("Contract code length:", code4.length);
    
    // Step 5: Deploy B3TR Rewards
    console.log("\n📋 Step 5: Deploying B3TR Rewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(
      B3TR_ADDRESS,
      sarcophagusAddress,
      80
    );
    await b3trRewards.waitForDeployment();
    const b3trRewardsAddress = await b3trRewards.getAddress();
    deployedAddresses.b3trRewards = b3trRewardsAddress;
    console.log("✅ B3TR Rewards deployed to:", b3trRewardsAddress);
    
    // Verify deployment
    const code5 = await ethers.provider.getCode(b3trRewardsAddress);
    console.log("Contract code length:", code5.length);
    
    // Test all contracts
    console.log("\n🧪 Testing deployed contracts...");
    
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
    
    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet (Clean Deployment)",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedAddresses,
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      status: "Successfully deployed and tested"
    };
    
    const fs = require('fs');
    fs.writeFileSync('clean-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 === CLEAN DEPLOYMENT COMPLETE ===");
    console.log("All contracts deployed successfully!");
    console.log("\nContract Addresses:");
    for (const [name, address] of Object.entries(deployedAddresses)) {
      console.log(`${name}: ${address}`);
    }
    console.log("\nExplorer: https://explore-testnet.vechain.org");
    console.log("Deployment info saved to: clean-deployment.json");
    
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