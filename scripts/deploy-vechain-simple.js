const { ethers } = require("hardhat");

async function main() {
  console.log("🏛️ Attempting VeChain deployment with simplified approach...");

  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Contract addresses for testnet
    const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779";
    const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
    const GLO_ADDRESS = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e";

    // Oracle addresses (testnet)
    const ORACLE_ADDRESSES = [
      "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
      "0xa19f660abf4fed45226787cd17ef723d94d1ce31",
      "0x8c8d7c46219d9205f056f28fee5950ad564d9f23",
      "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc",
      "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c"
    ];

    console.log("\n📋 Step 1: Deploying DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifierTx = await DeathVerifier.deploy(ORACLE_ADDRESSES);
    console.log("DeathVerifier deployment transaction:", deathVerifierTx.hash);
    
    // Wait for transaction to be mined
    const deathVerifierReceipt = await deathVerifierTx.wait();
    const deathVerifierAddress = deathVerifierReceipt.contractAddress;
    console.log("✅ DeathVerifier deployed to:", deathVerifierAddress);

    console.log("\n📋 Step 2: Deploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obolTx = await OBOL.deploy();
    console.log("OBOL deployment transaction:", obolTx.hash);
    
    const obolReceipt = await obolTx.wait();
    const obolAddress = obolReceipt.contractAddress;
    console.log("✅ OBOL Token deployed to:", obolAddress);

    console.log("\n📋 Step 3: Deploying MultiSig Wallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const signers = [deployer.address, "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"];
    const weights = [1, 1, 1];
    const threshold = 2;
    const multiSigTx = await MultiSigWallet.deploy(signers, weights, threshold);
    console.log("MultiSig deployment transaction:", multiSigTx.hash);
    
    const multiSigReceipt = await multiSigTx.wait();
    const multiSigAddress = multiSigReceipt.contractAddress;
    console.log("✅ MultiSig Wallet deployed to:", multiSigAddress);

    console.log("\n📋 Step 4: Deploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagusTx = await Sarcophagus.deploy(
      VTHO_ADDRESS,
      B3TR_ADDRESS,
      obolAddress,
      GLO_ADDRESS,
      deathVerifierAddress,
      obolAddress,
      multiSigAddress
    );
    console.log("Sarcophagus deployment transaction:", sarcophagusTx.hash);
    
    const sarcophagusReceipt = await sarcophagusTx.wait();
    const sarcophagusAddress = sarcophagusReceipt.contractAddress;
    console.log("✅ Sarcophagus deployed to:", sarcophagusAddress);

    console.log("\n📋 Step 5: Deploying B3TR Rewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewardsTx = await B3TRRewards.deploy(
      B3TR_ADDRESS,
      sarcophagusAddress,
      80
    );
    console.log("B3TR Rewards deployment transaction:", b3trRewardsTx.hash);
    
    const b3trRewardsReceipt = await b3trRewardsTx.wait();
    const b3trRewardsAddress = b3trRewardsReceipt.contractAddress;
    console.log("✅ B3TR Rewards deployed to:", b3trRewardsAddress);

    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet",
      deployer: deployer.address,
      contracts: {
        deathVerifier: deathVerifierAddress,
        obol: obolAddress,
        multiSig: multiSigAddress,
        sarcophagus: sarcophagusAddress,
        b3trRewards: b3trRewardsAddress
      },
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      oracles: ORACLE_ADDRESSES,
      deploymentTime: new Date().toISOString()
    };

    const fs = require('fs');
    fs.writeFileSync('vechain-deployment-success.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to: vechain-deployment-success.json");

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==================================");
    console.log("Network: VeChain Testnet");
    console.log("Deployer:", deployer.address);
    console.log("\nContract Addresses:");
    console.log("DeathVerifier:", deathVerifierAddress);
    console.log("OBOL Token:", obolAddress);
    console.log("MultiSig Wallet:", multiSigAddress);
    console.log("Sarcophagus:", sarcophagusAddress);
    console.log("B3TR Rewards:", b3trRewardsAddress);
    console.log("\nExplorer: https://explore-testnet.vechain.org");
    console.log("==================================");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    // If this fails, we'll fall back to manual deployment
    console.log("\n🔄 Since automated deployment failed, you can:");
    console.log("1. Use the manual deployment guide: VECHAIN_MANUAL_DEPLOYMENT_GUIDE.md");
    console.log("2. Use VeChain Sync2 or VeWorld for deployment");
    console.log("3. Contact VeChain support for deployment assistance");
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 