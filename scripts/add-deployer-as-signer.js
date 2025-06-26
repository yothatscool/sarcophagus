const { ethers } = require("hardhat");

async function main() {
    console.log("🔐 Adding Deployer as Multi-Sig Signer...\n");

    // Multi-sig wallet address
    const MULTISIG_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    
    // Get signers
    const [deployer] = await ethers.getSigners();
    
    console.log("📋 Configuration:");
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Multi-Sig Wallet: ${MULTISIG_ADDRESS}`);
    console.log("");

    // Get multi-sig contract
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = MultiSigWallet.attach(MULTISIG_ADDRESS);

    try {
        // Add deployer as a signer with weight 1
        console.log("🔄 Adding deployer as multi-sig signer...");
        const tx = await multiSigWallet.connect(deployer).addSigner(deployer.address, 1);
        await tx.wait();
        
        console.log("✅ Deployer added as multi-sig signer successfully!");
        
        // Verify the addition
        const signer = await multiSigWallet.signers(deployer.address);
        console.log(`\n📋 Signer Status:`);
        console.log(`  Address: ${deployer.address}`);
        console.log(`  Is Active: ${signer.isActive}`);
        console.log(`  Weight: ${signer.weight}`);
        
        // Get updated signer count and total weight
        const signerCount = await multiSigWallet.getSignerCount();
        const totalWeight = await multiSigWallet.totalWeight();
        console.log(`\n📊 Multi-Sig Stats:`);
        console.log(`  Total Signers: ${signerCount}`);
        console.log(`  Total Weight: ${totalWeight}`);
        
        console.log("\n🎉 Deployer can now perform admin functions through the multi-sig wallet!");
        console.log("\n📋 How it works:");
        console.log("1. Deployer submits admin transaction to multi-sig wallet");
        console.log("2. Deployer confirms their own transaction");
        console.log("3. If required weight is met, transaction can be executed after timelock");
        console.log("4. For single-person operations, you can set required weight to 1");
        
    } catch (error) {
        console.error("❌ Error adding deployer as signer:", error.message);
        
        // Check if deployer already has admin role
        const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
        const hasAdminRole = await multiSigWallet.hasRole(adminRole, deployer.address);
        
        if (hasAdminRole) {
            console.log("\n✅ Deployer already has ADMIN_ROLE on multi-sig wallet");
            console.log("This means they can add themselves as a signer");
        } else {
            console.log("\n❌ Deployer doesn't have ADMIN_ROLE on multi-sig wallet");
            console.log("This is a problem - we need to fix this!");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    }); 