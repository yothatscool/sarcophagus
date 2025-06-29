// Simple VeChain Deployment Script
// Uses lower gas limits and better error handling

require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');
const fs = require('fs');

async function main() {
  console.log("🏛️ Simple VeChain Deployment...");

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

  // Contract addresses for testnet
  const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779";
  const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
  const GLO_ADDRESS = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e";

  try {
    // Load contract artifacts
    const contracts = {};
    const contractNames = ['DeathVerifier', 'OBOL', 'MultiSigWallet', 'Sarcophagus', 'B3TRRewards'];
    
    for (const name of contractNames) {
      const artifactPath = `./artifacts/contracts/${name}.sol/${name}.json`;
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      contracts[name] = {
        bytecode: artifact.bytecode,
        abi: artifact.abi
      };
    }

    console.log("✅ Contract artifacts loaded");

    const deployedAddresses = {};

    // 1. Deploy DeathVerifier with lower gas
    console.log("\n📋 Step 1: Deploying DeathVerifier...");
    try {
      const deathVerifierContract = new web3.eth.Contract(contracts.DeathVerifier.abi);
      const deathVerifierDeploy = deathVerifierContract.deploy({
        data: contracts.DeathVerifier.bytecode,
        arguments: []
      });

      const deathVerifierTx = await deathVerifierDeploy.send({
        from: account.address,
        gas: 2000000 // Lower gas limit
      });

      console.log("✅ DeathVerifier deployed to:", deathVerifierTx.contractAddress);
      deployedAddresses.deathVerifier = deathVerifierTx.contractAddress;
    } catch (error) {
      console.log("❌ DeathVerifier deployment failed:", error.message);
      return;
    }

    // Wait between deployments
    console.log("⏳ Waiting 10 seconds...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 2. Deploy OBOL Token
    console.log("\n📋 Step 2: Deploying OBOL Token...");
    try {
      const obolContract = new web3.eth.Contract(contracts.OBOL.abi);
      const obolDeploy = obolContract.deploy({
        data: contracts.OBOL.bytecode,
        arguments: []
      });

      const obolTx = await obolDeploy.send({
        from: account.address,
        gas: 2000000
      });

      console.log("✅ OBOL Token deployed to:", obolTx.contractAddress);
      deployedAddresses.obol = obolTx.contractAddress;
    } catch (error) {
      console.log("❌ OBOL deployment failed:", error.message);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 10000));

    // 3. Deploy MultiSig Wallet
    console.log("\n📋 Step 3: Deploying MultiSig Wallet...");
    try {
      const multiSigContract = new web3.eth.Contract(contracts.MultiSigWallet.abi);
      const signers = [account.address, "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"];
      const weights = [1, 1, 1];
      const threshold = 2;

      const multiSigDeploy = multiSigContract.deploy({
        data: contracts.MultiSigWallet.bytecode,
        arguments: [signers, weights, threshold]
      });

      const multiSigTx = await multiSigDeploy.send({
        from: account.address,
        gas: 2000000
      });

      console.log("✅ MultiSig Wallet deployed to:", multiSigTx.contractAddress);
      deployedAddresses.multiSig = multiSigTx.contractAddress;
    } catch (error) {
      console.log("❌ MultiSig deployment failed:", error.message);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 10000));

    // 4. Deploy Sarcophagus
    console.log("\n📋 Step 4: Deploying Sarcophagus...");
    try {
      const sarcophagusContract = new web3.eth.Contract(contracts.Sarcophagus.abi);
      const sarcophagusDeploy = sarcophagusContract.deploy({
        data: contracts.Sarcophagus.bytecode,
        arguments: [
          VTHO_ADDRESS,
          B3TR_ADDRESS,
          deployedAddresses.obol,
          GLO_ADDRESS,
          deployedAddresses.deathVerifier,
          deployedAddresses.obol,
          deployedAddresses.multiSig
        ]
      });

      const sarcophagusTx = await sarcophagusDeploy.send({
        from: account.address,
        gas: 5000000
      });

      console.log("✅ Sarcophagus deployed to:", sarcophagusTx.contractAddress);
      deployedAddresses.sarcophagus = sarcophagusTx.contractAddress;
    } catch (error) {
      console.log("❌ Sarcophagus deployment failed:", error.message);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 10000));

    // 5. Deploy B3TR Rewards
    console.log("\n📋 Step 5: Deploying B3TR Rewards...");
    try {
      const b3trRewardsContract = new web3.eth.Contract(contracts.B3TRRewards.abi);
      const b3trRewardsDeploy = b3trRewardsContract.deploy({
        data: contracts.B3TRRewards.bytecode,
        arguments: [
          B3TR_ADDRESS,
          deployedAddresses.sarcophagus,
          80
        ]
      });

      const b3trRewardsTx = await b3trRewardsDeploy.send({
        from: account.address,
        gas: 3000000
      });

      console.log("✅ B3TR Rewards deployed to:", b3trRewardsTx.contractAddress);
      deployedAddresses.b3trRewards = b3trRewardsTx.contractAddress;
    } catch (error) {
      console.log("❌ B3TR Rewards deployment failed:", error.message);
      return;
    }

    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet (Simple Deployment)",
      deployer: account.address,
      contracts: deployedAddresses,
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      deploymentTime: new Date().toISOString()
    };

    fs.writeFileSync('vechain-simple-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to: vechain-simple-deployment.json");

    // Display summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==================================");
    console.log("Network: VeChain Testnet (Simple Deployment)");
    console.log("Deployer:", account.address);
    console.log("\nContract Addresses:");
    console.log("DeathVerifier:", deployedAddresses.deathVerifier);
    console.log("OBOL Token:", deployedAddresses.obol);
    console.log("MultiSig Wallet:", deployedAddresses.multiSig);
    console.log("Sarcophagus:", deployedAddresses.sarcophagus);
    console.log("B3TR Rewards:", deployedAddresses.b3trRewards);
    console.log("\nExplorer: https://explore-testnet.vechain.org");
    console.log("==================================");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 