const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Debug Test", function () {
  it("Should deploy Sarcophagus", async function () {
    const [owner] = await ethers.getSigners();
    
    console.log("Deploying mockVTHO...");
    const MockVTHO = await ethers.getContractFactory("MockVTHO");
    const mockVTHO = await MockVTHO.deploy();

    console.log("Deploying mockB3TR...");
    const MockB3TR = await ethers.getContractFactory("MockB3TR");
    const mockB3TR = await MockB3TR.deploy();

    console.log("Deploying OBOL...");
    const OBOL = await ethers.getContractFactory("OBOL");
    const obolToken = await OBOL.deploy();

    console.log("Deploying deathVerifier...");
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    const deathVerifier = await DeathVerifier.deploy();

    console.log("Deploying mockGLO...");
    const MockGLO = await ethers.getContractFactory("MockToken");
    const mockGLO = await MockGLO.deploy("Mock GLO", "GLO");

    console.log("Deploying Sarcophagus...");
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    
    try {
      const sarcophagus = await Sarcophagus.deploy(
        await mockVTHO.getAddress(),
        await mockB3TR.getAddress(),
        await obolToken.getAddress(),
        await mockGLO.getAddress(),
        await deathVerifier.getAddress(),
        await obolToken.getAddress(),
        owner.address
      );
      
      console.log("Sarcophagus deployed successfully at:", await sarcophagus.getAddress());
      expect(await sarcophagus.getAddress()).to.not.equal(ethers.ZeroAddress);
    } catch (error) {
      console.error("Deployment failed:", error);
      throw error;
    }
  });
}); 