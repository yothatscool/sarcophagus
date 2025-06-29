const { ethers } = require("hardhat");

async function main() {
  console.log("🏛️ Deploying Sarcophagus Protocol to VeChain Testnet...");

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

  try {
    // 1. Deploy DeathVerifier
    console.log("\n📋 Step 1: Deploying DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy(ORACLE_ADDRESSES);
    console.log("✅ DeathVerifier deployed to:", deathVerifier.address);

    // 2. Deploy OBOL Token
    console.log("\n📋 Step 2: Deploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy();
    console.log("✅ OBOL Token deployed to:", obol.address);

    // 3. Deploy MultiSig Wallet
    console.log("\n📋 Step 3: Deploying MultiSig Wallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const signers = [deployer.address, "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"];
    const weights = [1, 1, 1];
    const threshold = 2;
    const multiSig = await MultiSigWallet.deploy(signers, weights, threshold);
    console.log("✅ MultiSig Wallet deployed to:", multiSig.address);

    // 4. Deploy Sarcophagus
    console.log("\n📋 Step 4: Deploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = await Sarcophagus.deploy(
      VTHO_ADDRESS,
      B3TR_ADDRESS,
      obol.address,
      GLO_ADDRESS,
      deathVerifier.address,
      obol.address,
      multiSig.address
    );
    console.log("✅ Sarcophagus deployed to:", sarcophagus.address);

    // 5. Deploy B3TR Rewards
    console.log("\n📋 Step 5: Deploying B3TR Rewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(
      B3TR_ADDRESS,
      sarcophagus.address,
      80
    );
    console.log("✅ B3TR Rewards deployed to:", b3trRewards.address);

    // 6. Set up roles and permissions
    console.log("\n🔐 Step 6: Setting up roles and permissions...");

    // Role constants
    const ORACLE_ROLE = "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6";
    const ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const REWARD_MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    const DEATH_VERIFIER_ROLE = "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6";

    // Grant oracle roles to DeathVerifier
    for (const oracle of ORACLE_ADDRESSES) {
      await deathVerifier.grantRole(ORACLE_ROLE, oracle);
      console.log(`✅ Granted ORACLE_ROLE to ${oracle} in DeathVerifier`);
    }

    // Grant admin role to deployer
    await deathVerifier.grantRole(ADMIN_ROLE, deployer.address);
    console.log("✅ Granted ADMIN_ROLE to deployer in DeathVerifier");

    // OBOL roles
    await obol.grantRole(ADMIN_ROLE, deployer.address);
    console.log("✅ Granted ADMIN_ROLE to deployer in OBOL");

    await obol.grantRole(REWARD_MINTER_ROLE, b3trRewards.address);
    console.log("✅ Granted REWARD_MINTER_ROLE to B3TR Rewards in OBOL");

    // Sarcophagus roles
    await sarcophagus.grantRole(DEATH_VERIFIER_ROLE, deathVerifier.address);
    console.log("✅ Granted DEATH_VERIFIER_ROLE to DeathVerifier in Sarcophagus");

    for (const oracle of ORACLE_ADDRESSES) {
      await sarcophagus.grantRole(ORACLE_ROLE, oracle);
      console.log(`✅ Granted ORACLE_ROLE to ${oracle} in Sarcophagus`);
    }

    // B3TR Rewards roles
    await b3trRewards.grantRole(ADMIN_ROLE, deployer.address);
    console.log("✅ Granted ADMIN_ROLE to deployer in B3TR Rewards");

    // 7. Save deployment addresses
    const deploymentInfo = {
      network: "VeChain Testnet",
      deployer: deployer.address,
      contracts: {
        deathVerifier: deathVerifier.address,
        obol: obol.address,
        multiSig: multiSig.address,
        sarcophagus: sarcophagus.address,
        b3trRewards: b3trRewards.address
      },
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      oracles: ORACLE_ADDRESSES,
      deploymentTime: new Date().toISOString()
    };

    // Save to file
    const fs = require('fs');
    fs.writeFileSync('vechain-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to: vechain-deployment.json");

    // 8. Display summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==================================");
    console.log("Network: VeChain Testnet");
    console.log("Deployer:", deployer.address);
    console.log("\nContract Addresses:");
    console.log("DeathVerifier:", deathVerifier.address);
    console.log("OBOL Token:", obol.address);
    console.log("MultiSig Wallet:", multiSig.address);
    console.log("Sarcophagus:", sarcophagus.address);
    console.log("B3TR Rewards:", b3trRewards.address);
    console.log("\nExplorer: https://explore-testnet.vechain.org");
    console.log("==================================");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 