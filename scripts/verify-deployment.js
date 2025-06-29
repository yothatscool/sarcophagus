const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🔍 Verifying deployment on VeChain Testnet...");

  try {
    // Read deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync('deployment-testnet.json', 'utf8'));
    
    const [deployer] = await ethers.getSigners();
    console.log("📋 Checking with account:", deployer.address);

    // Check each contract address
    for (const [contractName, address] of Object.entries(deploymentInfo.contracts)) {
      console.log(`\n🔍 Checking ${contractName} at ${address}...`);
      
      try {
        // Try to get the contract code
        const code = await ethers.provider.getCode(address);
        
        if (code === "0x") {
          console.log(`❌ ${contractName}: No contract deployed at this address`);
        } else {
          console.log(`✅ ${contractName}: Contract found (code length: ${code.length})`);
          
          // Try to get the contract instance
          try {
            let contract;
            switch (contractName) {
              case "DeathVerifier":
                contract = await ethers.getContractAt("DeathVerifier", address);
                break;
              case "OBOL":
                contract = await ethers.getContractAt("OBOL", address);
                break;
              case "Sarcophagus":
                contract = await ethers.getContractAt("Sarcophagus", address);
                break;
              case "B3TRRewards":
                contract = await ethers.getContractAt("B3TRRewards", address);
                break;
              case "MultiSigWallet":
                contract = await ethers.getContractAt("MultiSigWallet", address);
                break;
            }
            
            if (contract) {
              console.log(`   ✅ Contract interface working`);
            }
          } catch (error) {
            console.log(`   ⚠️ Contract interface error: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`❌ Error checking ${contractName}: ${error.message}`);
      }
    }

    // Check if all addresses are the same
    const addresses = Object.values(deploymentInfo.contracts);
    const uniqueAddresses = [...new Set(addresses)];
    
    if (uniqueAddresses.length === 1) {
      console.log("\n🚨 WARNING: All contracts have the same address!");
      console.log("This indicates a deployment issue with the VeChain plugin.");
    } else {
      console.log("\n✅ Contract addresses are unique");
    }

  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 