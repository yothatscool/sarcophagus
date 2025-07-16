const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking All Possible Contract Deployments...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Checking with account:", deployer.address);
    
    // Get current nonce
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("Current nonce:", nonce);
    
    // Check addresses for the last 10 nonces
    console.log("\n📋 Checking recent deployment addresses...");
    
    for (let i = 0; i < 10; i++) {
      const checkNonce = nonce - i;
      if (checkNonce < 0) break;
      
      // Calculate the address that would be used for this nonce
      const address = ethers.getCreateAddress({
        from: deployer.address,
        nonce: checkNonce
      });
      
      console.log(`\nNonce ${checkNonce}: ${address}`);
      
      // Check if there's code at this address
      const code = await ethers.provider.getCode(address);
      const hasCode = code !== "0x";
      
      if (hasCode) {
        console.log(`  ✅ CONTRACT FOUND! Code length: ${code.length}`);
        
        // Try to identify what type of contract it is
        try {
          // Try OBOL first
          const OBOL = await ethers.getContractFactory("OBOL");
          const obol = OBOL.attach(address);
          const name = await obol.name();
          console.log(`  🪙 OBOL Token: ${name}`);
        } catch (error) {
          try {
            // Try Sarcophagus
            const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
            const sarcophagus = Sarcophagus.attach(address);
            const minDeposit = await sarcophagus.MIN_DEPOSIT();
            console.log(`  ⚰️ Sarcophagus: Min Deposit ${ethers.formatEther(minDeposit)} VET`);
          } catch (error) {
            try {
              // Try DeathVerifier
              const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
              const deathVerifier = DeathVerifier.attach(address);
              const expiry = await deathVerifier.VERIFICATION_EXPIRY();
              console.log(`  💀 DeathVerifier: Expiry ${expiry.toString()}`);
            } catch (error) {
              try {
                // Try B3TRRewards
                const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
                const b3trRewards = B3TRRewards.attach(address);
                const threshold = await b3trRewards.rateAdjustmentThreshold();
                console.log(`  🎁 B3TRRewards: Threshold ${threshold.toString()}`);
              } catch (error) {
                try {
                  // Try MultiSigWallet
                  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
                  const multiSig = MultiSigWallet.attach(address);
                  const requiredWeight = await multiSig.requiredWeight();
                  console.log(`  🔐 MultiSigWallet: Required Weight ${requiredWeight.toString()}`);
                } catch (error) {
                  console.log(`  ❓ Unknown contract type`);
                }
              }
            }
          }
        }
      } else {
        console.log(`  ❌ No contract code`);
      }
    }
    
    // Check specific addresses from deployment files
    console.log("\n📋 Checking addresses from deployment files...");
    
    const deploymentFiles = [
      'deployments.json',
      'vechain-deployment-data.json',
      'vechain-assisted-deployment.json',
      'vechain-manual-deployment-data.json',
      'sync2-deployment-data.json',
      'simple-deployment.json',
      'correct-deployment.json'
    ];
    
    for (const file of deploymentFiles) {
      try {
        const fs = require('fs');
        if (fs.existsSync(file)) {
          const data = JSON.parse(fs.readFileSync(file, 'utf8'));
          console.log(`\n📄 ${file}:`);
          
          if (data.address) {
            console.log(`  Address: ${data.address}`);
            const code = await ethers.provider.getCode(data.address);
            console.log(`  Has code: ${code !== "0x"}`);
          } else if (data.contracts) {
            for (const [name, address] of Object.entries(data.contracts)) {
              console.log(`  ${name}: ${address}`);
              const code = await ethers.provider.getCode(address);
              console.log(`    Has code: ${code !== "0x"}`);
            }
          }
        }
      } catch (error) {
        // File doesn't exist or can't be read
      }
    }
    
    console.log("\n💡 Recommendations:");
    console.log("1. If you have old deployments, you might want to:");
    console.log("   - Use different accounts for new deployments");
    console.log("   - Deploy to mainnet instead of testnet");
    console.log("   - Clear the testnet state (if possible)");
    console.log("2. For testing, you can use the existing deployed contracts");
    console.log("3. Update your frontend config to use the correct addresses");
    
  } catch (error) {
    console.error("❌ Error checking deployments:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 