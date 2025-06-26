const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Hybrid OBOL Earning System", function () {
  let obol, sarcophagus, deathVerifier, mockVTHO, mockB3TR;
  let owner, user1, user2, oracle;
  let user1Address, user2Address;

  beforeEach(async function () {
    [owner, user1, user2, oracle] = await ethers.getSigners();
    user1Address = user1.address;
    user2Address = user2.address;

    // Deploy mock tokens
    const MockVTHO = await ethers.getContractFactory("MockVTHO");
    mockVTHO = await MockVTHO.deploy();
    
    const MockB3TR = await ethers.getContractFactory("MockB3TR");
    mockB3TR = await MockB3TR.deploy();

    // Deploy OBOL token
    const OBOL = await ethers.getContractFactory("OBOL");
    obol = await OBOL.deploy();

    // Deploy Death Verifier
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    deathVerifier = await DeathVerifier.deploy();

    // Deploy Sarcophagus
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    sarcophagus = await Sarcophagus.deploy(
      mockVTHO.address,
      mockB3TR.address,
      obol.address,
      deathVerifier.address,
      obol.address
    );

    // Setup roles
    const vaultRole = await obol.VAULT_ROLE();
    await obol.grantRole(vaultRole, sarcophagus.address);
    
    const oracleRole = await deathVerifier.ORACLE_ROLE();
    await deathVerifier.grantRole(oracleRole, oracle.address);
    
    const verifierRole = await sarcophagus.VERIFIER_ROLE();
    await sarcophagus.grantRole(verifierRole, owner.address);

    // Mint test tokens
    await mockVTHO.mint(user1Address, ethers.parseEther("1000"));
    await mockB3TR.mint(user1Address, ethers.parseEther("1000"));
    await mockVTHO.mint(user2Address, ethers.parseEther("1000"));
    await mockB3TR.mint(user2Address, ethers.parseEther("1000"));

    // Approve tokens
    await mockVTHO.connect(user1).approve(sarcophagus.address, ethers.parseEther("1000"));
    await mockB3TR.connect(user1).approve(sarcophagus.address, ethers.parseEther("1000"));
    await mockVTHO.connect(user2).approve(sarcophagus.address, ethers.parseEther("1000"));
    await mockB3TR.connect(user2).approve(sarcophagus.address, ethers.parseEther("1000"));
  });

  describe("Initial Setup", function () {
    it("Should deploy contracts correctly", async function () {
      expect(await obol.name()).to.equal("OBOL");
      expect(await obol.symbol()).to.equal("OBOL");
      expect(await obol.totalSupply()).to.equal(ethers.parseEther("1000000000")); // 1 billion
    });

    it("Should have correct tokenomics", async function () {
      const tokenomics = await obol.getTokenomics();
      expect(tokenomics.totalSupply).to.equal(ethers.parseEther("1000000000"));
      expect(tokenomics.initialSupply).to.equal(ethers.parseEther("50000000")); // 5%
      expect(tokenomics.rewardSupply).to.equal(ethers.parseEther("950000000")); // 95%
    });

    it("Should have correct earning rates", async function () {
      const rates = await obol.getEarningRates();
      expect(rates.initialBonusRate).to.equal(ethers.parseEther("10")); // 10:1 ratio
      expect(rates.dailyRate).to.equal(ethers.parseEther("0.01")); // 1% daily
      expect(rates.bonusRate).to.equal(ethers.parseEther("0.02")); // 2% daily
      expect(rates.bonusThreshold).to.equal(365 * 24 * 60 * 60); // 1 year
    });
  });

  describe("Initial Deposit Bonus", function () {
    beforeEach(async function () {
      // Verify user1
      await sarcophagus.verifyUser(user1Address, 30, "ipfs://verification1");
      
      // Create sarcophagus for user1
      await sarcophagus.connect(user1).createSarcophagus(
        [user2Address],
        [10000] // 100%
      );
    });

    it("Should give initial bonus on first deposit", async function () {
      const depositAmount = ethers.parseEther("100"); // 100 VET
      const expectedBonus = ethers.parseEther("1000"); // 10:1 ratio

      // Check initial balance
      const initialBalance = await obol.balanceOf(user1Address);
      expect(initialBalance).to.equal(0);

      // Make deposit
      await sarcophagus.connect(user1).depositTokens(
        0, // VTHO
        0, // B3TR
        { value: depositAmount } // VET
      );

      // Check final balance
      const finalBalance = await obol.balanceOf(user1Address);
      expect(finalBalance).to.equal(expectedBonus);
    });

    it("Should give initial bonus for token deposits", async function () {
      const vthoAmount = ethers.parseEther("50");
      const b3trAmount = ethers.parseEther("50");
      const totalValue = vthoAmount.add(b3trAmount);
      const expectedBonus = totalValue.mul(10); // 10:1 ratio

      // Make deposit
      await sarcophagus.connect(user1).depositTokens(
        vthoAmount,
        b3trAmount,
        { value: 0 }
      );

      // Check balance
      const balance = await obol.balanceOf(user1Address);
      expect(balance).to.equal(expectedBonus);
    });
  });

  describe("Continuous Earning", function () {
    beforeEach(async function () {
      // Verify user1
      await sarcophagus.verifyUser(user1Address, 30, "ipfs://verification1");
      
      // Create sarcophagus for user1
      await sarcophagus.connect(user1).createSarcophagus(
        [user2Address],
        [10000] // 100%
      );

      // Make initial deposit
      await sarcophagus.connect(user1).depositTokens(
        0,
        0,
        { value: ethers.parseEther("100") } // 100 VET
      );
    });

    it("Should start continuous earning after deposit", async function () {
      // Check initial stake
      const initialStake = await obol.getUserStake(user1Address);
      expect(initialStake.lockedValue).to.equal(ethers.parseEther("100"));
      expect(initialStake.startTime).to.be.gt(0);
      expect(initialStake.totalEarned).to.equal(ethers.parseEther("1000")); // Initial bonus
    });

    it("Should earn daily rewards", async function () {
      // Advance time by 1 day
      await time.increase(24 * 60 * 60);

      // Check pending rewards
      const pendingRewards = await obol.getPendingRewards(user1Address);
      const expectedRewards = ethers.parseEther("1"); // 1% of 100 VET
      expect(pendingRewards).to.equal(expectedRewards);

      // Claim rewards
      await sarcophagus.connect(user1).claimObolRewards();

      // Check total earned
      const stake = await obol.getUserStake(user1Address);
      expect(stake.totalEarned).to.equal(ethers.parseEther("1001")); // 1000 + 1
    });

    it("Should earn bonus rate after 1 year", async function () {
      // Advance time by 1 year
      await time.increase(365 * 24 * 60 * 60);

      // Check pending rewards (should be at bonus rate)
      const pendingRewards = await obol.getPendingRewards(user1Address);
      const expectedRewards = ethers.parseEther("2"); // 2% of 100 VET
      expect(pendingRewards).to.equal(expectedRewards);

      // Check if user is long-term holder
      const stake = await obol.getUserStake(user1Address);
      expect(stake.isLongTermHolder).to.be.true;
    });

    it("Should accumulate rewards over multiple days", async function () {
      // Advance time by 30 days
      await time.increase(30 * 24 * 60 * 60);

      // Check pending rewards
      const pendingRewards = await obol.getPendingRewards(user1Address);
      const expectedRewards = ethers.parseEther("30"); // 30 days * 1% daily
      expect(pendingRewards).to.equal(expectedRewards);

      // Claim rewards
      await sarcophagus.connect(user1).claimObolRewards();

      // Check total earned
      const stake = await obol.getUserStake(user1Address);
      expect(stake.totalEarned).to.equal(ethers.parseEther("1030")); // 1000 + 30
    });
  });

  describe("Hybrid System Integration", function () {
    beforeEach(async function () {
      // Verify user1
      await sarcophagus.verifyUser(user1Address, 30, "ipfs://verification1");
      
      // Create sarcophagus for user1
      await sarcophagus.connect(user1).createSarcophagus(
        [user2Address],
        [10000] // 100%
      );
    });

    it("Should give both initial bonus and continuous rewards", async function () {
      const depositAmount = ethers.parseEther("100");
      const expectedInitialBonus = ethers.parseEther("1000");

      // Make deposit
      await sarcophagus.connect(user1).depositTokens(
        0,
        0,
        { value: depositAmount }
      );

      // Check initial bonus
      let balance = await obol.balanceOf(user1Address);
      expect(balance).to.equal(expectedInitialBonus);

      // Advance time by 7 days
      await time.increase(7 * 24 * 60 * 60);

      // Claim continuous rewards
      await sarcophagus.connect(user1).claimObolRewards();

      // Check total balance
      balance = await obol.balanceOf(user1Address);
      const expectedTotal = expectedInitialBonus.add(ethers.parseEther("7")); // 1000 + 7 days
      expect(balance).to.equal(expectedTotal);
    });

    it("Should handle multiple deposits correctly", async function () {
      // First deposit
      await sarcophagus.connect(user1).depositTokens(
        0,
        0,
        { value: ethers.parseEther("100") }
      );

      // Advance time by 5 days
      await time.increase(5 * 24 * 60 * 60);

      // Second deposit
      await sarcophagus.connect(user1).depositTokens(
        0,
        0,
        { value: ethers.parseEther("50") }
      );

      // Check total locked value
      const stake = await obol.getUserStake(user1Address);
      expect(stake.lockedValue).to.equal(ethers.parseEther("150"));

      // Advance time by 2 more days
      await time.increase(2 * 24 * 60 * 60);

      // Claim rewards
      await sarcophagus.connect(user1).claimObolRewards();

      // Check total earned (1000 + 1000 + 50 + 5 days on 100 + 2 days on 150)
      const expectedTotal = ethers.parseEther("2050"); // 1000 + 1000 + 50 + 5 + 2*1.5
      const finalStake = await obol.getUserStake(user1Address);
      expect(finalStake.totalEarned).to.equal(expectedTotal);
    });
  });

  describe("OBOL Token Locking", function () {
    beforeEach(async function () {
      // Verify user1
      await sarcophagus.verifyUser(user1Address, 30, "ipfs://verification1");
      
      // Create sarcophagus for user1
      await sarcophagus.connect(user1).createSarcophagus(
        [user2Address],
        [10000] // 100%
      );

      // Make deposit to earn OBOL
      await sarcophagus.connect(user1).depositTokens(
        0,
        0,
        { value: ethers.parseEther("100") }
      );
    });

    it("Should allow locking OBOL tokens", async function () {
      const lockAmount = ethers.parseEther("500");
      
      // Approve OBOL spending
      await obol.connect(user1).approve(sarcophagus.address, lockAmount);

      // Lock OBOL tokens
      await sarcophagus.connect(user1).lockObolTokens(lockAmount);

      // Check OBOL balance in sarcophagus
      const sarcophagusData = await sarcophagus.getSarcophagus(user1Address);
      expect(sarcophagusData.obolAmount).to.equal(lockAmount);
    });

    it("Should include locked OBOL in inheritance", async function () {
      const lockAmount = ethers.parseEther("500");
      
      // Approve and lock OBOL
      await obol.connect(user1).approve(sarcophagus.address, lockAmount);
      await sarcophagus.connect(user1).lockObolTokens(lockAmount);

      // Verify death
      await sarcophagus.connect(oracle).verifyDeath(
        user1Address,
        80,
        85,
        "ipfs://death-certificate"
      );

      // Claim inheritance
      await sarcophagus.connect(user2).claimInheritance(user1Address);

      // Check if user2 received OBOL
      const user2Balance = await obol.balanceOf(user2Address);
      expect(user2Balance).to.equal(lockAmount);
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should not allow claiming rewards without sarcophagus", async function () {
      await expect(
        sarcophagus.connect(user1).claimObolRewards()
      ).to.be.revertedWithCustomError(sarcophagus, "SarcophagusNotExists");
    });

    it("Should not allow claiming rewards after death", async function () {
      // Setup user
      await sarcophagus.verifyUser(user1Address, 30, "ipfs://verification1");
      await sarcophagus.connect(user1).createSarcophagus([user2Address], [10000]);
      await sarcophagus.connect(user1).depositTokens(0, 0, { value: ethers.parseEther("100") });

      // Verify death
      await sarcophagus.connect(oracle).verifyDeath(user1Address, 80, 85, "ipfs://death-certificate");

      // Try to claim rewards
      await expect(
        sarcophagus.connect(user1).claimObolRewards()
      ).to.be.revertedWithCustomError(sarcophagus, "DeathNotVerified");
    });

    it("Should handle zero deposits correctly", async function () {
      await sarcophagus.verifyUser(user1Address, 30, "ipfs://verification1");
      await sarcophagus.connect(user1).createSarcophagus([user2Address], [10000]);

      // Try to deposit zero
      await expect(
        sarcophagus.connect(user1).depositTokens(0, 0, { value: 0 })
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidAmount");
    });
  });

  describe("Reward Supply Limits", function () {
    it("Should not exceed reward supply", async function () {
      // This would require a very large deposit to test
      // For now, we'll just verify the supply is correctly set
      const remainingSupply = await obol.getRemainingRewardSupply();
      expect(remainingSupply).to.equal(ethers.parseEther("950000000")); // 95% of total supply
    });
  });
}); 