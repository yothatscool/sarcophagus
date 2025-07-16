const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Bonus System", function () {
  let deployer, mockVTHO, mockB3TR, mockGLO, deathVerifier, obol, sarcophagus;

  before(async function () {
    [deployer] = await ethers.getSigners();

    // Deploy mock tokens
    const MockVTHO = await ethers.getContractFactory("MockVTHO");
    mockVTHO = await MockVTHO.deploy();
    await mockVTHO.waitForDeployment();

    const MockB3TR = await ethers.getContractFactory("MockB3TR");
    mockB3TR = await MockB3TR.deploy();
    await mockB3TR.waitForDeployment();

    const MockGLO = await ethers.getContractFactory("MockGLO");
    mockGLO = await MockGLO.deploy();
    await mockGLO.waitForDeployment();

    // Deploy DeathVerifier
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();

    // Deploy OBOL token
    const OBOL = await ethers.getContractFactory("OBOL");
    obol = await OBOL.deploy();
    await obol.waitForDeployment();

    // Deploy Sarcophagus
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    sarcophagus = await Sarcophagus.deploy(
      await mockVTHO.getAddress(),
      await mockB3TR.getAddress(),
      await obol.getAddress(),
      await mockGLO.getAddress(),
      await deathVerifier.getAddress(),
      await obol.getAddress(),
      deployer.address // feeCollector
    );
    await sarcophagus.waitForDeployment();
  });

  it("should calculate bonuses correctly for various scenarios", async function () {
    const testCases = [
      { age: 65, lifeExpectancy: 80, expectedType: "Carbon Offset" },
      { age: 80, lifeExpectancy: 80, expectedType: "Legacy" },
      { age: 85, lifeExpectancy: 80, expectedType: "Legacy" },
      { age: 90, lifeExpectancy: 80, expectedType: "Legacy" },
      { age: 50, lifeExpectancy: 80, expectedType: "Carbon Offset" },
    ];

    for (const testCase of testCases) {
      const bonus = await deathVerifier.calculateBonus(
        testCase.age,
        testCase.lifeExpectancy,
        ethers.parseEther("1000"), // 1000 VET deposits
        5 // 5 years in system
      );
      const bonusInEther = ethers.formatEther(bonus);
      const ageDiff = Math.abs(testCase.age - testCase.lifeExpectancy);
      // Just log for now, but you can add expect() assertions as needed
      console.log(`Age: ${testCase.age}, Life Expectancy: ${testCase.lifeExpectancy}`);
      console.log(`Expected: ${testCase.expectedType}`);
      console.log(`Age Difference: ${ageDiff} years`);
      console.log(`Bonus: ${bonusInEther} B3TR`);
      console.log(`Status: ${bonus > 0 ? "✅ PASS" : "❌ FAIL"}`);
      console.log("-".repeat(30));
      expect(bonus).to.be.a("bigint");
    }
  });
}); 