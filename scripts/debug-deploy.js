const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();
  
  console.log("Deploying contracts...");
  
  try {
    console.log("Deploying mockVTHO...");
    const MockVTHO = await ethers.getContractFactory("MockVTHO");
    const mockVTHO = await MockVTHO.deploy();
    await mockVTHO.waitForDeployment();
    console.log("MockVTHO deployed to:", await mockVTHO.getAddress());

    console.log("Deploying mockB3TR...");
    const MockB3TR = await ethers.getContractFactory("MockB3TR");
    const mockB3TR = await MockB3TR.deploy();
    await mockB3TR.waitForDeployment();
    console.log("MockB3TR deployed to:", await mockB3TR.getAddress());

    console.log("Deploying OBOL...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obolToken = await OBOL.deploy();
    await obolToken.waitForDeployment();
    console.log("OBOL deployed to:", await obolToken.getAddress());

    console.log("Deploying deathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();
    console.log("DeathVerifier deployed to:", await deathVerifier.getAddress());

    console.log("Deploying mockGLO...");
    const MockGLO = await ethers.getContractFactory("MockToken");
    const mockGLO = await MockGLO.deploy("Mock GLO", "GLO");
    await mockGLO.waitForDeployment();
    console.log("MockGLO deployed to:", await mockGLO.getAddress());

    console.log("Deploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    
    const sarcophagus = await Sarcophagus.deploy(
      await mockVTHO.getAddress(),
      await mockB3TR.getAddress(),
      await obolToken.getAddress(),
      await mockGLO.getAddress(),
      await deathVerifier.getAddress(),
      await obolToken.getAddress(),
      owner.address
    );
    
    await sarcophagus.waitForDeployment();
    console.log("Sarcophagus deployed to:", await sarcophagus.getAddress());
    
    console.log("All contracts deployed successfully!");
    
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 