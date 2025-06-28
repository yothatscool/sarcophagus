const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying Sarcophagus Protocol to VeChain Testnet...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "VET");

  // Testnet token addresses on VeChain Testnet
  const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699"; // B3TR testnet address
  const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779"; // VTHO address (same on testnet)
  const GLO_ADDRESS = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e"; // GLO testnet address
  
  // MultiSig signer addresses with weights
  const MULTISIG_SIGNERS = [
    "0x3d32fE6e85066240f3018c9FC664db7967d2d313", // Main protocol address (40% weight)
    "0x73f121d48ec8028a9a0e01166bbf6dec669ac940", // Signer 2 (25% weight)
    "0x804d23410d548594db9eabbb4ed2894f591e9d72", // Signer 3 (20% weight)
    "0x1b0a35f55c02f97fd9ab0af3980ca11eb8067a90", // Signer 4 (10% weight)
    "0xd0c282e767c9ea8fe773fba6c6847e7dd2a905c6"  // Signer 5 (5% weight)
  ];
  
  const MULTISIG_WEIGHTS = [40, 25, 20, 10, 5]; // Weights in percentage
  const REQUIRED_WEIGHT = 60; // 60% required for standard actions
  
  // Oracle addresses for death verification
  const ORACLE_ADDRESSES = [
    "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
    "0xa19f660abf4fed45226787cd17ef723d94d1ce31", 
    "0xe791fec915dffd49f7353d826bbc361183f5ae22",
    "0x24a939b60cfcbcca540259c0a06d83369d9b534f",
    "0xbb8c80bc4ef02737493b1cfdf240e6ed7d20292d"
  ];
  
  console.log("\nUsing token addresses:");
  console.log("B3TR:", B3TR_ADDRESS);
  console.log("VTHO:", VTHO_ADDRESS);
  console.log("GLO:", GLO_ADDRESS);
  console.log("VET: Native token (no contract address)");
  
  console.log("\nMultiSig Configuration:");
  console.log("Signers:", MULTISIG_SIGNERS);
  console.log("Weights:", MULTISIG_WEIGHTS);
  console.log("Required Weight:", REQUIRED_WEIGHT + "%");
  
  console.log("\nOracle Addresses:", ORACLE_ADDRESSES);

  const deploymentInfo = {
    network: "VeChain Testnet",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {},
    multisig: {
      signers: MULTISIG_SIGNERS,
      weights: MULTISIG_WEIGHTS,
      requiredWeight: REQUIRED_WEIGHT
    },
    oracles: ORACLE_ADDRESSES
  };

  try {
    // Deploy DeathVerifier first
    console.log("\nDeploying DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();
    console.log("DeathVerifier deployed to:", await deathVerifier.getAddress());
    deploymentInfo.contracts.DeathVerifier = await deathVerifier.getAddress();

    // Deploy MultiSig Wallet
    console.log("\nDeploying MultiSig Wallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(MULTISIG_SIGNERS, MULTISIG_WEIGHTS, REQUIRED_WEIGHT);
    await multiSigWallet.waitForDeployment();
    console.log("MultiSig Wallet deployed to:", await multiSigWallet.getAddress());
    deploymentInfo.contracts.MultiSigWallet = await multiSigWallet.getAddress();

    // Deploy OBOL Token
    console.log("\nDeploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy();
    await obol.waitForDeployment();
    console.log("OBOL Token deployed to:", await obol.getAddress());
    deploymentInfo.contracts.OBOL = await obol.getAddress();

    // Deploy Sarcophagus first (needed for B3TR Rewards)
    console.log("\nDeploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = await Sarcophagus.deploy(
      VTHO_ADDRESS,                     // _vthoToken
      B3TR_ADDRESS,                     // _b3trToken
      await obol.getAddress(),          // _obolToken
      GLO_ADDRESS,                      // _gloToken
      await deathVerifier.getAddress(), // _deathVerifier
      await obol.getAddress(),          // _obol (same as obolToken)
      await multiSigWallet.getAddress() // _feeCollector
    );
    await sarcophagus.waitForDeployment();
    console.log("Sarcophagus deployed to:", await sarcophagus.getAddress());
    deploymentInfo.contracts.Sarcophagus = await sarcophagus.getAddress();

    // Deploy B3TR Rewards with correct sarcophagus address
    console.log("\nDeploying B3TR Rewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(
      B3TR_ADDRESS,                     // _b3trToken
      await sarcophagus.getAddress(),   // _sarcophagusContract
      80                                // _rateAdjustmentThreshold
    );
    await b3trRewards.waitForDeployment();
    console.log("B3TR Rewards deployed to:", await b3trRewards.getAddress());
    deploymentInfo.contracts.B3TRRewards = await b3trRewards.getAddress();

    // Set up roles and permissions
    console.log("\nSetting up roles and permissions...");
    
    // Grant oracle roles to all oracle addresses
    for (const oracleAddress of ORACLE_ADDRESSES) {
      await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), oracleAddress);
      console.log("Granted ORACLE_ROLE to:", oracleAddress);
    }
    
    // Grant admin roles to MultiSig wallet
    await sarcophagus.grantRole(await sarcophagus.DEFAULT_ADMIN_ROLE(), await multiSigWallet.getAddress());
    await deathVerifier.grantRole(await deathVerifier.DEFAULT_ADMIN_ROLE(), await multiSigWallet.getAddress());
    await obol.grantRole(await obol.DEFAULT_ADMIN_ROLE(), await multiSigWallet.getAddress());
    await b3trRewards.grantRole(await b3trRewards.DEFAULT_ADMIN_ROLE(), await multiSigWallet.getAddress());
    
    // Grant VAULT_ROLE to sarcophagus in B3TRRewards
    await b3trRewards.grantRole(await b3trRewards.VAULT_ROLE(), await sarcophagus.getAddress());
    
    console.log("Roles configured successfully");

    // Save deployment information
    const deploymentPath = path.join(__dirname, '..', 'deployment-testnet.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n=== DEPLOYMENT COMPLETE ===");
    console.log("Deployment info saved to: deployment-testnet.json");
    console.log("\nContract Addresses:");
    console.log("DeathVerifier:", await deathVerifier.getAddress());
    console.log("Sarcophagus:", await sarcophagus.getAddress());
    console.log("OBOL Token:", await obol.getAddress());
    console.log("B3TR Rewards:", await b3trRewards.getAddress());
    console.log("MultiSig Wallet:", await multiSigWallet.getAddress());
    console.log("\nOracle Addresses:", ORACLE_ADDRESSES);
    console.log("\nTestnet Explorer: https://explore-testnet.vechain.org");
    
    // Update frontend configuration
    console.log("\nUpdating frontend configuration...");
    try {
      const { updateFrontendConfig } = require('./update-frontend-config.js');
      await updateFrontendConfig();
      console.log("Frontend configuration updated successfully");
    } catch (error) {
      console.log("Frontend configuration update failed:", error.message);
      console.log("You can manually run: npx hardhat run scripts/update-frontend-config.js");
    }
    
    console.log("\n=== NEXT STEPS ===");
    console.log("1. Verify contracts on VeChain testnet explorer");
    console.log("2. Test all functions on testnet");
    console.log("3. Test oracle death verification with provided addresses");
    console.log("4. Frontend is ready to connect to testnet contracts");
    console.log("5. Deploy frontend to Vercel for public testing");

  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 