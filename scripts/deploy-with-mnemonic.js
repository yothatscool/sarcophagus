const { ethers } = require("hardhat");
require("dotenv").config();

// Testnet contract addresses
const VTHO_TOKEN = "0x0000000000000000000000000000456E65726779";
const B3TR_TOKEN = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
const OBOL_TOKEN = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const GLO_TOKEN = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e";
const DEATH_VERIFIER = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  console.log("🚀 Starting deployment with mnemonic configuration...\n");

  // Get the signer from Hardhat's configured network
  const [deployer] = await ethers.getSigners();
  
  console.log("👤 Deploying contracts with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", balance.toString());

  // Use ethers.parseEther for v6, fallback to ethers.utils.parseEther for v5
  const parseEther = ethers.parseEther ? ethers.parseEther : ethers.utils.parseEther;
  if (balance < parseEther("0.1")) {
    console.error("❌ Insufficient balance for deployment. Please fund your account.");
    return;
  }

  try {
    // Deploy Sarcophagus contract with all required constructor arguments
    console.log("\n📦 Deploying Sarcophagus contract...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = await Sarcophagus.deploy(
      VTHO_TOKEN,
      B3TR_TOKEN,
      OBOL_TOKEN,
      GLO_TOKEN,
      DEATH_VERIFIER,
      OBOL_TOKEN, // OBOL contract address (again)
      deployer.address // Fee collector
    );
    await sarcophagus.waitForDeployment();
    console.log("✅ Sarcophagus deployed to:", sarcophagus.target || sarcophagus.address);

    // Deploy OBOL contract
    console.log("\n📦 Deploying OBOL contract...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy();
    await obol.waitForDeployment();
    console.log("✅ OBOL deployed to:", obol.target || obol.address);

    // Deploy B3TRRewards contract
    console.log("\n📦 Deploying B3TRRewards contract...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(
      B3TR_TOKEN, // B3TR token address
      sarcophagus.target || sarcophagus.address, // Sarcophagus contract address
      8000 // Rate adjustment threshold (80% = 8000 basis points)
    );
    await b3trRewards.waitForDeployment();
    console.log("✅ B3TRRewards deployed to:", b3trRewards.target || b3trRewards.address);

    // Deploy DeathVerifier contract
    console.log("\n📦 Deploying DeathVerifier contract...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();
    console.log("✅ DeathVerifier deployed to:", deathVerifier.target || deathVerifier.address);

    // Deploy MultiSigWallet contract
    console.log("\n📦 Deploying MultiSigWallet contract...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(
      [deployer.address, deployer.address], // Initial signers array (2 signers required)
      [50, 50], // Weights array (50 each for 2 signers)
      100 // Required weight (100 = both signers must approve)
    );
    await multiSigWallet.waitForDeployment();
    console.log("✅ MultiSigWallet deployed to:", multiSigWallet.target || multiSigWallet.address);

    // Save deployment data
    const deploymentData = {
      network: "vechainTestnet",
      deployer: deployer.address,
      contracts: {
        Sarcophagus: sarcophagus.target || sarcophagus.address,
        OBOL: obol.target || obol.address,
        B3TRRewards: b3trRewards.target || b3trRewards.address,
        DeathVerifier: deathVerifier.target || deathVerifier.address,
        MultiSigWallet: multiSigWallet.target || multiSigWallet.address
      },
      timestamp: new Date().toISOString()
    };

    const fs = require('fs');
    fs.writeFileSync(
      'deployment-mnemonic.json', 
      JSON.stringify(deploymentData, null, 2)
    );

    console.log("\n📄 Deployment data saved to deployment-mnemonic.json");
    console.log("\n✅ All contracts deployed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("Sarcophagus:", sarcophagus.target || sarcophagus.address);
    console.log("OBOL:", obol.target || obol.address);
    console.log("B3TRRewards:", b3trRewards.target || b3trRewards.address);
    console.log("DeathVerifier:", deathVerifier.target || deathVerifier.address);
    console.log("MultiSigWallet:", multiSigWallet.target || multiSigWallet.address);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 