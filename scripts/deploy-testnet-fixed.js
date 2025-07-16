const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying Sarcophagus Protocol to VeChain Testnet (Fixed)...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "VET");

  // Testnet token addresses on VeChain Testnet
  const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
  const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779";
  const GLO_ADDRESS = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e";
  
  // MultiSig signer addresses with weights
  const MULTISIG_SIGNERS = [
    "0x3d32fE6e85066240f3018c9FC664db7967d2d313",
    "0x73f121d48ec8028a9a0e01166bbf6dec669ac940",
    "0x804d23410d548594db9eabbb4ed2894f591e9d72",
    "0x1b0a35f55c02f97fd9ab0af3980ca11eb8067a90",
    "0xd0c282e767c9ea8fe773fba6c6847e7dd2a905c6"
  ];
  
  const MULTISIG_WEIGHTS = [40, 25, 20, 10, 5];
  const REQUIRED_WEIGHT = 60;
  
  // Oracle addresses for death verification
  const ORACLE_ADDRESSES = [
    "0xba54f2292b0957a023c27fd3d16fa2d7fa186bc6",
    "0xa19f660abf4fed45226787cd17ef723d94d1ce31", 
    "0xe791fec915dffd49f7353d826bbc361183f5ae22",
    "0x24a939b60cfcbcca540259c0a06d83369d9b534f",
    "0xbb8c80bc4ef02737493b1cfdf240e6ed7d20292d"
  ];
  
  console.log("\nUsing token addresses:");
  console.log("B3TR:", B3TR_ADDRESS);
  console.log("VTHO:", VTHO_ADDRESS);
  console.log("GLO:", GLO_ADDRESS);
  console.log("VET: Native token (no contract address)");

  const deploymentInfo = {
    network: "VeChain Testnet",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {},
    multisig: {
      signers: MULTISIG_SIGNERS,
      weights: MULTISIG_WEIGHTS,
      requiredWeight: REQUIRED_WEIGHT
    },
    oracles: ORACLE_ADDRESSES
  };

  try {
    // Deploy DeathVerifier first
    console.log("\n📋 Deploying DeathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();
    const deathVerifierAddress = await deathVerifier.getAddress();
    console.log("✅ DeathVerifier deployed to:", deathVerifierAddress);
    deploymentInfo.contracts.DeathVerifier = deathVerifierAddress;

    // Deploy MultiSig Wallet
    console.log("\n📋 Deploying MultiSig Wallet...");
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(MULTISIG_SIGNERS, MULTISIG_WEIGHTS, REQUIRED_WEIGHT);
    await multiSigWallet.waitForDeployment();
    const multiSigAddress = await multiSigWallet.getAddress();
    console.log("✅ MultiSig Wallet deployed to:", multiSigAddress);
    deploymentInfo.contracts.MultiSigWallet = multiSigAddress;

    // Deploy OBOL Token
    console.log("\n📋 Deploying OBOL Token...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obol = await OBOL.deploy();
    await obol.waitForDeployment();
    const obolAddress = await obol.getAddress();
    console.log("✅ OBOL Token deployed to:", obolAddress);
    deploymentInfo.contracts.OBOL = obolAddress;

    // Deploy Sarcophagus
    console.log("\n📋 Deploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    const sarcophagus = await Sarcophagus.deploy(
      VTHO_ADDRESS,
      B3TR_ADDRESS,
      obolAddress,
      GLO_ADDRESS,
      deathVerifierAddress,
      obolAddress,
      multiSigAddress
    );
    await sarcophagus.waitForDeployment();
    const sarcophagusAddress = await sarcophagus.getAddress();
    console.log("✅ Sarcophagus deployed to:", sarcophagusAddress);
    deploymentInfo.contracts.Sarcophagus = sarcophagusAddress;

    // Deploy B3TR Rewards
    console.log("\n📋 Deploying B3TR Rewards...");
    const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
    const b3trRewards = await B3TRRewards.deploy(
      B3TR_ADDRESS,
      sarcophagusAddress,
      80
    );
    await b3trRewards.waitForDeployment();
    const b3trAddress = await b3trRewards.getAddress();
    console.log("✅ B3TR Rewards deployed to:", b3trAddress);
    deploymentInfo.contracts.B3TRRewards = b3trAddress;

    // Save deployment information
    const deploymentPath = path.join(__dirname, '..', 'deployment-testnet-fixed.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 === DEPLOYMENT COMPLETE ===");
    console.log("Deployment info saved to: deployment-testnet-fixed.json");
    console.log("\n📋 Contract Addresses:");
    console.log("DeathVerifier:", deathVerifierAddress);
    console.log("Sarcophagus:", sarcophagusAddress);
    console.log("OBOL Token:", obolAddress);
    console.log("B3TR Rewards:", b3trAddress);
    console.log("MultiSig Wallet:", multiSigAddress);
    console.log("\n🔗 Testnet Explorer: https://explore-testnet.vechain.org");
    
    console.log("\n⚠️  Note: Role setup was skipped due to compatibility issues.");
    console.log("You can manually set up roles later if needed.");
    
    console.log("\n🚀 === NEXT STEPS ===");
    console.log("1. Verify contracts on VeChain testnet explorer");
    console.log("2. Test all functions on testnet");
    console.log("3. Update frontend configuration with new addresses");
    console.log("4. Deploy frontend to Vercel for public testing");

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