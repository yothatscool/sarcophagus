const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Simplified Vereavement Protocol", function () {
  let sarcophagus, deathVerifier, owner, user1, user2, beneficiary1, beneficiary2;
  let mockVET, mockVTHO, mockB3TR;

  beforeEach(async function () {
    [owner, user1, user2, beneficiary1, beneficiary2] = await ethers.getSigners();

    // Deploy mock tokens
    const MockToken = await ethers.getContractFactory("MockVIP180");
    mockVET = await MockToken.deploy("VET", "VET");
    mockVTHO = await MockToken.deploy("VTHO", "VTHO");
    mockB3TR = await MockToken.deploy("B3TR", "B3TR");

    // Deploy DeathVerifier
    const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
    deathVerifier = await DeathVerifier.deploy();

    // Deploy Sarcophagus
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    sarcophagus = await Sarcophagus.deploy(mockB3TR.address, deathVerifier.address);

    // Setup roles
    await sarcophagus.grantRole(await sarcophagus.VERIFIER_ROLE(), owner.address);
    await sarcophagus.grantRole(await sarcophagus.ORACLE_ROLE(), owner.address);

    // Mint tokens to users
    await mockVET.mint(user1.address, ethers.utils.parseEther("10000"));
    await mockVTHO.mint(user1.address, ethers.utils.parseEther("10000"));
    await mockB3TR.mint(user1.address, ethers.utils.parseEther("10000"));

    // Approve tokens
    await mockVET.connect(user1).approve(sarcophagus.address, ethers.constants.MaxUint256);
    await mockVTHO.connect(user1).approve(sarcophagus.address, ethers.constants.MaxUint256);
    await mockB3TR.connect(user1).approve(sarcophagus.address, ethers.constants.MaxUint256);
  });

  describe("User Verification", function () {
    it("Should verify a user", async function () {
      await sarcophagus.verifyUser(user1.address, 30, "ipfs://verification-hash");
      expect(await sarcophagus.isUserVerified(user1.address)).to.be.true;
    });

    it("Should not allow unverified users to create sarcophagus", async function () {
      await expect(
        sarcophagus.connect(user1).createSarcophagus([beneficiary1.address], [10000])
      ).to.be.revertedWithCustomError(sarcophagus, "NotVerified");
    });
  });

  describe("Sarcophagus Creation", function () {
    beforeEach(async function () {
      await sarcophagus.verifyUser(user1.address, 30, "ipfs://verification-hash");
    });

    it("Should create a sarcophagus with single beneficiary", async function () {
      await sarcophagus.connect(user1).createSarcophagus([beneficiary1.address], [10000]);
      
      const sarc = await sarcophagus.getSarcophagus(user1.address);
      const beneficiaries = await sarcophagus.getBeneficiaries(user1.address);
      expect(beneficiaries.length).to.equal(1);
      expect(beneficiaries[0].recipient).to.equal(beneficiary1.address);
      expect(beneficiaries[0].percentage).to.equal(10000);
      expect(sarc.createdAt).to.be.gt(0);
    });

    it("Should create a sarcophagus with multiple beneficiaries", async function () {
      await sarcophagus.connect(user1).createSarcophagus(
        [beneficiary1.address, beneficiary2.address], 
        [6000, 4000]
      );
      
      const beneficiaries = await sarcophagus.getBeneficiaries(user1.address);
      expect(beneficiaries.length).to.equal(2);
      expect(beneficiaries[0].recipient).to.equal(beneficiary1.address);
      expect(beneficiaries[0].percentage).to.equal(6000);
      expect(beneficiaries[1].recipient).to.equal(beneficiary2.address);
      expect(beneficiaries[1].percentage).to.equal(4000);
    });

    it("Should not allow creating multiple sarcophagi", async function () {
      await sarcophagus.connect(user1).createSarcophagus([beneficiary1.address], [10000]);
      
      await expect(
        sarcophagus.connect(user1).createSarcophagus([beneficiary2.address], [10000])
      ).to.be.revertedWithCustomError(sarcophagus, "SarcophagusAlreadyExists");
    });

    it("Should reject invalid beneficiary count", async function () {
      await expect(
        sarcophagus.connect(user1).createSarcophagus([], [])
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidBeneficiaryCount");
    });

    it("Should reject mismatched arrays", async function () {
      await expect(
        sarcophagus.connect(user1).createSarcophagus([beneficiary1.address], [6000, 4000])
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidBeneficiaryCount");
    });

    it("Should reject percentages not totaling 100%", async function () {
      await expect(
        sarcophagus.connect(user1).createSarcophagus([beneficiary1.address, beneficiary2.address], [6000, 3000])
      ).to.be.revertedWithCustomError(sarcophagus, "TotalPercentageNot100");
    });

    it("Should reject zero address beneficiary", async function () {
      await expect(
        sarcophagus.connect(user1).createSarcophagus([ethers.constants.AddressZero], [10000])
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidBeneficiary");
    });
  });

  describe("Token Deposits", function () {
    beforeEach(async function () {
      await sarcophagus.verifyUser(user1.address, 30, "ipfs://verification-hash");
      await sarcophagus.connect(user1).createSarcophagus([beneficiary1.address], [10000]);
    });

    it("Should deposit tokens", async function () {
      const vetAmount = ethers.utils.parseEther("1000");
      const vthoAmount = ethers.utils.parseEther("500");
      const b3trAmount = ethers.utils.parseEther("100");

      await sarcophagus.connect(user1).depositTokens(vetAmount, vthoAmount, b3trAmount);

      const sarc = await sarcophagus.getSarcophagus(user1.address);
      expect(sarc.vetAmount).to.equal(vetAmount);
      expect(sarc.vthoAmount).to.equal(vthoAmount);
      expect(sarc.b3trAmount).to.equal(b3trAmount);
    });

    it("Should enforce minimum deposit", async function () {
      const smallAmount = ethers.utils.parseEther("50"); // Below 100 VET minimum
      
      await expect(
        sarcophagus.connect(user1).depositTokens(smallAmount, 0, 0)
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidAmount");
    });

    it("Should enforce rate limiting", async function () {
      const largeAmount = ethers.utils.parseEther("1000000"); // Above daily limit
      
      await expect(
        sarcophagus.connect(user1).depositTokens(largeAmount, 0, 0)
      ).to.be.revertedWithCustomError(sarcophagus, "RateLimitExceeded");
    });
  });

  describe("Death Verification", function () {
    beforeEach(async function () {
      await sarcophagus.verifyUser(user1.address, 30, "ipfs://verification-hash");
      await sarcophagus.connect(user1).createSarcophagus([beneficiary1.address], [10000]);
      await sarcophagus.connect(user1).depositTokens(
        ethers.utils.parseEther("1000"),
        ethers.utils.parseEther("500"),
        ethers.utils.parseEther("100")
      );
    });

    it("Should verify death and calculate bonus", async function () {
      const deathTimestamp = Math.floor(Date.now() / 1000);
      const age = 65; // Early death (life expectancy 80)
      const lifeExpectancy = 80;

      await sarcophagus.verifyDeath(user1.address, deathTimestamp, age, lifeExpectancy, "ipfs://death-cert");

      const sarc = await sarcophagus.getSarcophagus(user1.address);
      expect(sarc.isDeceased).to.be.true;
      expect(sarc.deathTimestamp).to.equal(deathTimestamp);
      expect(sarc.actualAge).to.equal(age);
      expect(sarc.lifeExpectancy).to.equal(lifeExpectancy);
    });
  });

  describe("Inheritance Claims", function () {
    beforeEach(async function () {
      await sarcophagus.verifyUser(user1.address, 30, "ipfs://verification-hash");
      await sarcophagus.connect(user1).createSarcophagus([beneficiary1.address], [10000]);
      await sarcophagus.connect(user1).depositTokens(
        ethers.utils.parseEther("1000"),
        ethers.utils.parseEther("500"),
        ethers.utils.parseEther("100")
      );
      
      // Verify death
      await sarcophagus.verifyDeath(user1.address, Date.now(), 65, 80, "ipfs://death-cert");
    });

    it("Should allow beneficiary to claim inheritance", async function () {
      const initialBalance = await mockVET.balanceOf(beneficiary1.address);
      
      await sarcophagus.connect(beneficiary1).claimInheritance(user1.address);
      
      const finalBalance = await mockVET.balanceOf(beneficiary1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should not allow non-beneficiary to claim", async function () {
      await expect(
        sarcophagus.connect(user2).claimInheritance(user1.address)
      ).to.be.revertedWithCustomError(sarcophagus, "InvalidBeneficiary");
    });
  });

  describe("Multiple Beneficiaries", function () {
    beforeEach(async function () {
      await sarcophagus.verifyUser(user1.address, 30, "ipfs://verification-hash");
      await sarcophagus.connect(user1).createSarcophagus(
        [beneficiary1.address, beneficiary2.address], 
        [6000, 4000]
      );
      await sarcophagus.connect(user1).depositTokens(
        ethers.utils.parseEther("1000"),
        ethers.utils.parseEther("500"),
        ethers.utils.parseEther("100")
      );
      
      // Verify death
      await sarcophagus.verifyDeath(user1.address, Date.now(), 65, 80, "ipfs://death-cert");
    });

    it("Should allow first beneficiary to claim their share", async function () {
      const initialBalance = await mockVET.balanceOf(beneficiary1.address);
      
      await sarcophagus.connect(beneficiary1).claimInheritance(user1.address);
      
      const finalBalance = await mockVET.balanceOf(beneficiary1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should allow second beneficiary to claim their share", async function () {
      const initialBalance = await mockVET.balanceOf(beneficiary2.address);
      
      await sarcophagus.connect(beneficiary2).claimInheritance(user1.address);
      
      const finalBalance = await mockVET.balanceOf(beneficiary2.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should calculate correct percentages", async function () {
      const initialBalance1 = await mockVET.balanceOf(beneficiary1.address);
      const initialBalance2 = await mockVET.balanceOf(beneficiary2.address);
      
      await sarcophagus.connect(beneficiary1).claimInheritance(user1.address);
      await sarcophagus.connect(beneficiary2).claimInheritance(user1.address);
      
      const finalBalance1 = await mockVET.balanceOf(beneficiary1.address);
      const finalBalance2 = await mockVET.balanceOf(beneficiary2.address);
      
      const share1 = finalBalance1.sub(initialBalance1);
      const share2 = finalBalance2.sub(initialBalance2);
      
      // Check that share1 is approximately 60% and share2 is 40% of total
      const totalShare = share1.add(share2);
      expect(share1.mul(100).div(totalShare)).to.be.closeTo(60, 1);
      expect(share2.mul(100).div(totalShare)).to.be.closeTo(40, 1);
    });
  });
}); 