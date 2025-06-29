const { ethers } = require("hardhat");
const fs = require('fs');
require('dotenv').config();

async function main() {
  console.log("🚀 Deploying Sarcophagus Protocol to VeChain Testnet...");

  // Check if we have a mnemonic
  if (!process.env.MNEMONIC) {
    console.error("❌ Error: No MNEMONIC found in .env file");
    console.log("Please add your mnemonic to the .env file:");
    console.log("MNEMONIC=your_mnemonic_phrase_here");
    process.exit(1);
  }

  try {
    // Get the signer from hardhat
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying contracts with account:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "VET");

    if (balance === 0n) {
      console.error("❌ Error: Account has no VET balance");
      console.log("Please fund your account with testnet VET from:");
      console.log("https://faucet.vechain.org/");
      process.exit(1);
    }

    // Testnet token addresses on VeChain Testnet
    const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699"; // B3TR testnet address
    const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779"; // VTHO address (same on testnet)
    const GLO_ADDRESS = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e"; // GLO testnet address
    
    // MultiSig signer addresses (you can update these)
    const MULTISIG_SIGNERS = [
      deployer.address, // Deployer as first signer
      "0x0000000000000000000000000000000000000001", // Placeholder
      "0x0000000000000000000000000000000000000002"  // Placeholder
    ];
    
    const MULTISIG_WEIGHTS = [1, 1, 1]; // Equal weights
    const MULTISIG_THRESHOLD = 2; // Require 2 out of 3 signatures

    // Oracle addresses for death verification
    const ORACLE_ADDRESSES = [
      "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
      "0xa19f660abf4fed45226787cd17ef723d94d1ce31",
      "0x8c8d7c46219d9205f056f28fee5950ad564d9f23",
      "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc",
      "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c"
    ];

    console.log("\n🔧 Deploying contracts...");

    // 1. Deploy DeathVerifier
    console.log("📋 Deploying DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy(ORACLE_ADDRESSES);
    await deathVerifier.waitForDeployment();
    const deathVerifierAddress = await deathVerifier.getAddress();
    console.log("✅ DeathVerifier deployed to:", deathVerifierAddress);

    // Wait a bit between deployments
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Deploy OBOL Token
    console.log("📋 Deploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy();
    await obol.waitForDeployment();
    const obolAddress = await obol.getAddress();
    console.log("✅ OBOL Token deployed to:", obolAddress);

    // Wait a bit between deployments
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Deploy MultiSig Wallet
    console.log("📋 Deploying MultiSig Wallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(MULTISIG_SIGNERS, MULTISIG_WEIGHTS, MULTISIG_THRESHOLD);
    await multiSigWallet.waitForDeployment();
    const multiSigAddress = await multiSigWallet.getAddress();
    console.log("✅ MultiSig Wallet deployed to:", multiSigAddress);

    // Wait a bit between deployments
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Deploy Sarcophagus (main contract)
    console.log("📋 Deploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = await Sarcophagus.deploy(
      VTHO_ADDRESS,           // _vthoToken
      B3TR_ADDRESS,           // _b3trToken
      obolAddress,            // _obolToken
      GLO_ADDRESS,            // _gloToken
      deathVerifierAddress,   // _deathVerifier
      obolAddress,            // _obol (same as obolToken)
      multiSigAddress         // _feeCollector
    );
    await sarcophagus.waitForDeployment();
    const sarcophagusAddress = await sarcophagus.getAddress();
    console.log("✅ Sarcophagus deployed to:", sarcophagusAddress);

    // Wait a bit between deployments
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Deploy B3TR Rewards with correct sarcophagus address
    console.log("📋 Deploying B3TR Rewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(
      B3TR_ADDRESS,           // _b3trToken
      sarcophagusAddress,     // _sarcophagusContract
      80                      // _rateAdjustmentThreshold
    );
    await b3trRewards.waitForDeployment();
    const b3trRewardsAddress = await b3trRewards.getAddress();
    console.log("✅ B3TR Rewards deployed to:", b3trRewardsAddress);

    // Set up roles and permissions
    console.log("\n🔐 Setting up roles and permissions...");

    // Define role constants (these should match the contract constants)
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const REWARD_MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REWARD_MINTER_ROLE"));
    const DEATH_VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DEATH_VERIFIER_ROLE"));

    // Grant ORACLE_ROLE to oracle addresses
    for (const oracle of ORACLE_ADDRESSES) {
      await deathVerifier.grantRole(ORACLE_ROLE, oracle);
      console.log("✅ Granted ORACLE_ROLE to:", oracle);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Grant ADMIN_ROLE to deployer
    await deathVerifier.grantRole(ADMIN_ROLE, deployer.address);
    await obol.grantRole(ADMIN_ROLE, deployer.address);
    await b3trRewards.grantRole(ADMIN_ROLE, deployer.address);
    console.log("✅ Granted ADMIN_ROLE to deployer");

    // Grant REWARD_MINTER_ROLE to B3TR Rewards contract
    await obol.grantRole(REWARD_MINTER_ROLE, b3trRewardsAddress);
    console.log("✅ Granted REWARD_MINTER_ROLE to B3TR Rewards");

    // Grant DEATH_VERIFIER_ROLE to DeathVerifier contract
    await sarcophagus.grantRole(DEATH_VERIFIER_ROLE, deathVerifierAddress);
    console.log("✅ Granted DEATH_VERIFIER_ROLE to DeathVerifier");

    // Grant ORACLE_ROLE to oracle addresses in Sarcophagus
    for (const oracle of ORACLE_ADDRESSES) {
      await sarcophagus.grantRole(ORACLE_ROLE, oracle);
      console.log("✅ Granted ORACLE_ROLE to Sarcophagus for:", oracle);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet",
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      contracts: {
        DeathVerifier: deathVerifierAddress,
        OBOL: obolAddress,
        B3TRRewards: b3trRewardsAddress,
        MultiSigWallet: multiSigAddress,
        Sarcophagus: sarcophagusAddress
      },
      tokenAddresses: {
        VTHO: VTHO_ADDRESS,
        B3TR: B3TR_ADDRESS,
        GLO: GLO_ADDRESS
      },
      oracleAddresses: ORACLE_ADDRESSES,
      multisig: {
        signers: MULTISIG_SIGNERS,
        weights: MULTISIG_WEIGHTS,
        threshold: MULTISIG_THRESHOLD
      }
    };

    fs.writeFileSync('deployment-testnet.json', JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 === DEPLOYMENT COMPLETE ===");
    console.log("📄 Deployment info saved to: deployment-testnet.json");
    console.log("\n📋 Contract Addresses:");
    console.log("DeathVerifier:", deathVerifierAddress);
    console.log("Sarcophagus:", sarcophagusAddress);
    console.log("OBOL Token:", obolAddress);
    console.log("B3TR Rewards:", b3trRewardsAddress);
    console.log("MultiSig Wallet:", multiSigAddress);
    console.log("\n🔗 Oracle Addresses:", ORACLE_ADDRESSES);
    console.log("\n🌐 Testnet Explorer: https://explore-testnet.vechain.org");
    console.log("🔍 View your contracts by searching the addresses above");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 