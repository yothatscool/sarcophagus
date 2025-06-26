const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying NFT Whitelist Configuration...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying from account:", deployer.address);

    // Get the Sarcophagus contract (assuming it's already deployed)
    const sarcophagusAddress = process.env.SARCOPHAGUS_ADDRESS;
    if (!sarcophagusAddress) {
        throw new Error("SARCOPHAGUS_ADDRESS environment variable not set");
    }

    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = Sarcophagus.attach(sarcophagusAddress);

    console.log("📋 Configuring NFT Whitelist...");

    // Set global max NFT value (5 VET per NFT)
    const globalMaxValue = ethers.parseEther("5");
    await sarcophagus.connect(deployer).updateGlobalMaxNFTValue(globalMaxValue);
    console.log("✅ Global max NFT value set to:", ethers.formatEther(globalMaxValue), "VET");

    // Whitelist popular VeChain NFT collections with their max values
    const nftCollections = [
        {
            name: "VeChain VIP181 NFTs",
            address: "0x1234567890123456789012345678901234567890", // Replace with actual address
            maxValue: ethers.parseEther("10") // 10 VET max per NFT
        },
        {
            name: "VeChain Gaming NFTs",
            address: "0x2345678901234567890123456789012345678901", // Replace with actual address
            maxValue: ethers.parseEther("8") // 8 VET max per NFT
        },
        {
            name: "VeChain Art NFTs",
            address: "0x3456789012345678901234567890123456789012", // Replace with actual address
            maxValue: ethers.parseEther("15") // 15 VET max per NFT
        },
        {
            name: "VeChain Collectibles",
            address: "0x4567890123456789012345678901234567890123", // Replace with actual address
            maxValue: ethers.parseEther("12") // 12 VET max per NFT
        }
    ];

    console.log("📝 Whitelisting NFT collections...");
    for (const collection of nftCollections) {
        try {
            await sarcophagus.connect(deployer).whitelistNFTCollection(
                collection.address,
                collection.maxValue
            );
            console.log(`✅ Whitelisted: ${collection.name}`);
            console.log(`   Address: ${collection.address}`);
            console.log(`   Max Value: ${ethers.formatEther(collection.maxValue)} VET`);
        } catch (error) {
            console.log(`❌ Failed to whitelist ${collection.name}:`, error.message);
        }
    }

    // Verify whitelist configuration
    console.log("\n🔍 Verifying whitelist configuration...");
    
    const globalMax = await sarcophagus.globalMaxNFTValue();
    console.log("Global max NFT value:", ethers.formatEther(globalMax), "VET");

    for (const collection of nftCollections) {
        try {
            const [isWhitelisted, maxValue] = await sarcophagus.getNFTCollectionInfo(collection.address);
            if (isWhitelisted) {
                console.log(`✅ ${collection.name}: Whitelisted with max value ${ethers.formatEther(maxValue)} VET`);
            } else {
                console.log(`❌ ${collection.name}: Not whitelisted`);
            }
        } catch (error) {
            console.log(`❌ Error checking ${collection.name}:`, error.message);
        }
    }

    console.log("\n🎉 NFT Whitelist deployment completed!");
    console.log("\n📋 Summary:");
    console.log("- Global max NFT value:", ethers.formatEther(globalMax), "VET");
    console.log("- Whitelisted collections:", nftCollections.length);
    console.log("- Sarcophagus contract:", sarcophagusAddress);
    
    console.log("\n⚠️  IMPORTANT NOTES:");
    console.log("1. Update the NFT collection addresses with real VeChain NFT contract addresses");
    console.log("2. Adjust max values based on actual market conditions");
    console.log("3. Consider implementing a DAO governance system for whitelist management");
    console.log("4. Monitor NFT market prices and adjust caps as needed");
}

// Helper function to add a new NFT collection to whitelist
async function addNFTCollection(sarcophagusAddress, collectionAddress, collectionName, maxValue) {
    const [deployer] = await ethers.getSigners();
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = Sarcophagus.attach(sarcophagusAddress);

    try {
        await sarcophagus.connect(deployer).whitelistNFTCollection(collectionAddress, maxValue);
        console.log(`✅ Added ${collectionName} to whitelist with max value ${ethers.formatEther(maxValue)} VET`);
    } catch (error) {
        console.log(`❌ Failed to add ${collectionName}:`, error.message);
    }
}

// Helper function to remove an NFT collection from whitelist
async function removeNFTCollection(sarcophagusAddress, collectionAddress, collectionName) {
    const [deployer] = await ethers.getSigners();
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = Sarcophagus.attach(sarcophagusAddress);

    try {
        await sarcophagus.connect(deployer).removeNFTCollection(collectionAddress);
        console.log(`✅ Removed ${collectionName} from whitelist`);
    } catch (error) {
        console.log(`❌ Failed to remove ${collectionName}:`, error.message);
    }
}

// Helper function to update collection max value
async function updateCollectionMaxValue(sarcophagusAddress, collectionAddress, collectionName, newMaxValue) {
    const [deployer] = await ethers.getSigners();
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = Sarcophagus.attach(sarcophagusAddress);

    try {
        await sarcophagus.connect(deployer).updateNFTCollectionMaxValue(collectionAddress, newMaxValue);
        console.log(`✅ Updated ${collectionName} max value to ${ethers.formatEther(newMaxValue)} VET`);
    } catch (error) {
        console.log(`❌ Failed to update ${collectionName}:`, error.message);
    }
}

// Export helper functions for use in other scripts
module.exports = {
    addNFTCollection,
    removeNFTCollection,
    updateCollectionMaxValue
};

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
} 