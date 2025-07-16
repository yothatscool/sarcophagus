const Web3 = require('web3');
const fs = require('fs');
require('dotenv').config();

async function main() {
  console.log("🚀 VeChain Native Deployment (Web3)...");
  
  try {
    // Initialize Web3 with VeChain
    const web3 = new Web3('https://testnet.vechain.org');
    
    // Use the private key from your environment or generate a new one
    const privateKey = process.env.PRIVATE_KEY || '0x1234567890123456789012345678901234567890123456789012345678901234';
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    
    console.log("Deploying with account:", account.address);
    
    // Check balance
    const balance = await web3.eth.getBalance(account.address);
    console.log("VET Balance:", web3.utils.fromWei(balance, 'ether'), "VET");
    
    // Testnet token addresses
    const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779";
    const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
    const GLO_ADDRESS = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e";
    
    const deployedAddresses = {};
    
    // Load contract artifacts
    console.log("\n📋 Loading contract artifacts...");
    
    const contracts = {};
    const contractNames = ['DeathVerifier', 'OBOL', 'MultiSigWallet', 'Sarcophagus', 'B3TRRewards'];
    
    for (const name of contractNames) {
      try {
        const artifactPath = `./artifacts/contracts/${name}.sol/${name}.json`;
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        contracts[name] = {
          bytecode: artifact.bytecode,
          abi: artifact.abi
        };
        console.log(`✅ Loaded ${name} artifact`);
      } catch (error) {
        console.log(`❌ Failed to load ${name} artifact:`, error.message);
        return;
      }
    }
    
    console.log("\n📋 Deploying contracts with VeChain native method...");
    
    // Step 1: Deploy DeathVerifier
    console.log("\n📋 Step 1: Deploying DeathVerifier...");
    try {
      const deathVerifierContract = new web3.eth.Contract(contracts.DeathVerifier.abi);
      const deathVerifierDeploy = deathVerifierContract.deploy({
        data: contracts.DeathVerifier.bytecode,
        arguments: []
      });
      
      const deathVerifierTx = await deathVerifierDeploy.send({
        from: account.address,
        gas: 3000000
      });
      
      console.log("✅ DeathVerifier deployed to:", deathVerifierTx.contractAddress);
      deployedAddresses.deathVerifier = deathVerifierTx.contractAddress;
      
      // Verify deployment
      const code1 = await web3.eth.getCode(deathVerifierTx.contractAddress);
      console.log("Contract code length:", code1.length);
      
    } catch (error) {
      console.log("❌ DeathVerifier deployment failed:", error.message);
      return;
    }
    
    // Wait between deployments
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 2: Deploy OBOL Token
    console.log("\n📋 Step 2: Deploying OBOL Token...");
    try {
      const obolContract = new web3.eth.Contract(contracts.OBOL.abi);
      const obolDeploy = obolContract.deploy({
        data: contracts.OBOL.bytecode,
        arguments: []
      });
      
      const obolTx = await obolDeploy.send({
        from: account.address,
        gas: 3000000
      });
      
      console.log("✅ OBOL Token deployed to:", obolTx.contractAddress);
      deployedAddresses.obol = obolTx.contractAddress;
      
      // Verify deployment
      const code2 = await web3.eth.getCode(obolTx.contractAddress);
      console.log("Contract code length:", code2.length);
      
    } catch (error) {
      console.log("❌ OBOL deployment failed:", error.message);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 3: Deploy MultiSig Wallet
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
        gas: 4000000
      });
      
      console.log("✅ MultiSig Wallet deployed to:", multiSigTx.contractAddress);
      deployedAddresses.multiSig = multiSigTx.contractAddress;
      
      // Verify deployment
      const code3 = await web3.eth.getCode(multiSigTx.contractAddress);
      console.log("Contract code length:", code3.length);
      
    } catch (error) {
      console.log("❌ MultiSig deployment failed:", error.message);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 4: Deploy Sarcophagus
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
        gas: 8000000
      });
      
      console.log("✅ Sarcophagus deployed to:", sarcophagusTx.contractAddress);
      deployedAddresses.sarcophagus = sarcophagusTx.contractAddress;
      
      // Verify deployment
      const code4 = await web3.eth.getCode(sarcophagusTx.contractAddress);
      console.log("Contract code length:", code4.length);
      
    } catch (error) {
      console.log("❌ Sarcophagus deployment failed:", error.message);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 5: Deploy B3TR Rewards
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
        gas: 5000000
      });
      
      console.log("✅ B3TR Rewards deployed to:", b3trRewardsTx.contractAddress);
      deployedAddresses.b3trRewards = b3trRewardsTx.contractAddress;
      
      // Verify deployment
      const code5 = await web3.eth.getCode(b3trRewardsTx.contractAddress);
      console.log("Contract code length:", code5.length);
      
    } catch (error) {
      console.log("❌ B3TR Rewards deployment failed:", error.message);
      return;
    }
    
    // Test all contracts
    console.log("\n🧪 Testing deployed contracts...");
    
    try {
      // Test OBOL
      const obolInstance = new web3.eth.Contract(contracts.OBOL.abi, deployedAddresses.obol);
      const obolName = await obolInstance.methods.name().call();
      const obolSymbol = await obolInstance.methods.symbol().call();
      console.log("✅ OBOL:", obolName, `(${obolSymbol})`);
      
      // Test DeathVerifier
      const deathVerifierInstance = new web3.eth.Contract(contracts.DeathVerifier.abi, deployedAddresses.deathVerifier);
      const expiry = await deathVerifierInstance.methods.VERIFICATION_EXPIRY().call();
      console.log("✅ DeathVerifier: Expiry", expiry);
      
      // Test MultiSig
      const multiSigInstance = new web3.eth.Contract(contracts.MultiSigWallet.abi, deployedAddresses.multiSig);
      const requiredWeight = await multiSigInstance.methods.requiredWeight().call();
      console.log("✅ MultiSig: Required Weight", requiredWeight);
      
      // Test Sarcophagus
      const sarcophagusInstance = new web3.eth.Contract(contracts.Sarcophagus.abi, deployedAddresses.sarcophagus);
      try {
        const minDeposit = await sarcophagusInstance.methods.MIN_DEPOSIT().call();
        console.log("✅ Sarcophagus: Min Deposit", web3.utils.fromWei(minDeposit, 'ether'), "VET");
      } catch (error) {
        console.log("⚠️ Sarcophagus: MIN_DEPOSIT not found (checking other features)");
      }
      
      // Test B3TR Rewards
      const b3trRewardsInstance = new web3.eth.Contract(contracts.B3TRRewards.abi, deployedAddresses.b3trRewards);
      const threshold = await b3trRewardsInstance.methods.rateAdjustmentThreshold().call();
      console.log("✅ B3TR Rewards: Rate Threshold", threshold);
      
    } catch (error) {
      console.log("❌ Contract testing failed:", error.message);
    }
    
    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet (Native Web3 Deployment)",
      deployer: account.address,
      timestamp: new Date().toISOString(),
      contracts: deployedAddresses,
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      status: "Successfully deployed with VeChain native Web3 method",
      features: [
        "Enhanced DeathVerifier with environmental API integration",
        "Updated Sarcophagus with GLO conversion fixes",
        "B3TR Rewards with bonus system",
        "Security patches (reentrancy protection, pause functionality)",
        "NFT integration support",
        "Minimum deposit requirements"
      ]
    };
    
    fs.writeFileSync('vechain-native-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 === VECHAIN NATIVE DEPLOYMENT COMPLETE ===");
    console.log("All updated contracts deployed successfully!");
    console.log("\nContract Addresses (Updated):");
    for (const [name, address] of Object.entries(deployedAddresses)) {
      console.log(`${name}: ${address}`);
    }
    console.log("\nExplorer: https://explore-testnet.vechain.org");
    console.log("Deployment info saved to: vechain-native-deployment.json");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    
    console.log("\n💡 To use this script:");
    console.log("1. Add your private key to .env file: PRIVATE_KEY=your_private_key_here");
    console.log("2. Make sure you have sufficient VET and VTHO");
    console.log("3. Run: npm install web3 dotenv");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 