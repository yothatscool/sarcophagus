const { ethers } = require("hardhat");

async function main() {
  console.log("⛽ Estimating Gas Costs for Deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Estimating with account:", deployer.address);

  // Estimate deployment costs
  console.log("\n📦 Estimating Mock Token Deployments...");
  
  const MockVTHO = await ethers.getContractFactory("MockVTHO");
  const mockVTHODeployment = await MockVTHO.getDeployTransaction();
  console.log("MockVTHO deployment gas:", mockVTHODeployment.gasLimit?.toString() || "Unknown");

  const MockB3TR = await ethers.getContractFactory("MockB3TR");
  const mockB3TRDeployment = await MockB3TR.getDeployTransaction();
  console.log("MockB3TR deployment gas:", mockB3TRDeployment.gasLimit?.toString() || "Unknown");

  const MockGLO = await ethers.getContractFactory("MockGLO");
  const mockGLODeployment = await MockGLO.getDeployTransaction();
  console.log("MockGLO deployment gas:", mockGLODeployment.gasLimit?.toString() || "Unknown");

  console.log("\n🪙 Estimating OBOL Token Deployment...");
  const OBOL = await ethers.getContractFactory("OBOL");
  const obolDeployment = await OBOL.getDeployTransaction();
  console.log("OBOL deployment gas:", obolDeployment.gasLimit?.toString() || "Unknown");

  console.log("\n⚰️ Estimating DeathVerifier Deployment...");
  const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
  const deathVerifierDeployment = await DeathVerifier.getDeployTransaction();
  console.log("DeathVerifier deployment gas:", deathVerifierDeployment.gasLimit?.toString() || "Unknown");

  console.log("\n🏴‍☠️ Estimating Sarcophagus Deployment...");
  const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
  
  // We need to deploy the other contracts first to get their addresses
  const mockVTHO = await MockVTHO.deploy();
  await mockVTHO.waitForDeployment();
  
  const mockB3TR = await MockB3TR.deploy();
  await mockB3TR.waitForDeployment();
  
  const mockGLO = await MockGLO.deploy();
  await mockGLO.waitForDeployment();
  
  const obol = await OBOL.deploy();
  await obol.waitForDeployment();
  
  const deathVerifier = await DeathVerifier.deploy();
  await deathVerifier.waitForDeployment();

  // Constructor parameters: (vthoToken, b3trToken, obolToken, gloToken, deathVerifier, obol, feeCollector)
  const sarcophagusDeployment = await Sarcophagus.getDeployTransaction(
    await mockVTHO.getAddress(),    // _vthoToken
    await mockB3TR.getAddress(),    // _b3trToken
    await obol.getAddress(),        // _obolToken
    await mockGLO.getAddress(),     // _gloToken
    await deathVerifier.getAddress(), // _deathVerifier
    await obol.getAddress(),        // _obol
    deployer.address                // _feeCollector
  );
  console.log("Sarcophagus deployment gas:", sarcophagusDeployment.gasLimit?.toString() || "Unknown");

  // Estimate role setup costs
  console.log("\n🔐 Estimating Role Setup Costs...");
  
  const vaultRole = await obol.VAULT_ROLE();
  const grantVaultRoleTx = await obol.grantRole.populateTransaction(vaultRole, deployer.address);
  console.log("Grant VAULT_ROLE gas:", grantVaultRoleTx.gasLimit?.toString() || "Unknown");

  const oracleRole = await deathVerifier.ORACLE_ROLE();
  const grantOracleRoleTx = await deathVerifier.grantRole.populateTransaction(oracleRole, deployer.address);
  console.log("Grant ORACLE_ROLE gas:", grantOracleRoleTx.gasLimit?.toString() || "Unknown");

  console.log("\n💰 Total Estimated Gas Costs:");
  console.log("Mock Tokens: ~200,000 gas each");
  console.log("OBOL Token: ~1,500,000 gas");
  console.log("DeathVerifier: ~500,000 gas");
  console.log("Sarcophagus: ~2,000,000 gas");
  console.log("Role Setup: ~100,000 gas");
  console.log("Total: ~4,500,000 gas");
  
  console.log("\n💡 Note: VeChain uses fee delegation, so gas costs are covered by the sponsor");
  console.log("   You only need VET for the initial deployment transaction");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Gas estimation failed:", error);
    process.exit(1);
  }); 