const { ethers } = require("ethers");
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
    // Create wallet from mnemonic
    const mnemonic = process.env.MNEMONIC;
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    
    // Create provider for VeChain testnet - using the correct RPC
    const provider = new ethers.JsonRpcProvider("https://testnet.vechain.energy/json-rpc");
    const connectedWallet = wallet.connect(provider);
    
    console.log("📋 Deploying contracts with account:", connectedWallet.address);
    
    const balance = await provider.getBalance(connectedWallet.address);
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
      connectedWallet.address, // Deployer as first signer
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

    // Load contract ABIs and bytecode
    const artifactsPath = './artifacts/contracts/';
    
    // 1. Deploy DeathVerifier
    console.log("📋 Deploying DeathVerifier...");
    const deathVerifierArtifact = JSON.parse(fs.readFileSync(artifactsPath + 'DeathVerifier.sol/DeathVerifier.json'));
    const deathVerifierFactory = new ethers.ContractFactory(
      deathVerifierArtifact.abi,
      deathVerifierArtifact.bytecode,
      connectedWallet
    );
    const deathVerifier = await deathVerifierFactory.deploy(ORACLE_ADDRESSES);
    await deathVerifier.waitForDeployment();
    console.log("✅ DeathVerifier deployed to:", await deathVerifier.getAddress());

    // 2. Deploy OBOL Token
    console.log("📋 Deploying OBOL Token...");
    const obolArtifact = JSON.parse(fs.readFileSync(artifactsPath + 'OBOL.sol/OBOL.json'));
    const obolFactory = new ethers.ContractFactory(
      obolArtifact.abi,
      obolArtifact.bytecode,
      connectedWallet
    );
    const obol = await obolFactory.deploy();
    await obol.waitForDeployment();
    console.log("✅ OBOL Token deployed to:", await obol.getAddress());

    // 3. Deploy MultiSig Wallet
    console.log("📋 Deploying MultiSig Wallet...");
    const multiSigArtifact = JSON.parse(fs.readFileSync(artifactsPath + 'MultiSigWallet.sol/MultiSigWallet.json'));
    const multiSigFactory = new ethers.ContractFactory(
      multiSigArtifact.abi,
      multiSigArtifact.bytecode,
      connectedWallet
    );
    const multiSigWallet = await multiSigFactory.deploy(MULTISIG_SIGNERS, MULTISIG_WEIGHTS, MULTISIG_THRESHOLD);
    await multiSigWallet.waitForDeployment();
    console.log("✅ MultiSig Wallet deployed to:", await multiSigWallet.getAddress());

    // 4. Deploy Sarcophagus (main contract)
    console.log("📋 Deploying Sarcophagus...");
    const sarcophagusArtifact = JSON.parse(fs.readFileSync(artifactsPath + 'Sarcophagus.sol/Sarcophagus.json'));
    const sarcophagusFactory = new ethers.ContractFactory(
      sarcophagusArtifact.abi,
      sarcophagusArtifact.bytecode,
      connectedWallet
    );
    const sarcophagus = await sarcophagusFactory.deploy(
      VTHO_ADDRESS,                     // _vthoToken
      B3TR_ADDRESS,                     // _b3trToken
      await obol.getAddress(),          // _obolToken
      GLO_ADDRESS,                      // _gloToken
      await deathVerifier.getAddress(), // _deathVerifier
      await obol.getAddress(),          // _obol (same as obolToken)
      await multiSigWallet.getAddress() // _feeCollector
    );
    await sarcophagus.waitForDeployment();
    console.log("✅ Sarcophagus deployed to:", await sarcophagus.getAddress());

    // 5. Deploy B3TR Rewards with correct sarcophagus address
    console.log("📋 Deploying B3TR Rewards...");
    const b3trRewardsArtifact = JSON.parse(fs.readFileSync(artifactsPath + 'B3TRRewards.sol/B3TRRewards.json'));
    const b3trRewardsFactory = new ethers.ContractFactory(
      b3trRewardsArtifact.abi,
      b3trRewardsArtifact.bytecode,
      connectedWallet
    );
    const b3trRewards = await b3trRewardsFactory.deploy(
      B3TR_ADDRESS,                     // _b3trToken
      await sarcophagus.getAddress(),   // _sarcophagusContract
      80                                // _rateAdjustmentThreshold
    );
    await b3trRewards.waitForDeployment();
    console.log("✅ B3TR Rewards deployed to:", await b3trRewards.getAddress());

    // Set up roles and permissions
    console.log("\n🔐 Setting up roles and permissions...");

    // Grant ORACLE_ROLE to oracle addresses
    for (const oracle of ORACLE_ADDRESSES) {
      await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), oracle);
      console.log("✅ Granted ORACLE_ROLE to:", oracle);
    }

    // Grant ADMIN_ROLE to deployer
    await deathVerifier.grantRole(await deathVerifier.ADMIN_ROLE(), connectedWallet.address);
    await obol.grantRole(await obol.ADMIN_ROLE(), connectedWallet.address);
    await b3trRewards.grantRole(await b3trRewards.ADMIN_ROLE(), connectedWallet.address);
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
      deployer: connectedWallet.address,
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