const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Updated Contracts (VeChain Correct)...");
  
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
    const deploymentTransactions = {};
    
    console.log("\n📋 Deploying Updated Contracts (with correct address handling)...");
    
    // Step 1: Deploy DeathVerifier
    console.log("\n📋 Step 1: Deploying Updated DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy();
    
    const deathVerifierTx = deathVerifier.deploymentTransaction();
    console.log("DeathVerifier deployment transaction:", deathVerifierTx.hash);
    deploymentTransactions.deathVerifier = deathVerifierTx.hash;
    
    await deathVerifier.waitForDeployment();
    
    // Get the ACTUAL deployed address from the transaction receipt
    const deathVerifierReceipt = await ethers.provider.getTransactionReceipt(deathVerifierTx.hash);
    const deathVerifierAddress = deathVerifierReceipt.contractAddress;
    deployedAddresses.deathVerifier = deathVerifierAddress;
    console.log("✅ DeathVerifier deployed to:", deathVerifierAddress);
    
    // Verify deployment
    const code1 = await ethers.provider.getCode(deathVerifierAddress);
    console.log("Contract code length:", code1.length);
    
    if (code1 === "0x" || code1.length < 100) {
      console.log("❌ DeathVerifier deployment failed - no code found");
      return;
    }
    
    // Step 2: Deploy OBOL Token
    console.log("\n📋 Step 2: Deploying Updated OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy();
    
    const obolTx = obol.deploymentTransaction();
    console.log("OBOL deployment transaction:", obolTx.hash);
    deploymentTransactions.obol = obolTx.hash;
    
    await obol.waitForDeployment();
    
    // Get the ACTUAL deployed address
    const obolReceipt = await ethers.provider.getTransactionReceipt(obolTx.hash);
    const obolAddress = obolReceipt.contractAddress;
    deployedAddresses.obol = obolAddress;
    console.log("✅ OBOL Token deployed to:", obolAddress);
    
    // Verify deployment
    const code2 = await ethers.provider.getCode(obolAddress);
    console.log("Contract code length:", code2.length);
    
    if (code2 === "0x" || code2.length < 100) {
      console.log("❌ OBOL deployment failed - no code found");
      return;
    }
    
    // Step 3: Deploy MultiSig Wallet
    console.log("\n📋 Step 3: Deploying Updated MultiSig Wallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const signers = [deployer.address, "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"];
    const weights = [1, 1, 1];
    const threshold = 2;
    
    const multiSigWallet = await MultiSigWallet.deploy(signers, weights, threshold);
    const multiSigTx = multiSigWallet.deploymentTransaction();
    console.log("MultiSig deployment transaction:", multiSigTx.hash);
    deploymentTransactions.multiSig = multiSigTx.hash;
    
    await multiSigWallet.waitForDeployment();
    
    // Get the ACTUAL deployed address
    const multiSigReceipt = await ethers.provider.getTransactionReceipt(multiSigTx.hash);
    const multiSigAddress = multiSigReceipt.contractAddress;
    deployedAddresses.multiSig = multiSigAddress;
    console.log("✅ MultiSig Wallet deployed to:", multiSigAddress);
    
    // Verify deployment
    const code3 = await ethers.provider.getCode(multiSigAddress);
    console.log("Contract code length:", code3.length);
    
    if (code3 === "0x" || code3.length < 100) {
      console.log("❌ MultiSig deployment failed - no code found");
      return;
    }
    
    // Step 4: Deploy Sarcophagus
    console.log("\n📋 Step 4: Deploying Updated Sarcophagus...");
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
    
    const sarcophagusTx = sarcophagus.deploymentTransaction();
    console.log("Sarcophagus deployment transaction:", sarcophagusTx.hash);
    deploymentTransactions.sarcophagus = sarcophagusTx.hash;
    
    await sarcophagus.waitForDeployment();
    
    // Get the ACTUAL deployed address
    const sarcophagusReceipt = await ethers.provider.getTransactionReceipt(sarcophagusTx.hash);
    const sarcophagusAddress = sarcophagusReceipt.contractAddress;
    deployedAddresses.sarcophagus = sarcophagusAddress;
    console.log("✅ Sarcophagus deployed to:", sarcophagusAddress);
    
    // Verify deployment
    const code4 = await ethers.provider.getCode(sarcophagusAddress);
    console.log("Contract code length:", code4.length);
    
    if (code4 === "0x" || code4.length < 100) {
      console.log("❌ Sarcophagus deployment failed - no code found");
      return;
    }
    
    // Step 5: Deploy B3TR Rewards
    console.log("\n📋 Step 5: Deploying Updated B3TR Rewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(
      B3TR_ADDRESS,
      sarcophagusAddress,
      80
    );
    
    const b3trRewardsTx = b3trRewards.deploymentTransaction();
    console.log("B3TR Rewards deployment transaction:", b3trRewardsTx.hash);
    deploymentTransactions.b3trRewards = b3trRewardsTx.hash;
    
    await b3trRewards.waitForDeployment();
    
    // Get the ACTUAL deployed address
    const b3trRewardsReceipt = await ethers.provider.getTransactionReceipt(b3trRewardsTx.hash);
    const b3trRewardsAddress = b3trRewardsReceipt.contractAddress;
    deployedAddresses.b3trRewards = b3trRewardsAddress;
    console.log("✅ B3TR Rewards deployed to:", b3trRewardsAddress);
    
    // Verify deployment
    const code5 = await ethers.provider.getCode(b3trRewardsAddress);
    console.log("Contract code length:", code5.length);
    
    if (code5 === "0x" || code5.length < 100) {
      console.log("❌ B3TR Rewards deployment failed - no code found");
      return;
    }
    
    // Test all contracts
    console.log("\n🧪 Testing Updated Contracts...");
    
    try {
      // Test OBOL
      const obolInstance = OBOL.attach(obolAddress);
      const obolName = await obolInstance.name();
      const obolSymbol = await obolInstance.symbol();
      console.log("✅ OBOL:", obolName, `(${obolSymbol})`);
      
      // Test DeathVerifier
      const deathVerifierInstance = DeathVerifier.attach(deathVerifierAddress);
      const expiry = await deathVerifierInstance.VERIFICATION_EXPIRY();
      console.log("✅ DeathVerifier: Expiry", expiry.toString());
      
      // Test Sarcophagus - check for new features
      const sarcophagusInstance = Sarcophagus.attach(sarcophagusAddress);
      try {
        const minDeposit = await sarcophagusInstance.MIN_DEPOSIT();
        console.log("✅ Sarcophagus: Min Deposit", ethers.formatEther(minDeposit), "VET");
      } catch (error) {
        console.log("⚠️ Sarcophagus: MIN_DEPOSIT not found (checking other features)");
      }
      
      // Test MultiSig
      const multiSigInstance = MultiSigWallet.attach(multiSigAddress);
      const requiredWeight = await multiSigInstance.requiredWeight();
      console.log("✅ MultiSig: Required Weight", requiredWeight.toString());
      
      // Test B3TR Rewards
      const b3trRewardsInstance = B3TRRewards.attach(b3trRewardsAddress);
      const threshold2 = await b3trRewardsInstance.rateAdjustmentThreshold();
      console.log("✅ B3TR Rewards: Rate Threshold", threshold2.toString());
      
    } catch (error) {
      console.log("❌ Contract testing failed:", error.message);
    }
    
    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet (Corrected Deployment)",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedAddresses,
      transactions: deploymentTransactions,
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      status: "Successfully deployed with correct VeChain address handling",
      features: [
        "Enhanced DeathVerifier with environmental API integration",
        "Updated Sarcophagus with GLO conversion fixes",
        "B3TR Rewards with bonus system",
        "Security patches (reentrancy protection, pause functionality)",
        "NFT integration support",
        "Minimum deposit requirements"
      ],
      note: "VeChain uses different address calculation than Ethereum - actual addresses retrieved from transaction receipts"
    };
    
    const fs = require('fs');
    fs.writeFileSync('vechain-corrected-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 === VECHAIN CORRECTED DEPLOYMENT COMPLETE ===");
    console.log("All updated contracts deployed successfully!");
    console.log("\nContract Addresses (Updated - with correct VeChain addresses):");
    for (const [name, address] of Object.entries(deployedAddresses)) {
      console.log(`${name}: ${address}`);
    }
    console.log("\nExplorer: https://explore-testnet.vechain.org");
    console.log("Deployment info saved to: vechain-corrected-deployment.json");
    
    console.log("\n📋 Next Steps:");
    console.log("1. Update your frontend config with these new addresses");
    console.log("2. Test the new features");
    console.log("3. Deploy your frontend for public testing");
    
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