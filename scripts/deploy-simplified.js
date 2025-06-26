const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Simplified Vereavement Protocol...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Real token addresses on VeChain
  const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
  const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779";
  // VET is native token - no contract address needed

  console.log("Using token addresses:");
  console.log("B3TR:", B3TR_ADDRESS);
  console.log("VTHO:", VTHO_ADDRESS);
  console.log("VET: Native token (no contract address)");

  // Deploy DeathVerifier first
  console.log("Deploying DeathVerifier...");
  const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
  const deathVerifierContract = await DeathVerifier.deploy();
  await deathVerifierContract.waitForDeployment();
  const deathVerifierAddress = await deathVerifierContract.getAddress();
  console.log("DeathVerifier deployed to:", deathVerifierAddress);

  // Deploy Sarcophagus with all required addresses
  console.log("Deploying Sarcophagus...");
  const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
  // Using B3TR address as a placeholder for OBOL for this simplified deployment
  const sarcophagusContract = await Sarcophagus.deploy(
    VTHO_ADDRESS,
    B3TR_ADDRESS,
    B3TR_ADDRESS, // Placeholder for obolToken
    deathVerifierAddress,
    B3TR_ADDRESS // Placeholder for OBOL contract
  );
  await sarcophagusContract.waitForDeployment();
  const sarcophagusAddress = await sarcophagusContract.getAddress();
  console.log("Sarcophagus deployed to:", sarcophagusAddress);

  // Grant roles
  console.log("Setting up roles...");
  await deathVerifierContract.grantRole(await deathVerifierContract.ORACLE_ROLE(), deployer.address);
  await sarcophagusContract.grantRole(await sarcophagusContract.ORACLE_ROLE(), deployer.address);
  await sarcophagusContract.grantRole(await sarcophagusContract.VERIFIER_ROLE(), deployer.address);

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("DeathVerifier:", deathVerifierAddress);
  console.log("Sarcophagus:", sarcophagusAddress);
  console.log("B3TR Token:", B3TR_ADDRESS);
  console.log("VTHO Token:", VTHO_ADDRESS);
  console.log("Deployer:", deployer.address);
  console.log("Deployer has all necessary roles");
  
  console.log("\n=== NEXT STEPS ===");
  console.log("1. Verify contracts on VeChain explorer");
  console.log("2. Test all functions on testnet");
  console.log("3. Set up oracle addresses for death verification");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 