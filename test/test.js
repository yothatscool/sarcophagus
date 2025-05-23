const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vereavement", function () {
  it("should register a user and update vault", async function () {
    const [owner] = await ethers.getSigners();

    // Deploy mock contracts first
    const MockB3TR = await ethers.getContractFactory("MockB3TR");
    const b3trToken = await MockB3TR.deploy();
    await b3trToken.waitForDeployment();

    const MockVTHOManager = await ethers.getContractFactory("MockVTHOManager");
    const vthoManager = await MockVTHOManager.deploy();
    await vthoManager.waitForDeployment();

    const MockVNSResolver = await ethers.getContractFactory("MockVNSResolver");
    const vnsResolver = await MockVNSResolver.deploy();
    await vnsResolver.waitForDeployment();

    // Deploy RitualEngine
    const RitualEngine = await ethers.getContractFactory("RitualEngine");
    const ritualEngine = await RitualEngine.deploy(await b3trToken.getAddress());
    await ritualEngine.waitForDeployment();

    // Deploy Vereavement with all required arguments
    const Vereavement = await ethers.getContractFactory("Vereavement");
    const contract = await Vereavement.deploy(
      ethers.parseEther("500"), // flatWeeklyAllocation
      ethers.parseEther("1000"), // totalTreasuryYield
      2, // minConfirmations
      await vthoManager.getAddress(),
      await vnsResolver.getAddress(),
      await ritualEngine.getAddress()
    );
    await contract.waitForDeployment();

    // Register user with beneficiary
    await contract.registerUser(
      [await owner.getAddress()], // beneficiaries
      [10000], // percentages (100%)
      [0], // vesting periods
      [false], // conditional flags
      [""] // conditions
    );

    const vault = await contract.getRitualValue(await owner.getAddress());
    expect(vault).to.equal(0n);
  });
});
