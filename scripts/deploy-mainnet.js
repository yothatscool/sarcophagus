const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting Sarcophagus Protocol Mainnet Deployment...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`📋 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} VET\n`);

    // Check minimum balance for mainnet
    const balance = await deployer.provider.getBalance(deployer.address);
    if (balance < ethers.parseEther("500")) {
        throw new Error("❌ Insufficient VET balance. Need at least 500 VET for mainnet deployment.");
    }

    console.log("⚠️  WARNING: This is a MAINNET deployment!");
    console.log("   This will deploy real contracts with real tokens.");
    console.log("   Make sure you have tested everything on testnet first.\n");

    console.log("📦 Deploying contracts...\n");

    // 1. Deploy OBOL Token (REAL TOKEN)
    console.log("1️⃣ Deploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy();
    await obol.waitForDeployment();
    console.log(`   ✅ OBOL: ${await obol.getAddress()}`);
    console.log(`   📊 Total Supply: 100,000,000 OBOL`);
    console.log(`   📊 Initial Supply: 5,000,000 OBOL (5%)`);
    console.log(`   📊 Reward Supply: 95,000,000 OBOL (95%)`);

    // 2. Deploy DeathVerifier
    console.log("\n2️⃣ Deploying DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();
    console.log(`   ✅ DeathVerifier: ${await deathVerifier.getAddress()}`);

    // 3. Deploy B3TRRewards
    console.log("\n3️⃣ Deploying B3TRRewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(ethers.ZeroAddress, ethers.ZeroAddress); // Sarcophagus address will be updated
    await b3trRewards.waitForDeployment();
    console.log(`   ✅ B3TRRewards: ${await b3trRewards.getAddress()}`);

    // 4. Deploy Sarcophagus
    console.log("\n4️⃣ Deploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = await Sarcophagus.deploy(
        await obol.getAddress(),
        await b3trRewards.getAddress(),
        await deathVerifier.getAddress(),
        "0x0000000000000000456E65726779" // Real VTHO token address on VeChain mainnet
    );
    await sarcophagus.waitForDeployment();
    console.log(`   ✅ Sarcophagus: ${await sarcophagus.getAddress()}`);

    // 5. Deploy MultiSigWallet
    console.log("\n5️⃣ Deploying MultiSigWallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy([deployer.address], 1); // Single signer initially
    await multiSigWallet.waitForDeployment();
    console.log(`   ✅ MultiSigWallet: ${await multiSigWallet.getAddress()}`);

    console.log("\n🔧 Configuring contracts...\n");

    // 6. Configure B3TRRewards with Sarcophagus address
    console.log("6️⃣ Updating B3TRRewards with Sarcophagus address...");
    const updateB3TRTx = await b3trRewards.grantRole(await b3trRewards.VAULT_ROLE(), await sarcophagus.getAddress());
    await updateB3TRTx.wait();
    console.log("   ✅ B3TRRewards configured");

    // 7. Configure Sarcophagus with MultiSig
    console.log("\n7️⃣ Configuring Sarcophagus with MultiSig...");
    const updateSarcophagusTx = await sarcophagus.setMultiSigWallet(await multiSigWallet.getAddress());
    await updateSarcophagusTx.wait();
    console.log("   ✅ Sarcophagus configured");

    // 8. Grant roles
    console.log("\n8️⃣ Granting roles...");
    const grantObolTx = await obol.grantRole(await obol.VAULT_ROLE(), await sarcophagus.getAddress());
    await grantObolTx.wait();
    console.log("   ✅ OBOL roles granted");

    const grantDeathVerifierTx = await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), deployer.address);
    await grantDeathVerifierTx.wait();
    console.log("   ✅ DeathVerifier roles granted");

    // 9. Save deployment info
    console.log("\n💾 Saving deployment information...");
    const deploymentInfo = {
        network: "vechain_mainnet",
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            obol: await obol.getAddress(),
            deathVerifier: await deathVerifier.getAddress(),
            b3trRewards: await b3trRewards.getAddress(),
            sarcophagus: await sarcophagus.getAddress(),
            multiSigWallet: await multiSigWallet.getAddress(),
            vthoToken: "0x0000000000000000456E65726779" // Real VTHO address
        },
        configuration: {
            obolTotalSupply: "100,000,000",
            obolInitialSupply: "5,000,000",
            obolRewardSupply: "95,000,000",
            b3trCarbonOffsetRate: "5%",
            b3trLegacyBonusBase: "3%",
            b3trLegacyBonusPerYear: "0.5%"
        }
    };

    const deploymentPath = path.join(__dirname, "../deployment-mainnet.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("   ✅ Deployment info saved to deployment-mainnet.json");

    // 10. Generate frontend config
    console.log("\n🌐 Generating frontend configuration...");
    const frontendConfig = `# VeChain Mainnet Contract Addresses
NEXT_PUBLIC_SARCOPHAGUS_ADDRESS=${await sarcophagus.getAddress()}
NEXT_PUBLIC_OBOL_ADDRESS=${await obol.getAddress()}
NEXT_PUBLIC_DEATH_VERIFIER_ADDRESS=${await deathVerifier.getAddress()}
NEXT_PUBLIC_VTHO_ADDRESS=0x0000000000000000456E65726779
NEXT_PUBLIC_B3TR_ADDRESS=${await b3trRewards.getAddress()}

# VeChain Network Configuration
NEXT_PUBLIC_VECHAIN_NETWORK=mainnet
NEXT_PUBLIC_VECHAIN_RPC_URL=https://mainnet.veblocks.net

# App Configuration
NEXT_PUBLIC_APP_NAME=Sarcophagus Protocol
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Secure Digital Inheritance on VeChain

# Security Configuration
NEXT_PUBLIC_MAX_BENEFICIARIES=5
NEXT_PUBLIC_MINIMUM_DEPOSIT=100
NEXT_PUBLIC_MINIMUM_LOCK_PERIOD=30

# OBOL Token Configuration
NEXT_PUBLIC_OBOL_TOTAL_SUPPLY=100000000
NEXT_PUBLIC_OBOL_INITIAL_SUPPLY=5000000
NEXT_PUBLIC_OBOL_REWARD_SUPPLY=95000000`;

    const frontendConfigPath = path.join(__dirname, "../frontend/.env.mainnet");
    fs.writeFileSync(frontendConfigPath, frontendConfig);
    console.log("   ✅ Frontend config saved to frontend/.env.mainnet");

    // 11. Verification summary
    console.log("\n✅ MAINNET DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("📋 Contract Addresses:");
    console.log(`   OBOL: ${await obol.getAddress()}`);
    console.log(`   DeathVerifier: ${await deathVerifier.getAddress()}`);
    console.log(`   B3TRRewards: ${await b3trRewards.getAddress()}`);
    console.log(`   Sarcophagus: ${await sarcophagus.getAddress()}`);
    console.log(`   MultiSigWallet: ${await multiSigWallet.getAddress()}`);
    console.log(`   VTHO Token: 0x0000000000000000456E65726779`);
    console.log("=".repeat(60));

    console.log("\n🎯 Next Steps:");
    console.log("1. Verify all contracts on VeChain Explorer");
    console.log("2. Update frontend with new addresses");
    console.log("3. Test all contract functions on mainnet");
    console.log("4. Set up proper multi-signature governance");
    console.log("5. Launch mainnet protocol");

    console.log("\n⚠️  IMPORTANT SECURITY NOTES:");
    console.log("- OBOL token is now live with 100M total supply");
    console.log("- Only 5M OBOL are initially available (5%)");
    console.log("- 95M OBOL are reserved for rewards (95%)");
    console.log("- Ensure proper access controls are in place");
    console.log("- Consider upgrading to multi-signature governance");

    console.log("\n📊 Tokenomics Summary:");
    console.log("- OBOL: 100M total supply, 5M initial, 95M rewards");
    console.log("- B3TR: DAO-controlled environmental rewards");
    console.log("- VTHO: Uses real VeChain VTHO token");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Mainnet deployment failed:", error);
        process.exit(1);
    });
