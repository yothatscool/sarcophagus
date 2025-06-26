const { ethers, network } = require("hardhat");

async function main() {
    console.log("🚀 Deploying Multi-Sig Wallet for Sarcophagus Protocol...\n");

    // Get signers
    const [deployer, signer1, signer2, signer3] = await ethers.getSigners();
    
    console.log("📋 Deployment Configuration:");
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Signer 1: ${signer1.address}`);
    console.log(`Signer 2: ${signer2.address}`);
    console.log(`Signer 3: ${signer3.address}`);
    console.log("");

    // Initial signers and weights (3-of-3 multi-sig)
    const initialSigners = [
        signer1.address,
        signer2.address,
        signer3.address
    ];
    
    const weights = [1, 1, 1]; // Equal weights
    const requiredWeight = 2; // 2-of-3 required for execution

    console.log("⚙️ Multi-Sig Configuration:");
    console.log(`- Signers: ${initialSigners.length}`);
    console.log(`- Required Weight: ${requiredWeight}`);
    console.log(`- Timelock Delay: 24 hours`);
    console.log("");

    // Deploy MultiSigWallet
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(
        initialSigners,
        weights,
        requiredWeight
    );
    console.log('DEBUG: multiSigWallet object:', multiSigWallet);
    console.log("✅ Multi-Sig Wallet deployed successfully!");
    console.log(`Contract Address: ${multiSigWallet.target}`);
    console.log("");

    // Verify deployment
    console.log("🔍 Verifying deployment...");
    
    const signerCount = await multiSigWallet.getSignerCount();
    const totalWeight = await multiSigWallet.totalWeight();
    const requiredWeightDeployed = await multiSigWallet.requiredWeight();
    
    console.log(`✅ Signer Count: ${signerCount}`);
    console.log(`✅ Total Weight: ${totalWeight}`);
    console.log(`✅ Required Weight: ${requiredWeightDeployed}`);
    console.log("");

    // Get signer addresses
    const signerAddresses = await multiSigWallet.getSignerAddresses();
    console.log("📝 Active Signers:");
    for (let i = 0; i < signerAddresses.length; i++) {
        const signer = await multiSigWallet.signers(signerAddresses[i]);
        console.log(`  ${i + 1}. ${signerAddresses[i]} (Weight: ${signer.weight})`);
    }
    console.log("");

    // Test basic functionality
    console.log("🧪 Testing basic functionality...");
    
    // Test if deployer has admin role
    const hasAdminRole = await multiSigWallet.hasRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE")),
        deployer.address
    );
    console.log(`✅ Deployer has admin role: ${hasAdminRole}`);
    
    // Test if signers have executor role
    const executorRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("EXECUTOR_ROLE"));
    for (let i = 0; i < signerAddresses.length; i++) {
        const hasExecutorRole = await multiSigWallet.hasRole(executorRole, signerAddresses[i]);
        console.log(`✅ Signer ${i + 1} has executor role: ${hasExecutorRole}`);
    }
    console.log("");

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        multiSigWallet: multiSigWallet.target,
        deployer: deployer.address,
        signers: signerAddresses,
        weights: weights,
        requiredWeight: requiredWeight.toString(),
        timelockDelay: "86400", // 24 hours in seconds
        deploymentTime: new Date().toISOString()
    };

    console.log("📄 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log("");

    console.log("🎉 Multi-Sig Wallet deployment completed successfully!");
    console.log("");
    console.log("📋 Next Steps:");
    console.log("1. Verify contract on block explorer");
    console.log("2. Set up multi-sig wallet integration with Sarcophagus contracts");
    console.log("3. Transfer admin roles to multi-sig wallet");
    console.log("4. Test multi-sig functionality with real transactions");
    console.log("");

    return multiSigWallet;
}

// Helper function to get network name
function getNetworkName() {
    const network = process.env.HARDHAT_NETWORK || "localhost";
    return network;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 