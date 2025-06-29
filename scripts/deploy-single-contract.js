// Single Contract Deployment Test
// Deploy just DeathVerifier with timeout handling

require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');
const fs = require('fs');

async function main() {
  console.log("🧪 Testing single contract deployment...");

  // Load the stable key
  let keyData;
  try {
    keyData = JSON.parse(fs.readFileSync('stable-key.json', 'utf8'));
  } catch (error) {
    console.log("❌ No stable key found. Run: node scripts/generate-stable-key.js");
    return;
  }

  // Initialize Web3 with Thorify
  const web3 = thorify(new Web3(), "https://testnet.veblocks.net");
  
  // Add the stable account
  const account = web3.eth.accounts.privateKeyToAccount(keyData.privateKey);
  web3.eth.accounts.wallet.add(account);
  
  console.log("👤 Deployer address:", account.address);
  
  // Check balance
  const balance = await web3.eth.getBalance(account.address);
  console.log("💰 Balance:", web3.utils.fromWei(balance, 'ether'), "VET");

  try {
    // Load DeathVerifier artifact only
    const artifactPath = `./artifacts/contracts/DeathVerifier.sol/DeathVerifier.json`;
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    console.log("✅ DeathVerifier artifact loaded");

    // Deploy DeathVerifier with timeout
    console.log("\n📋 Deploying DeathVerifier...");
    console.log("⏱️  This will timeout after 2 minutes if it doesn't complete");
    
    const deathVerifierContract = new web3.eth.Contract(artifact.abi);
    const deathVerifierDeploy = deathVerifierContract.deploy({
      data: artifact.bytecode,
      arguments: []
    });

    // Set a timeout for the deployment
    const deploymentPromise = deathVerifierDeploy.send({
      from: account.address,
      gas: 1500000 // Lower gas limit
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Deployment timeout after 2 minutes')), 120000);
    });

    try {
      const deathVerifierTx = await Promise.race([deploymentPromise, timeoutPromise]);
      console.log("✅ DeathVerifier deployed to:", deathVerifierTx.contractAddress);
      
      // Save the result
      const result = {
        contract: "DeathVerifier",
        address: deathVerifierTx.contractAddress,
        deployer: account.address,
        deploymentTime: new Date().toISOString()
      };
      
      fs.writeFileSync('deathverifier-deployment.json', JSON.stringify(result, null, 2));
      console.log("📄 Deployment info saved to: deathverifier-deployment.json");
      
    } catch (error) {
      console.log("❌ Deployment failed:", error.message);
      
      if (error.message.includes('timeout')) {
        console.log("\n💡 Suggestions:");
        console.log("1. Check your internet connection");
        console.log("2. Try a different VeChain RPC endpoint");
        console.log("3. Check if you have enough VTHO for gas");
        console.log("4. Try again in a few minutes");
      }
    }

  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 