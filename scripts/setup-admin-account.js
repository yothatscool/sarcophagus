const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Setting up Admin Account for Deployment...");
  
  const ADMIN_ACCOUNT = "0xB0aD1FeF773d66f650712a89F529406C3B9d8383";
  
  console.log("\n📋 Current Configuration:");
  console.log("Admin Account:", ADMIN_ACCOUNT);
  console.log("PRIVATE_KEY set:", !!process.env.PRIVATE_KEY);
  console.log("ADMIN_PRIVATE_KEY set:", !!process.env.ADMIN_PRIVATE_KEY);
  
  // Check if we can create a signer
  try {
    const provider = ethers.provider;
    const privateKey = process.env.PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY;
    
    if (!privateKey) {
      console.log("\n❌ No private key found!");
      console.log("Please set one of these environment variables:");
      console.log("- PRIVATE_KEY: Your admin account private key");
      console.log("- ADMIN_PRIVATE_KEY: Your admin account private key");
      console.log("\nExample: export PRIVATE_KEY=0x1234...");
      return;
    }
    
    const signer = new ethers.Wallet(privateKey, provider);
    console.log("✅ Signer created successfully");
    console.log("Signer address:", signer.address);
    
    if (signer.address.toLowerCase() !== ADMIN_ACCOUNT.toLowerCase()) {
      console.log("\n⚠️  Warning: Signer address doesn't match admin account!");
      console.log("Expected:", ADMIN_ACCOUNT);
      console.log("Got:", signer.address);
      console.log("\nPlease check your private key configuration.");
    } else {
      console.log("✅ Signer address matches admin account");
      
      // Check balance
      const balance = await provider.getBalance(signer.address);
      console.log("VET Balance:", ethers.formatEther(balance), "VET");
      
      if (balance > ethers.parseEther("1")) {
        console.log("✅ Sufficient VET for deployment");
      } else {
        console.log("❌ Insufficient VET for deployment");
      }
    }
    
  } catch (error) {
    console.log("❌ Error creating signer:", error.message);
    console.log("Please check your private key format.");
  }
  
  console.log("\n🚀 Ready to deploy with admin account!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 