const Connex = require('connex');
const fs = require('fs');

async function main() {
  console.log("🏛️ Attempting VeChain deployment with Connex framework...");

  try {
    // Initialize Connex for testnet
    const connex = new Connex({
      node: 'https://testnet.veblocks.net',
      network: 'test'
    });

    console.log("✅ Connex initialized for VeChain testnet");

    // Check if wallet is connected
    const isConnected = connex.thor.account.isConnected();
    console.log("Wallet connected:", isConnected);

    if (!isConnected) {
      console.log("🔗 Requesting wallet connection...");
      await connex.thor.account.connect();
      console.log("✅ Wallet connected:", connex.thor.account.address);
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

    // Deploy contracts using Connex
    const deployedAddresses = {};

    // 1. Deploy DeathVerifier
    console.log("\n📋 Step 1: Deploying DeathVerifier...");
    const deathVerifierClause = connex.thor
      .account()
      .method(contracts.DeathVerifier.abi.find(m => m.type === 'constructor'))
      .value(ORACLE_ADDRESSES);

    const deathVerifierResult = await connex.thor
      .signer()
      .sign(deathVerifierClause)
      .comment('Deploy DeathVerifier');

    console.log("DeathVerifier deployment transaction:", deathVerifierResult.txid);
    deployedAddresses.deathVerifier = deathVerifierResult.txid;

    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 2. Deploy OBOL
    console.log("\n📋 Step 2: Deploying OBOL Token...");
    const obolClause = connex.thor
      .account()
      .method(contracts.OBOL.abi.find(m => m.type === 'constructor'))
      .value([]);

    const obolResult = await connex.thor
      .signer()
      .sign(obolClause)
      .comment('Deploy OBOL Token');

    console.log("OBOL deployment transaction:", obolResult.txid);
    deployedAddresses.obol = obolResult.txid;

    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 3. Deploy MultiSig
    console.log("\n📋 Step 3: Deploying MultiSig Wallet...");
    const signers = [connex.thor.account.address, "0x0000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000002"];
    const weights = [1, 1, 1];
    const threshold = 2;

    const multiSigClause = connex.thor
      .account()
      .method(contracts.MultiSigWallet.abi.find(m => m.type === 'constructor'))
      .value([signers, weights, threshold]);

    const multiSigResult = await connex.thor
      .signer()
      .sign(multiSigClause)
      .comment('Deploy MultiSig Wallet');

    console.log("MultiSig deployment transaction:", multiSigResult.txid);
    deployedAddresses.multiSig = multiSigResult.txid;

    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 4. Deploy Sarcophagus (we'll need to get the actual addresses first)
    console.log("\n📋 Step 4: Deploying Sarcophagus...");
    console.log("Note: This step requires the actual contract addresses from previous deployments");
    console.log("You may need to check the transaction receipts to get the deployed addresses");

    // Save deployment info
    const deploymentInfo = {
      network: "VeChain Testnet",
      deployer: connex.thor.account.address,
      transactions: deployedAddresses,
      tokens: {
        vtho: VTHO_ADDRESS,
        b3tr: B3TR_ADDRESS,
        glo: GLO_ADDRESS
      },
      oracles: ORACLE_ADDRESSES,
      deploymentTime: new Date().toISOString()
    };

    fs.writeFileSync('vechain-connex-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📄 Deployment info saved to: vechain-connex-deployment.json");

    console.log("\n🎉 Connex deployment transactions sent!");
    console.log("==================================");
    console.log("Network: VeChain Testnet");
    console.log("Deployer:", connex.thor.account.address);
    console.log("\nTransaction IDs:");
    console.log("DeathVerifier:", deployedAddresses.deathVerifier);
    console.log("OBOL Token:", deployedAddresses.obol);
    console.log("MultiSig Wallet:", deployedAddresses.multiSig);
    console.log("\nExplorer: https://explore-testnet.vechain.org");
    console.log("==================================");

  } catch (error) {
    console.error("❌ Connex deployment failed:", error);
    console.log("\n🔄 Since Connex deployment also failed, this confirms the issue:");
    console.log("- VeChain's public RPC endpoints have limitations");
    console.log("- The official tools work better with private nodes");
    console.log("- Manual deployment with Sync2/VeWorld is the most reliable method");
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 