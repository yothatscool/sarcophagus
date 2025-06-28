const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying Sarcophagus Protocol to VeChain Testnet...");

  // Check if we have a private key
  if (!process.env.PRIVATE_KEY && !process.env.MNEMONIC) {
    console.error("❌ Error: No PRIVATE_KEY or MNEMONIC found in .env file");
    console.log("Please add your private key to the .env file:");
    console.log("PRIVATE_KEY=your_private_key_here");
    console.log("Or use a mnemonic:");
    console.log("MNEMONIC=your_mnemonic_phrase_here");
    process.exit(1);
  }

  try {
    // Get deployer account
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
    console.log("✅ DeathVerifier deployed to:", await deathVerifier.getAddress());

    // 2. Deploy OBOL Token
    console.log("📋 Deploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy();
    await obol.waitForDeployment();
    console.log("✅ OBOL Token deployed to:", await obol.getAddress());

    // 3. Deploy B3TR Rewards
    console.log("📋 Deploying B3TR Rewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(await obol.getAddress());
    await b3trRewards.waitForDeployment();
    console.log("✅ B3TR Rewards deployed to:", await b3trRewards.getAddress());

    // 4. Deploy MultiSig Wallet
    console.log("📋 Deploying MultiSig Wallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(MULTISIG_SIGNERS, MULTISIG_WEIGHTS, MULTISIG_THRESHOLD);
    await multiSigWallet.waitForDeployment();
    console.log("✅ MultiSig Wallet deployed to:", await multiSigWallet.getAddress());

    // 5. Deploy Sarcophagus (main contract)
    console.log("📋 Deploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = await Sarcophagus.deploy(
      await deathVerifier.getAddress(),
      await obol.getAddress(),
      await b3trRewards.getAddress(),
      await multiSigWallet.getAddress(),
      VTHO_ADDRESS,
      B3TR_ADDRESS,
      GLO_ADDRESS
    );
    await sarcophagus.waitForDeployment();
    console.log("✅ Sarcophagus deployed to:", await sarcophagus.getAddress());

    // Set up roles and permissions
    console.log("\n🔐 Setting up roles and permissions...");

    // Grant ORACLE_ROLE to oracle addresses
    for (const oracle of ORACLE_ADDRESSES) {
      await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), oracle);
      console.log("✅ Granted ORACLE_ROLE to:", oracle);
    }

    // Grant ADMIN_ROLE to deployer
    await deathVerifier.grantRole(await deathVerifier.ADMIN_ROLE(), deployer.address);
    await obol.grantRole(await obol.ADMIN_ROLE(), deployer.address);
    await b3trRewards.grantRole(await b3trRewards.ADMIN_ROLE(), deployer.address);
    console.log("✅ Granted ADMIN_ROLE to deployer");

    // Grant REWARD_MINTER_ROLE to B3TR Rewards contract
    await obol.grantRole(await obol.REWARD_MINTER_ROLE(), await b3trRewards.getAddress());
    console.log("✅ Granted REWARD_MINTER_ROLE to B3TR Rewards");

    // Grant DEATH_VERIFIER_ROLE to DeathVerifier contract
    await sarcophagus.grantRole(await sarcophagus.DEATH_VERIFIER_ROLE(), await deathVerifier.getAddress());
    console.log("✅ Granted DEATH_VERIFIER_ROLE to DeathVerifier");

    // Grant ORACLE_ROLE to oracle addresses in Sarcophagus
    for (const oracle of ORACLE_ADDRESSES) {
      await sarcophagus.grantRole(await sarcophagus.ORACLE_ROLE(), oracle);
      console.log("✅ Granted ORACLE_ROLE to Sarcophagus for:", oracle);
    }

    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet",
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      contracts: {
        DeathVerifier: await deathVerifier.getAddress(),
        OBOL: await obol.getAddress(),
        B3TRRewards: await b3trRewards.getAddress(),
        MultiSigWallet: await multiSigWallet.getAddress(),
        Sarcophagus: await sarcophagus.getAddress()
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
    console.log("DeathVerifier:", await deathVerifier.getAddress());
    console.log("Sarcophagus:", await sarcophagus.getAddress());
    console.log("OBOL Token:", await obol.getAddress());
    console.log("B3TR Rewards:", await b3trRewards.getAddress());
    console.log("MultiSig Wallet:", await multiSigWallet.getAddress());
    console.log("\n🔗 Oracle Addresses:", ORACLE_ADDRESSES);
    console.log("\n🌐 Testnet Explorer: https://explore-testnet.vechain.org");
    console.log("🔍 View your contracts by searching the addresses above");
    
    // Update frontend configuration
    console.log("\n🔄 Updating frontend configuration...");
    try {
      const { updateFrontendConfig } = require('./update-frontend-config');
      await updateFrontendConfig(deploymentInfo);
      console.log("✅ Frontend configuration updated");
    } catch (error) {
      console.log("⚠️ Could not update frontend config:", error.message);
    }

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