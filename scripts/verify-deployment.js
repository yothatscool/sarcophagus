const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Verifying testnet deployment...");

  try {
    // Read deployment info
    const deploymentPath = path.join(__dirname, '..', 'deployment-testnet.json');
    if (!fs.existsSync(deploymentPath)) {
      console.error("❌ deployment-testnet.json not found. Please run deploy-testnet.js first.");
      return;
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    console.log("📄 Verifying deployment on:", deploymentInfo.network);

    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Verify each contract
    const contracts = [
      { name: "DeathVerifier", address: deploymentInfo.contracts.DeathVerifier },
      { name: "Sarcophagus", address: deploymentInfo.contracts.Sarcophagus },
      { name: "OBOL", address: deploymentInfo.contracts.OBOL },
      { name: "B3TRRewards", address: deploymentInfo.contracts.B3TRRewards },
      { name: "MultiSigWallet", address: deploymentInfo.contracts.MultiSigWallet }
    ];

    console.log("\n🔍 Checking contract accessibility...");

    for (const contract of contracts) {
      try {
        // Check if contract exists at address
        const code = await ethers.provider.getCode(contract.address);
        
        if (code === "0x") {
          console.log(`❌ ${contract.name}: No contract found at ${contract.address}`);
        } else {
          console.log(`✅ ${contract.name}: Contract found at ${contract.address}`);
          
          // Try to get basic info
          try {
            const contractInstance = await ethers.getContractAt(contract.name, contract.address);
            
            // Check if it has basic functions
            if (contract.name === "DeathVerifier") {
              const oracleRole = await contractInstance.ORACLE_ROLE();
              console.log(`   - Oracle role: ${oracleRole}`);
            } else if (contract.name === "Sarcophagus") {
              const oracleRole = await contractInstance.ORACLE_ROLE();
              console.log(`   - Oracle role: ${oracleRole}`);
            } else if (contract.name === "OBOL") {
              const totalSupply = await contractInstance.totalSupply();
              console.log(`   - Total supply: ${ethers.formatEther(totalSupply)} OBOL`);
            } else if (contract.name === "B3TRRewards") {
              const sarcophagusAddress = await contractInstance.sarcophagus();
              console.log(`   - Sarcophagus address: ${sarcophagusAddress}`);
            } else if (contract.name === "MultiSigWallet") {
              const required = await contractInstance.required();
              console.log(`   - Required confirmations: ${required}`);
            }
          } catch (error) {
            console.log(`   - ⚠️  Could not verify contract functions: ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`❌ ${contract.name}: Error checking contract - ${error.message}`);
      }
    }

    // Check deployer roles
    console.log("\n🔑 Checking deployer roles...");
    
    try {
      const deathVerifier = await ethers.getContractAt("DeathVerifier", deploymentInfo.contracts.DeathVerifier);
      const sarcophagus = await ethers.getContractAt("Sarcophagus", deploymentInfo.contracts.Sarcophagus);
      
      const oracleRole = await deathVerifier.ORACLE_ROLE();
      const hasOracleRole = await deathVerifier.hasRole(oracleRole, deployer.address);
      console.log(`DeathVerifier Oracle Role: ${hasOracleRole ? '✅' : '❌'}`);
      
      const sarcophagusOracleRole = await sarcophagus.ORACLE_ROLE();
      const hasSarcophagusOracleRole = await sarcophagus.hasRole(sarcophagusOracleRole, deployer.address);
      console.log(`Sarcophagus Oracle Role: ${hasSarcophagusOracleRole ? '✅' : '❌'}`);
      
      const verifierRole = await sarcophagus.VERIFIER_ROLE();
      const hasVerifierRole = await sarcophagus.hasRole(verifierRole, deployer.address);
      console.log(`Sarcophagus Verifier Role: ${hasVerifierRole ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log(`❌ Error checking roles: ${error.message}`);
    }

    console.log("\n🎉 Deployment verification complete!");
    console.log("💡 If all checks pass, your deployment is ready for testing!");

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