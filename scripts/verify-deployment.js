const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Verifying Sarcophagus Protocol deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  try {
    // Load deployment info
    const deploymentPath = "./deployments.json";
    
    if (!fs.existsSync(deploymentPath)) {
      console.log("❌ No deployment info found. Please run deployment first.");
      return;
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    console.log("📋 Deployment Info:", deploymentInfo.network, deploymentInfo.timestamp);

    // Verify contracts exist
    console.log("\n🔍 Verifying contract deployments...");
    
    const contracts = deploymentInfo.contracts;
    const verificationResults = {};

    for (const [name, address] of Object.entries(contracts)) {
      try {
        const code = await ethers.provider.getCode(address);
        if (code === "0x") {
          console.log(`❌ ${name}: Not deployed (no code at ${address})`);
          verificationResults[name] = false;
        } else {
          console.log(`✅ ${name}: Deployed at ${address}`);
          verificationResults[name] = true;
        }
      } catch (error) {
        console.log(`❌ ${name}: Error checking deployment - ${error.message}`);
        verificationResults[name] = false;
      }
    }

    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    
    if (verificationResults.Sarcophagus && verificationResults.OBOL) {
      try {
        const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
        const sarcophagus = Sarcophagus.attach(contracts.Sarcophagus);
        
        const OBOL = await ethers.getContractFactory("OBOL");
        const obol = OBOL.attach(contracts.OBOL);

        // Test basic contract calls
        const vaultRole = await obol.VAULT_ROLE();
        console.log("✅ Vault role retrieved:", vaultRole);

        const hasRole = await obol.hasRole(vaultRole, contracts.Sarcophagus);
        console.log("✅ Sarcophagus has vault role:", hasRole);

        console.log("✅ Basic functionality tests passed");
      } catch (error) {
        console.log("❌ Basic functionality test failed:", error.message);
      }
    }

    // Summary
    console.log("\n📊 Verification Summary:");
    const totalContracts = Object.keys(contracts).length;
    const deployedContracts = Object.values(verificationResults).filter(Boolean).length;
    
    console.log(`Contracts deployed: ${deployedContracts}/${totalContracts}`);
    
    if (deployedContracts === totalContracts) {
      console.log("🎉 All contracts deployed successfully!");
    } else {
      console.log("⚠️  Some contracts failed deployment verification");
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