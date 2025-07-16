const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("OBOL Token Integration", function () {
  let deployer, user1, user2;
  let mockVTHO, mockB3TR, mockGLO, obol, deathVerifier, sarcophagus;

  before(async function () {
    [deployer, user1, user2] = await ethers.getSigners();

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

    // Deploy OBOL token
    const OBOL = await ethers.getContractFactory("OBOL");
    obol = await OBOL.deploy();
    await obol.waitForDeployment();

    // Deploy DeathVerifier
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();

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

    // Grant vault role to Sarcophagus
    await obol.grantVaultRole(await sarcophagus.getAddress());
  });

  it("should perform OBOL integration flow", async function () {
    // Test tokenomics
    const tokenomics = await obol.getTokenomics();
    expect(tokenomics.totalSupplyAmount).to.be.a("bigint");
    expect(tokenomics.initialSupply).to.be.a("bigint");
    expect(tokenomics.rewardSupply).to.be.a("bigint");

    // Test vesting
    const vestingProgress = await obol.getVestingProgress();
    const vestedAmount = await obol.getVestedAmount();
    expect(vestingProgress).to.be.a("bigint");
    expect(vestedAmount).to.be.a("bigint");

    // Test reward calculation
    const depositValue = ethers.parseEther("100"); // 100 VET (minimum deposit)
    const expectedReward = await obol.calculateReward(depositValue);
    expect(expectedReward).to.be.a("bigint");

    // Test remaining reward supply
    const remainingSupply = await obol.getRemainingRewardSupply();
    expect(remainingSupply).to.be.a("bigint");

    // Verify user1 before creating sarcophagus
    await deathVerifier.verifyUser(user1.address, 30, "ipfs://verification");

    // Create sarcophagus
    const beneficiaries = [user2.address];
    const percentages = [10000]; // 100%
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const guardians = [zeroAddress];
    const ages = [30];
    const contingentBeneficiaries = [zeroAddress];
    const survivorshipPeriods = [0];
    await sarcophagus.connect(user1).createSarcophagus(
      beneficiaries,
      percentages,
      guardians,
      ages,
      contingentBeneficiaries,
      survivorshipPeriods
    );

    // Fast-forward 30 days to satisfy MINIMUM_LOCK_PERIOD
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    // Test deposit and OBOL rewards
    const depositAmount = ethers.parseEther("100"); // 100 VET (minimum deposit)
    await sarcophagus.connect(user1).depositTokens(depositAmount, 0, 0, { value: depositAmount });

    // Test OBOL balance after deposit
    const obolBalance = await obol.balanceOf(user1.address);
    expect(obolBalance).to.be.a("bigint");

    // Test reward claiming
    const pendingRewards = await obol.getPendingRewards(user1.address);
    expect(pendingRewards).to.be.a("bigint");
    
    // Only claim rewards if there are any pending
    if (pendingRewards > 0) {
        await obol.connect(user1).claimContinuousRewards(user1.address);
    }
    
    const finalBalance = await obol.balanceOf(user1.address);
    expect(finalBalance).to.be.a("bigint");
  });
});