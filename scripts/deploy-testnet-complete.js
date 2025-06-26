const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting Sarcophagus Protocol Testnet Deployment...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`📋 Deployer: ${deployer.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} VET\n`);

    // Check minimum balance
    const balance = await deployer.provider.getBalance(deployer.address);
    if (balance < ethers.parseEther("100")) {
        throw new Error("❌ Insufficient VET balance. Need at least 100 VET for deployment.");
    }

    console.log("📦 Deploying contracts...\n");

    // 1. Deploy Mock Tokens (if needed for testing)
    console.log("1️⃣ Deploying Mock Tokens...");
    const MockB3TR = await ethers.getContractFactory("MockB3TR");
    const mockB3TR = await MockB3TR.deploy();
    await mockB3TR.waitForDeployment();
    console.log(`   ✅ MockB3TR: ${await mockB3TR.getAddress()}`);

    const MockVTHO = await ethers.getContractFactory("MockVTHO");
    const mockVTHO = await MockVTHO.deploy();
    await mockVTHO.waitForDeployment();
    console.log(`   ✅ MockVTHO: ${await mockVTHO.getAddress()}`);

    // 2. Deploy OBOL Token
    console.log("\n2️⃣ Deploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy();
    await obol.waitForDeployment();
    console.log(`   ✅ OBOL: ${await obol.getAddress()}`);

    // 3. Deploy DeathVerifier
    console.log("\n3️⃣ Deploying DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();
    console.log(`   ✅ DeathVerifier: ${await deathVerifier.getAddress()}`);

    // 4. Deploy B3TRRewards
    console.log("\n4️⃣ Deploying B3TRRewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(await mockB3TR.getAddress(), ethers.ZeroAddress); // Sarcophagus address will be updated
    await b3trRewards.waitForDeployment();
    console.log(`   ✅ B3TRRewards: ${await b3trRewards.getAddress()}`);

    // 5. Deploy Sarcophagus
    console.log("\n5️⃣ Deploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = await Sarcophagus.deploy(
        await obol.getAddress(),
        await b3trRewards.getAddress(),
        await deathVerifier.getAddress(),
        await mockVTHO.getAddress()
    );
    await sarcophagus.waitForDeployment();
    console.log(`   ✅ Sarcophagus: ${await sarcophagus.getAddress()}`);

    // 6. Deploy MultiSigWallet
    console.log("\n6️⃣ Deploying MultiSigWallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy([deployer.address], 1); // Single signer for testing
    await multiSigWallet.waitForDeployment();
    console.log(`   ✅ MultiSigWallet: ${await multiSigWallet.getAddress()}`);

    console.log("\n🔧 Configuring contracts...\n");

    // 7. Configure B3TRRewards with Sarcophagus address
    console.log("7️⃣ Updating B3TRRewards with Sarcophagus address...");
    const updateB3TRTx = await b3trRewards.grantRole(await b3trRewards.VAULT_ROLE(), await sarcophagus.getAddress());
    await updateB3TRTx.wait();
    console.log("   ✅ B3TRRewards configured");

    // 8. Configure Sarcophagus with MultiSig
    console.log("\n8️⃣ Configuring Sarcophagus with MultiSig...");
    const updateSarcophagusTx = await sarcophagus.setMultiSigWallet(await multiSigWallet.getAddress());
    await updateSarcophagusTx.wait();
    console.log("   ✅ Sarcophagus configured");

    // 9. Grant roles
    console.log("\n9️⃣ Granting roles...");
    const grantObolTx = await obol.grantRole(await obol.VAULT_ROLE(), await sarcophagus.getAddress());
    await grantObolTx.wait();
    console.log("   ✅ OBOL roles granted");

    const grantDeathVerifierTx = await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), deployer.address);
    await grantDeathVerifierTx.wait();
    console.log("   ✅ DeathVerifier roles granted");

    // 10. Initialize tokens (mint some for testing)
    console.log("\n🔟 Initializing tokens for testing...");
    const mintB3TRTx = await mockB3TR.mint(await b3trRewards.getAddress(), ethers.parseEther("10000"));
    await mintB3TRTx.wait();
    console.log("   ✅ 10,000 B3TR minted to rewards contract");

    const mintVTHOTx = await mockVTHO.mint(deployer.address, ethers.parseEther("10000"));
    await mintVTHOTx.wait();
    console.log("   ✅ 10,000 VTHO minted to deployer");

    // 11. Save deployment info
    console.log("\n💾 Saving deployment information...");
    const deploymentInfo = {
        network: "vechain_testnet",
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            mockB3TR: await mockB3TR.getAddress(),
            mockVTHO: await mockVTHO.getAddress(),
            obol: await obol.getAddress(),
            deathVerifier: await deathVerifier.getAddress(),
            b3trRewards: await b3trRewards.getAddress(),
            sarcophagus: await sarcophagus.getAddress(),
            multiSigWallet: await multiSigWallet.getAddress()
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

    const deploymentPath = path.join(__dirname, "../deployment-testnet.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("   ✅ Deployment info saved to deployment-testnet.json");

    // 12. Generate frontend config
    console.log("\n🌐 Generating frontend configuration...");
    const frontendConfig = `# VeChain Testnet Contract Addresses
NEXT_PUBLIC_SARCOPHAGUS_ADDRESS=${await sarcophagus.getAddress()}
NEXT_PUBLIC_OBOL_ADDRESS=${await obol.getAddress()}
NEXT_PUBLIC_DEATH_VERIFIER_ADDRESS=${await deathVerifier.getAddress()}
NEXT_PUBLIC_VTHO_ADDRESS=${await mockVTHO.getAddress()}
NEXT_PUBLIC_B3TR_ADDRESS=${await mockB3TR.getAddress()}

# VeChain Network Configuration
NEXT_PUBLIC_VECHAIN_NETWORK=testnet
NEXT_PUBLIC_VECHAIN_RPC_URL=https://testnet.veblocks.net

# App Configuration
NEXT_PUBLIC_APP_NAME=Sarcophagus Protocol
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Secure Digital Inheritance on VeChain

# Security Configuration
NEXT_PUBLIC_MAX_BENEFICIARIES=5
NEXT_PUBLIC_MINIMUM_DEPOSIT=0.1
NEXT_PUBLIC_MINIMUM_LOCK_PERIOD=30

# OBOL Token Configuration
NEXT_PUBLIC_OBOL_TOTAL_SUPPLY=100000000
NEXT_PUBLIC_OBOL_INITIAL_SUPPLY=5000000
NEXT_PUBLIC_OBOL_REWARD_SUPPLY=95000000`;

    const frontendConfigPath = path.join(__dirname, "../frontend/.env.local");
    fs.writeFileSync(frontendConfigPath, frontendConfig);
    console.log("   ✅ Frontend config saved to frontend/.env.local");

    // 13. Verification summary
    console.log("\n✅ DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("📋 Contract Addresses:");
    console.log(`   MockB3TR: ${await mockB3TR.getAddress()}`);
    console.log(`   MockVTHO: ${await mockVTHO.getAddress()}`);
    console.log(`   OBOL: ${await obol.getAddress()}`);
    console.log(`   DeathVerifier: ${await deathVerifier.getAddress()}`);
    console.log(`   B3TRRewards: ${await b3trRewards.getAddress()}`);
    console.log(`   Sarcophagus: ${await sarcophagus.getAddress()}`);
    console.log(`   MultiSigWallet: ${await multiSigWallet.getAddress()}`);
    console.log("=".repeat(50));

    console.log("\n🎯 Next Steps:");
    console.log("1. Update frontend with new addresses");
    console.log("2. Test all contract functions");
    console.log("3. Run security tests");
    console.log("4. Test user flows");
    console.log("5. Launch testnet");

    console.log("\n📊 Gas Usage Summary:");
    // Note: Gas usage will be shown in the deployment output
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 