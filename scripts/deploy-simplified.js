const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Simplified Vereavement Protocol...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy DeathVerifier first
  console.log("Deploying DeathVerifier...");
  const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
  const deathVerifier = await DeathVerifier.deploy();
  await deathVerifier.deployed();
  console.log("DeathVerifier deployed to:", deathVerifier.address);

  // Deploy Sarcophagus (using mock B3TR address for now)
  console.log("Deploying Sarcophagus...");
  const mockB3TRAddress = "0x1234567890123456789012345678901234567890"; // Replace with actual B3TR address
  const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
  const sarcophagus = await Sarcophagus.deploy(mockB3TRAddress, deathVerifier.address);
  await sarcophagus.deployed();
  console.log("Sarcophagus deployed to:", sarcophagus.address);

  // Grant roles
  console.log("Setting up roles...");
  await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), deployer.address);
  await sarcophagus.grantRole(await sarcophagus.ORACLE_ROLE(), deployer.address);
  await sarcophagus.grantRole(await sarcophagus.VERIFIER_ROLE(), deployer.address);

  console.log("Deployment complete!");
  console.log("DeathVerifier:", deathVerifier.address);
  console.log("Sarcophagus:", sarcophagus.address);
  console.log("Deployer has all necessary roles");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 