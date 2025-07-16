const Web3 = require('web3');
const fs = require('fs');
require('dotenv').config();

async function main() {
  console.log("🚀 VeChain Alternative Deployment...");
  
  try {
    // Try different RPC endpoints
    const rpcEndpoints = [
      'https://testnet.vechain.org',
      'https://testnet.vechain.org/by/',
      'https://testnet.vechain.org/by/1',
      'https://testnet.veblocks.net'
    ];
    
    let web3;
    let connected = false;
    
    for (const endpoint of rpcEndpoints) {
      try {
        console.log(`\n🌐 Trying RPC endpoint: ${endpoint}`);
        web3 = new Web3(endpoint);
        
        // Test connection
        const blockNumber = await web3.eth.getBlockNumber();
        console.log(`✅ Connected! Latest block: ${blockNumber}`);
        connected = true;
        break;
      } catch (error) {
        console.log(`❌ Failed with ${endpoint}: ${error.message}`);
      }
    }
    
    if (!connected) {
      console.log("❌ Could not connect to any VeChain RPC endpoint");
      return;
    }
    
    // Try to use the existing account from your hardhat config
    console.log("\n👤 Setting up account...");
    
    // Check if we have a private key in environment
    let privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      console.log("⚠️ No PRIVATE_KEY in .env file");
      console.log("💡 Add your private key to .env file: PRIVATE_KEY=your_private_key_here");
      console.log("🔑 Or we can try to use the existing account from your deployment");
      
      // Try to use the account that was used in previous deployments
      const deployerAddress = "0x0BD562C50eDD56e2627a3078d02A3782fF03F67D";
      console.log("Using existing deployer address:", deployerAddress);
      
      // Check balance
      const balance = await web3.eth.getBalance(deployerAddress);
      console.log("VET Balance:", web3.utils.fromWei(balance, 'ether'), "VET");
      
      if (balance === '0') {
        console.log("❌ Account has no VET balance");
        console.log("💡 Please add VET to this account or provide a private key");
        return;
      }
      
      // For now, let's just test the connection and show what we would deploy
      console.log("\n📋 Would deploy the following contracts:");
      console.log("- DeathVerifier (with enhanced features)");
      console.log("- OBOL Token (updated version)");
      console.log("- MultiSig Wallet (updated version)");
      console.log("- Sarcophagus (with all patches)");
      console.log("- B3TR Rewards (with bonus system)");
      
      console.log("\n💡 To complete deployment:");
      console.log("1. Add your private key to .env file");
      console.log("2. Make sure you have sufficient VET and VTHO");
      console.log("3. Run this script again");
      
      return;
    }
    
    // Use the private key
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    
    console.log("Deploying with account:", account.address);
    
    // Check balance
    const balance = await web3.eth.getBalance(account.address);
    console.log("VET Balance:", web3.utils.fromWei(balance, 'ether'), "VET");
    
    if (balance === '0') {
      console.log("❌ Account has no VET balance");
      return;
    }
    
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
    
    console.log("\n📋 Deploying contracts...");
    
    // Deploy contracts one by one
    for (let i = 0; i < contractNames.length; i++) {
      const name = contractNames[i];
      console.log(`\n📋 Step ${i + 1}: Deploying ${name}...`);
      
      try {
        const contract = new web3.eth.Contract(contracts[name].abi);
        let deployArgs = [];
        
        // Set up constructor arguments based on contract
        if (name === 'MultiSigWallet') {
          const signers = [account.address, "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"];
          const weights = [1, 1, 1];
          const threshold = 2;
          deployArgs = [signers, weights, threshold];
        } else if (name === 'Sarcophagus') {
          deployArgs = [
            VTHO_ADDRESS,
            B3TR_ADDRESS,
            deployedAddresses.obol || "0x0000000000000000000000000000000000000000",
            GLO_ADDRESS,
            deployedAddresses.deathVerifier || "0x0000000000000000000000000000000000000000",
            deployedAddresses.obol || "0x0000000000000000000000000000000000000000",
            deployedAddresses.multiSig || "0x0000000000000000000000000000000000000000"
          ];
        } else if (name === 'B3TRRewards') {
          deployArgs = [
            B3TR_ADDRESS,
            deployedAddresses.sarcophagus || "0x0000000000000000000000000000000000000000",
            80
          ];
        }
        
        const deploy = contract.deploy({
          data: contracts[name].bytecode,
          arguments: deployArgs
        });
        
        const gasEstimate = await deploy.estimateGas({ from: account.address });
        console.log(`Estimated gas: ${gasEstimate}`);
        
        const tx = await deploy.send({
          from: account.address,
          gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer
        });
        
        console.log(`✅ ${name} deployed to:`, tx.contractAddress);
        deployedAddresses[name.toLowerCase()] = tx.contractAddress;
        
        // Verify deployment
        const code = await web3.eth.getCode(tx.contractAddress);
        console.log("Contract code length:", code.length);
        
        // Wait between deployments
        if (i < contractNames.length - 1) {
          console.log("⏳ Waiting 10 seconds before next deployment...");
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
        
      } catch (error) {
        console.log(`❌ ${name} deployment failed:`, error.message);
        return;
      }
    }
    
    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet (Alternative Deployment)",
      deployer: account.address,
      timestamp: new Date().toISOString(),
      contracts: deployedAddresses,
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      status: "Successfully deployed with alternative method",
      features: [
        "Enhanced DeathVerifier with environmental API integration",
        "Updated Sarcophagus with GLO conversion fixes",
        "B3TR Rewards with bonus system",
        "Security patches (reentrancy protection, pause functionality)",
        "NFT integration support",
        "Minimum deposit requirements"
      ]
    };
    
    fs.writeFileSync('alternative-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 === ALTERNATIVE DEPLOYMENT COMPLETE ===");
    console.log("All updated contracts deployed successfully!");
    console.log("\nContract Addresses (Updated):");
    for (const [name, address] of Object.entries(deployedAddresses)) {
      console.log(`${name}: ${address}`);
    }
    console.log("\nExplorer: https://explore-testnet.vechain.org");
    console.log("Deployment info saved to: alternative-deployment.json");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 