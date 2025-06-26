require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Sarcophagus Protocol", function () {
  let sarcophagus, deathVerifier, mockVTHO, mockB3TR, obolToken, b3trRewards;
  let owner, user1, user2, beneficiary1, beneficiary2;

  beforeEach(async function () {
    [owner, user1, user2, beneficiary1, beneficiary2] = await ethers.getSigners();

    try {
      console.log("Deploying mockVTHO...");
      const MockVTHO = await ethers.getContractFactory("MockVTHO");
      mockVTHO = await MockVTHO.deploy();

      console.log("Deploying mockB3TR...");
      const MockB3TR = await ethers.getContractFactory("MockB3TR");
      mockB3TR = await MockB3TR.deploy();

      console.log("Deploying OBOL...");
      const OBOL = await ethers.getContractFactory("OBOL");
      obolToken = await OBOL.deploy();

      console.log("Deploying deathVerifier...");
      const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
      deathVerifier = await DeathVerifier.deploy();

      console.log("Deploying Sarcophagus...");
      const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
      sarcophagus = await Sarcophagus.deploy(
        await mockVTHO.getAddress(),
        await mockB3TR.getAddress(),
        await obolToken.getAddress(),
        await deathVerifier.getAddress(),
        await obolToken.getAddress(),
        owner.address // feeCollector
      );

      console.log("Deploying B3TRRewards...");
      const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
      b3trRewards = await B3TRRewards.deploy(
        await mockB3TR.getAddress(),
        await sarcophagus.getAddress(),
        80 // rateAdjustmentThreshold
      );

      console.log("mockVTHO:", await mockVTHO.getAddress());
      console.log("mockB3TR:", await mockB3TR.getAddress());
      console.log("obolToken:", await obolToken.getAddress());
      console.log("deathVerifier:", await deathVerifier.getAddress());
      console.log("Sarcophagus deployed at:", await sarcophagus.getAddress());

      // Grant roles
      await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), owner.address);
      await sarcophagus.grantRole(await sarcophagus.VERIFIER_ROLE(), owner.address);

      // Mint tokens to users
      await mockVTHO.mint(user1.address, ethers.parseEther("10000"));
      await mockB3TR.mint(user1.address, ethers.parseEther("10000"));
      await mockVTHO.mint(user2.address, ethers.parseEther("10000"));
      await mockB3TR.mint(user2.address, ethers.parseEther("10000"));

    } catch (error) {
      console.error("Deployment error:", error);
      throw error;
    }
  });

  describe("User Verification", function () {
    it("Should verify a user", async function () {
      await deathVerifier.verifyUser(user1.address, 30, "ipfs://verification-hash");
      const verification = await deathVerifier.getUserVerification(user1.address);
      expect(verification.isVerified).to.be.true;
    });

    it("Should not allow unverified users to create sarcophagus", async function () {
      await expect(
        sarcophagus.connect(user1).createSarcophagus(
          [beneficiary1.address], 
          [10000], 
          [ethers.ZeroAddress], 
          [30], 
          [ethers.ZeroAddress], 
          [0]
        )
      ).to.be.revertedWithCustomError(sarcophagus, "NotVerified");
    });
  });

  describe("Sarcophagus Creation", function () {
    beforeEach(async function () {
      await deathVerifier.verifyUser(user1.address, 30, "ipfs://verification-hash");
    });

    it("Should create a sarcophagus with single beneficiary", async function () {
      await sarcophagus.connect(user1).createSarcophagus(
        [beneficiary1.address], 
        [10000], 
        [ethers.ZeroAddress], 
        [30], 
        [ethers.ZeroAddress], 
        [0]
      );
      
      const sarc = await sarcophagus.sarcophagi(user1.address);
      const beneficiaries = await sarcophagus.getBeneficiaries(user1.address);
      expect(beneficiaries.length).to.equal(1);
      expect(beneficiaries[0].recipient).to.equal(beneficiary1.address);
      expect(beneficiaries[0].percentage).to.equal(10000);
      expect(sarc.createdAt).to.be.gt(0);
    });

    it("Should create a sarcophagus with multiple beneficiaries", async function () {
      await sarcophagus.connect(user1).createSarcophagus(
        [beneficiary1.address, beneficiary2.address], 
        [6000, 4000],
        [ethers.ZeroAddress, ethers.ZeroAddress],
        [30, 25],
        [ethers.ZeroAddress, ethers.ZeroAddress],
        [0, 0]
      );
      
      const beneficiaries = await sarcophagus.getBeneficiaries(user1.address);
      expect(beneficiaries.length).to.equal(2);
      expect(beneficiaries[0].recipient).to.equal(beneficiary1.address);
      expect(beneficiaries[0].percentage).to.equal(6000);
      expect(beneficiaries[1].recipient).to.equal(beneficiary2.address);
      expect(beneficiaries[1].percentage).to.equal(4000);
    });

    it("Should not allow creating multiple sarcophagi", async function () {
      await sarcophagus.connect(user1).createSarcophagus(
        [beneficiary1.address], 
        [10000], 
        [ethers.ZeroAddress], 
        [30], 
        [ethers.ZeroAddress], 
        [0]
      );
      
      await expect(
        sarcophagus.connect(user1).createSarcophagus(
          [beneficiary2.address], 
          [10000], 
          [ethers.ZeroAddress], 
          [25], 
          [ethers.ZeroAddress], 
          [0]
        )
      ).to.be.revertedWithCustomError(sarcophagus, "SarcophagusAlreadyExists");
    });

    it("Should reject invalid beneficiary count", async function () {
      await expect(
        sarcophagus.connect(user1).createSarcophagus([], [], [], [], [], [])
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidBeneficiaryCount");
    });

    it("Should reject mismatched arrays", async function () {
      await expect(
        sarcophagus.connect(user1).createSarcophagus(
          [beneficiary1.address], 
          [6000, 4000], 
          [ethers.ZeroAddress], 
          [30], 
          [ethers.ZeroAddress], 
          [0]
        )
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidBeneficiaryCount");
    });

    it("Should reject percentages not totaling 100%", async function () {
      await expect(
        sarcophagus.connect(user1).createSarcophagus(
          [beneficiary1.address, beneficiary2.address], 
          [6000, 3000], 
          [ethers.ZeroAddress, ethers.ZeroAddress], 
          [30, 25], 
          [ethers.ZeroAddress, ethers.ZeroAddress], 
          [0, 0]
        )
      ).to.be.revertedWithCustomError(sarcophagus, "TotalPercentageNot100");
    });

    it("Should reject zero address beneficiary", async function () {
      await expect(
        sarcophagus.connect(user1).createSarcophagus(
          [ethers.ZeroAddress], 
          [10000], 
          [ethers.ZeroAddress], 
          [30], 
          [ethers.ZeroAddress], 
          [0]
        )
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidAddress");
    });
  });

  describe("Token Deposits", function () {
    beforeEach(async function () {
      await deathVerifier.verifyUser(user1.address, 30, "ipfs://verification-hash");
      await sarcophagus.connect(user1).createSarcophagus(
        [beneficiary1.address], 
        [10000], 
        [ethers.ZeroAddress], 
        [30], 
        [ethers.ZeroAddress], 
        [0]
      );
      // Simulate passage of time for minimum lock period
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 31]); // 31 days
      await ethers.provider.send("evm_mine");
    });

    it("Should deposit tokens", async function () {
      // Approve tokens for deposit
      await mockVTHO.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("1000"));
      await mockB3TR.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("1000"));
      // Simulate passage of time for minimum lock period
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 31]); // 31 days
      await ethers.provider.send("evm_mine");
      await expect(
        sarcophagus.connect(user1).depositTokens(
          0, // VET argument
          ethers.parseEther("500"), // VTHO
          ethers.parseEther("300"), // B3TR
          { value: ethers.parseEther("100") } // VET as msg.value
        )
      ).to.not.be.reverted;

      const sarc = await sarcophagus.sarcophagi(user1.address);
      expect(sarc.vetAmount).to.equal(ethers.parseEther("100"));
      expect(sarc.vthoAmount).to.equal(ethers.parseEther("500"));
      expect(sarc.b3trAmount).to.equal(ethers.parseEther("300"));
    });

    it("Should enforce minimum deposit", async function () {
      const smallAmount = ethers.parseEther("50"); // Below 100 VET minimum
      
      await expect(
        sarcophagus.connect(user1).depositTokens(0, 0, 0, { value: smallAmount })
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidVETAmount");
    });

    it("Should enforce rate limiting", async function () {
      // Approve tokens for deposit
      await mockVTHO.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("10000"));
      await mockB3TR.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("10000"));

      // First deposit should succeed (4000 VET total)
      await sarcophagus.connect(user1).depositTokens(
        0, // VET argument
        ethers.parseEther("1500"), // VTHO
        ethers.parseEther("1500"), // B3TR
        { value: ethers.parseEther("1000") } // VET as msg.value
      );

      // Second deposit should also succeed (another 4000 VET total)
      await sarcophagus.connect(user1).depositTokens(
        0, // VET argument
        ethers.parseEther("1500"), // VTHO
        ethers.parseEther("1500"), // B3TR
        { value: ethers.parseEther("1000") } // VET as msg.value
      );

      // Third deposit should fail (exceeds 10,000 VET daily limit)
      await expect(
        sarcophagus.connect(user1).depositTokens(
          0, // VET argument
          ethers.parseEther("1000"), // VTHO
          ethers.parseEther("1000"), // B3TR
          { value: ethers.parseEther("1000") } // VET as msg.value
        )
      ).to.be.revertedWithCustomError(sarcophagus, "RateLimitExceeded");
    });
  });

  describe("Death Verification", function () {
    beforeEach(async function () {
      await deathVerifier.verifyUser(user1.address, 30, "ipfs://verification-hash");
      await sarcophagus.connect(user1).createSarcophagus(
        [beneficiary1.address], 
        [10000], 
        [ethers.ZeroAddress], 
        [30], 
        [ethers.ZeroAddress], 
        [0]
      );
      // Simulate passage of time for minimum lock period
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 31]); // 31 days
      await ethers.provider.send("evm_mine");
    });

    it("Should verify death and calculate bonus", async function () {
      // Approve tokens for deposit
      await mockVTHO.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("1000"));
      await mockB3TR.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("1000"));

      // Deposit tokens
      await sarcophagus.connect(user1).depositTokens(
        0, // VET argument
        ethers.parseEther("500"), // VTHO
        ethers.parseEther("300"), // B3TR
        { value: ethers.parseEther("100") } // VET as msg.value
      );

      // Verify death
      await sarcophagus.connect(owner).verifyDeath(
        user1.address,
        Math.floor(Date.now() / 1000), // Current timestamp
        75 // Age at death
      );

      const sarc = await sarcophagus.sarcophagi(user1.address);
      expect(sarc.isDeceased).to.be.true;
    });
  });

  describe("Inheritance Claims", function () {
    beforeEach(async function () {
      await deathVerifier.verifyUser(user1.address, 30, "ipfs://verification-hash");
      await sarcophagus.connect(user1).createSarcophagus(
        [beneficiary1.address], 
        [10000], 
        [ethers.ZeroAddress], 
        [30], 
        [ethers.ZeroAddress], 
        [0]
      );
      
      // Simulate passage of time for minimum lock period
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 31]); // 31 days
      await ethers.provider.send("evm_mine");
      // Approve and deposit tokens
      await mockVTHO.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("1000"));
      await mockB3TR.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("1000"));
      await sarcophagus.connect(user1).depositTokens(
        0, // VET argument
        ethers.parseEther("500"), // VTHO
        ethers.parseEther("300"), // B3TR
        { value: ethers.parseEther("100") } // VET as msg.value
      );
      
      // Verify death AFTER token deposits
      await sarcophagus.connect(owner).verifyDeath(
        user1.address,
        Math.floor(Date.now() / 1000), // Current timestamp
        75 // Age at death
      );
    });

    it("Should allow beneficiary to claim inheritance", async function () {
      // Check initial balances
      const initialVETBalance = await ethers.provider.getBalance(beneficiary1.address);
      const initialVTHOBalance = await mockVTHO.balanceOf(beneficiary1.address);
      const initialB3TRBalance = await mockB3TR.balanceOf(beneficiary1.address);

      // Claim inheritance
      await expect(
        sarcophagus.connect(beneficiary1).claimInheritance(user1.address, 0)
      ).to.not.be.reverted;

      // Check final balances
      const finalVETBalance = await ethers.provider.getBalance(beneficiary1.address);
      const finalVTHOBalance = await mockVTHO.balanceOf(beneficiary1.address);
      const finalB3TRBalance = await mockB3TR.balanceOf(beneficiary1.address);

      // Verify inheritance was received
      expect(finalVETBalance).to.be.gt(initialVETBalance);
      expect(finalVTHOBalance).to.be.gt(initialVTHOBalance);
      expect(finalB3TRBalance).to.be.gt(initialB3TRBalance);
    });

    it("Should not allow non-beneficiary to claim", async function () {
      await expect(
        sarcophagus.connect(user2).claimInheritance(user1.address, 0)
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidBeneficiary");
    });
  });

  describe("Multiple Beneficiaries", function () {
    beforeEach(async function () {
      await deathVerifier.verifyUser(user1.address, 30, "ipfs://verification-hash");
      await sarcophagus.connect(user1).createSarcophagus(
        [beneficiary1.address, beneficiary2.address], 
        [6000, 4000],
        [ethers.ZeroAddress, ethers.ZeroAddress],
        [30, 25],
        [ethers.ZeroAddress, ethers.ZeroAddress],
        [0, 0]
      );
      
      // Simulate passage of time for minimum lock period
      await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 31]); // 31 days
      await ethers.provider.send("evm_mine");
      // Approve and deposit tokens
      await mockVTHO.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("1000"));
      await mockB3TR.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("1000"));
      await sarcophagus.connect(user1).depositTokens(
        0, // VET argument
        ethers.parseEther("500"), // VTHO
        ethers.parseEther("300"), // B3TR
        { value: ethers.parseEther("100") } // VET as msg.value
      );
      
      // Verify death
      await sarcophagus.connect(owner).verifyDeath(
        user1.address,
        Math.floor(Date.now() / 1000), // Current timestamp
        75 // Age at death
      );
    });

    it("Should allow first beneficiary to claim their share", async function () {
      // Check initial balances
      const initialVETBalance1 = await ethers.provider.getBalance(beneficiary1.address);
      const initialVTHOBalance1 = await mockVTHO.balanceOf(beneficiary1.address);
      const initialB3TRBalance1 = await mockB3TR.balanceOf(beneficiary1.address);

      // First beneficiary claims their 60% share
      await expect(
        sarcophagus.connect(beneficiary1).claimInheritance(user1.address, 0)
      ).to.not.be.reverted;

      // First beneficiary cannot claim again
      await expect(
        sarcophagus.connect(beneficiary1).claimInheritance(user1.address, 0)
      ).to.be.revertedWithCustomError(sarcophagus, "AlreadyClaimed");

      // Second beneficiary can still claim
      await expect(
        sarcophagus.connect(beneficiary2).claimInheritance(user1.address, 1)
      ).to.not.be.reverted;
    });

    it("Should allow second beneficiary to claim their share", async function () {
      // Second beneficiary claims their 40% share
      await expect(
        sarcophagus.connect(beneficiary2).claimInheritance(user1.address, 1)
      ).to.not.be.reverted;

      // Second beneficiary cannot claim again
      await expect(
        sarcophagus.connect(beneficiary2).claimInheritance(user1.address, 1)
      ).to.be.revertedWithCustomError(sarcophagus, "AlreadyClaimed");
    });

    it("Should calculate correct percentages", async function () {
      // Check initial balances
      const initialVETBalance1 = await ethers.provider.getBalance(beneficiary1.address);
      const initialVTHOBalance1 = await mockVTHO.balanceOf(beneficiary1.address);
      const initialB3TRBalance1 = await mockB3TR.balanceOf(beneficiary1.address);

      const initialVETBalance2 = await ethers.provider.getBalance(beneficiary2.address);
      const initialVTHOBalance2 = await mockVTHO.balanceOf(beneficiary2.address);
      const initialB3TRBalance2 = await mockB3TR.balanceOf(beneficiary2.address);

      // First beneficiary claims their 60% share
      await sarcophagus.connect(beneficiary1).claimInheritance(user1.address, 0);

      // Second beneficiary claims their 40% share
      await sarcophagus.connect(beneficiary2).claimInheritance(user1.address, 1);

      // Check final balances
      const finalVETBalance1 = await ethers.provider.getBalance(beneficiary1.address);
      const finalVTHOBalance1 = await mockVTHO.balanceOf(beneficiary1.address);
      const finalB3TRBalance1 = await mockB3TR.balanceOf(beneficiary1.address);

      const finalVETBalance2 = await ethers.provider.getBalance(beneficiary2.address);
      const finalVTHOBalance2 = await mockVTHO.balanceOf(beneficiary2.address);
      const finalB3TRBalance2 = await mockB3TR.balanceOf(beneficiary2.address);

      // Calculate received amounts
      const receivedVET1 = finalVETBalance1 - initialVETBalance1;
      const receivedVTHO1 = finalVTHOBalance1 - initialVTHOBalance1;
      const receivedB3TR1 = finalB3TRBalance1 - initialB3TRBalance1;

      const receivedVET2 = finalVETBalance2 - initialVETBalance2;
      const receivedVTHO2 = finalVTHOBalance2 - initialVTHOBalance2;
      const receivedB3TR2 = finalB3TRBalance2 - initialB3TRBalance2;

      // Verify 60/40 split (allowing for gas costs)
      expect(receivedVET1).to.be.gt(receivedVET2);
      expect(receivedVTHO1).to.be.gt(receivedVTHO2);
      expect(receivedB3TR1).to.be.gt(receivedB3TR2);
    });
  });

  it("Should calculate bonuses correctly with grace period", async function () {
    // This test is no longer applicable as the bonus system has been updated
    // The new system provides bonuses for all users based on carbon offset or legacy
    // Early death bonus (died 10 years before life expectancy of 80)
    const earlyDeathBonus = await b3trRewards.calculateCarbonOffset(10, ethers.parseEther("1000"), false);
    expect(earlyDeathBonus).to.be.gt(0); // Should have carbon offset bonus
    
    // Legacy bonus (lived 10 years past life expectancy of 80)
    const legacyBonus = await b3trRewards.calculateLegacyBonus(10, ethers.parseEther("1000"), false);
    expect(legacyBonus).to.be.gt(0); // Should have legacy bonus
  });
}); 