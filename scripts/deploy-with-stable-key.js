// VeChain Native Deployment Script with Stable Key
// Uses a pre-generated stable private key

require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');
const fs = require('fs');

async function main() {
  console.log("🏛️ Deploying with VeChain Native Tools (Stable Key)...");

  // VeChain public testnet configuration
  const VECHAIN_TESTNET_URL = "https://testnet.veblocks.net";
  
  // Load the stable key
  let keyData;
  try {
    keyData = JSON.parse(fs.readFileSync('stable-key.json', 'utf8'));
  } catch (error) {
    console.log("❌ No stable key found. Run: node scripts/generate-stable-key.js");
    return;
  }

  console.log("🔗 Connecting to VeChain testnet:", VECHAIN_TESTNET_URL);

  // Initialize Web3 with Thorify (VeChain's native Web3 wrapper)
  const web3 = thorify(new Web3(), VECHAIN_TESTNET_URL);
  
  // Use the stable private key
  console.log("🔐 Using stable private key...");
  
  // Clear any existing accounts
  web3.eth.accounts.wallet.clear();
  
  // Add the stable account
  const account = web3.eth.accounts.privateKeyToAccount(keyData.privateKey);
  web3.eth.accounts.wallet.add(account);
  
  console.log("👤 Deployer address:", account.address);
  console.log("🔑 Private key (first 10 chars):", account.privateKey.substring(0, 10) + "...");
  console.log("📝 Generated from mnemonic (first 3 words):", keyData.mnemonic.split(' ').slice(0, 3).join(' ') + "...");

  // Check balance
  const balance = await web3.eth.getBalance(account.address);
  console.log("💰 Balance:", web3.utils.fromWei(balance, 'ether'), "VET");

  if (web3.utils.toBN(balance).lt(web3.utils.toBN(web3.utils.toWei('1', 'ether')))) {
    console.log("❌ Insufficient balance. Need at least 1 VET for deployment.");
    console.log("Get testnet VET from: https://faucet.vechain.org/");
    console.log("Use this address:", account.address);
    console.log("\n💡 This address is stable and will not change. Get testnet VET for this address and run the script again.");
    return;
  }

  // Contract addresses for testnet
  const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779";
  const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
  const GLO_ADDRESS = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e";

  // Oracle addresses (testnet)
  const ORACLE_ADDRESSES = [
    "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
    "0xa19f660abf4fed45226787cd17ef723d94d1ce31",
    "0x8c8d7c46219d9205f056f28fee5950ad564d9f23",
    "0x4d7c363ded4b3b4e1f954494d2bc3955e49699cc",
    "0x6c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c"
  ];

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

    // 1. Deploy DeathVerifier using VeChain native deployment
    console.log("\n📋 Step 1: Deploying DeathVerifier...");
    const deathVerifierContract = new web3.eth.Contract(contracts.DeathVerifier.abi);
    const deathVerifierDeploy = deathVerifierContract.deploy({
      data: contracts.DeathVerifier.bytecode,
      arguments: [] // No constructor parameters needed
    });

    const deathVerifierTx = await deathVerifierDeploy.send({
      from: account.address,
      gas: 5000000
    });

    console.log("✅ DeathVerifier deployed to:", deathVerifierTx.contractAddress);
    deployedAddresses.deathVerifier = deathVerifierTx.contractAddress;

    // Wait a bit between deployments
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 2. Deploy OBOL Token
    console.log("\n📋 Step 2: Deploying OBOL Token...");
    const obolContract = new web3.eth.Contract(contracts.OBOL.abi);
    const obolDeploy = obolContract.deploy({
      data: contracts.OBOL.bytecode,
      arguments: []
    });

    const obolTx = await obolDeploy.send({
      from: account.address,
      gas: 5000000
    });

    console.log("✅ OBOL Token deployed to:", obolTx.contractAddress);
    deployedAddresses.obol = obolTx.contractAddress;

    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Deploy MultiSig Wallet
    console.log("\n📋 Step 3: Deploying MultiSig Wallet...");
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
      gas: 5000000
    });

    console.log("✅ MultiSig Wallet deployed to:", multiSigTx.contractAddress);
    deployedAddresses.multiSig = multiSigTx.contractAddress;

    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Deploy Sarcophagus
    console.log("\n📋 Step 4: Deploying Sarcophagus...");
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
      gas: 10000000
    });

    console.log("✅ Sarcophagus deployed to:", sarcophagusTx.contractAddress);
    deployedAddresses.sarcophagus = sarcophagusTx.contractAddress;

    await new Promise(resolve => setTimeout(resolve, 5000));

    // 5. Deploy B3TR Rewards
    console.log("\n📋 Step 5: Deploying B3TR Rewards...");
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
      gas: 10000000
    });

    console.log("✅ B3TR Rewards deployed to:", b3trRewardsTx.contractAddress);
    deployedAddresses.b3trRewards = b3trRewardsTx.contractAddress;

    // 6. Set up roles using VeChain native calls
    console.log("\n🔐 Step 6: Setting up roles and permissions...");

    // Role constants
    const ORACLE_ROLE = "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6";
    const ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const REWARD_MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    const DEATH_VERIFIER_ROLE = "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6";

    // Create contract instances for role management
    const deathVerifierInstance = new web3.eth.Contract(contracts.DeathVerifier.abi, deployedAddresses.deathVerifier);
    const obolInstance = new web3.eth.Contract(contracts.OBOL.abi, deployedAddresses.obol);
    const sarcophagusInstance = new web3.eth.Contract(contracts.Sarcophagus.abi, deployedAddresses.sarcophagus);
    const b3trRewardsInstance = new web3.eth.Contract(contracts.B3TRRewards.abi, deployedAddresses.b3trRewards);

    // Grant oracle roles to DeathVerifier
    for (const oracle of ORACLE_ADDRESSES) {
      await deathVerifierInstance.methods.grantRole(ORACLE_ROLE, oracle).send({
        from: account.address,
        gas: 200000
      });
      console.log(`✅ Granted ORACLE_ROLE to ${oracle} in DeathVerifier`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Grant admin role to deployer
    await deathVerifierInstance.methods.grantRole(ADMIN_ROLE, account.address).send({
      from: account.address,
      gas: 200000
    });
    console.log("✅ Granted ADMIN_ROLE to deployer in DeathVerifier");

    // OBOL roles
    await obolInstance.methods.grantRole(ADMIN_ROLE, account.address).send({
      from: account.address,
      gas: 200000
    });
    console.log("✅ Granted ADMIN_ROLE to deployer in OBOL");

    await obolInstance.methods.grantRole(REWARD_MINTER_ROLE, deployedAddresses.b3trRewards).send({
      from: account.address,
      gas: 200000
    });
    console.log("✅ Granted REWARD_MINTER_ROLE to B3TR Rewards in OBOL");

    // Sarcophagus roles
    await sarcophagusInstance.methods.grantRole(DEATH_VERIFIER_ROLE, deployedAddresses.deathVerifier).send({
      from: account.address,
      gas: 200000
    });
    console.log("✅ Granted DEATH_VERIFIER_ROLE to DeathVerifier in Sarcophagus");

    for (const oracle of ORACLE_ADDRESSES) {
      await sarcophagusInstance.methods.grantRole(ORACLE_ROLE, oracle).send({
        from: account.address,
        gas: 200000
      });
      console.log(`✅ Granted ORACLE_ROLE to ${oracle} in Sarcophagus`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // B3TR Rewards roles
    await b3trRewardsInstance.methods.grantRole(ADMIN_ROLE, account.address).send({
      from: account.address,
      gas: 200000
    });
    console.log("✅ Granted ADMIN_ROLE to deployer in B3TR Rewards");

    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet (Native Tools - Stable Key)",
      deployer: account.address,
      privateKey: account.privateKey,
      nodeUrl: VECHAIN_TESTNET_URL,
      contracts: deployedAddresses,
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      oracles: ORACLE_ADDRESSES,
      deploymentTime: new Date().toISOString()
    };

    fs.writeFileSync('vechain-stable-key-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to: vechain-stable-key-deployment.json");

    // Display summary
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("==================================");
    console.log("Network: VeChain Testnet (Native Tools - Stable Key)");
    console.log("Deployer:", account.address);
    console.log("Node URL:", VECHAIN_TESTNET_URL);
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
    console.log("\n💡 Troubleshooting tips:");
    console.log("1. Make sure you have testnet VET: https://faucet.vechain.org/");
    console.log("2. Check your mnemonic in .env file");
    console.log("3. Try again in a few minutes if network is busy");
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 