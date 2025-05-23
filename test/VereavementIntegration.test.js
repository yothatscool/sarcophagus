const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vereavement Integration", function () {
  let vereavement;
  let ageVerification;
  let tokenManager;
  let milestoneManager;
  let vereavementAccess;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy all contracts
    const VereavementAccess = await ethers.getContractFactory("VereavementAccess");
    vereavementAccess = await VereavementAccess.deploy();
    await vereavementAccess.deployed();
    
    const AgeVerification = await ethers.getContractFactory("AgeVerification");
    ageVerification = await AgeVerification.deploy(vereavementAccess.address);
    await ageVerification.deployed();
    
    const TokenManager = await ethers.getContractFactory("TokenManager");
    tokenManager = await TokenManager.deploy(vereavementAccess.address);
    await tokenManager.deployed();
    
    const MilestoneManager = await ethers.getContractFactory("MilestoneManager");
    milestoneManager = await MilestoneManager.deploy(vereavementAccess.address);
    await milestoneManager.deployed();
    
    const Vereavement = await ethers.getContractFactory("Vereavement");
    vereavement = await Vereavement.deploy(
      vereavementAccess.address,
      ageVerification.address,
      tokenManager.address,
      milestoneManager.address
    );
    await vereavement.deployed();
    
    // Authorize all contracts
    await vereavementAccess.authorizeContract(ageVerification.address, "AgeVerification");
    await vereavementAccess.authorizeContract(tokenManager.address, "TokenManager");
    await vereavementAccess.authorizeContract(milestoneManager.address, "MilestoneManager");
    await vereavementAccess.authorizeContract(vereavement.address, "Vereavement");
    
    // Grant permissions
    const STORAGE_WRITE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STORAGE_WRITE"));
    const STORAGE_READ = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STORAGE_READ"));
    
    for (const contract of [ageVerification, tokenManager, milestoneManager, vereavement]) {
      await vereavementAccess.grantPermission(contract.address, STORAGE_WRITE);
      await vereavementAccess.grantPermission(contract.address, STORAGE_READ);
    }
  });

  describe("Full User Journey", function () {
    it("Should handle complete user flow", async function () {
      // 1. Verify age
      const birthDate = Math.floor(Date.now() / 1000) - (20 * 365 * 24 * 60 * 60);
      await ageVerification.verifyAge(user1.address, birthDate);
      expect(await ageVerification.isAgeVerified(user1.address)).to.be.true;

      // 2. Create milestone
      await milestoneManager.createMilestone(
        "First Login",
        ethers.utils.parseEther("10"),
        86400
      );

      // 3. Complete milestone and earn tokens
      await milestoneManager.completeMilestone(0, user1.address);
      expect(await milestoneManager.isMilestoneCompleted(0, user1.address)).to.be.true;
      expect(await tokenManager.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("10"));

      // 4. Transfer tokens
      await tokenManager.connect(user1).transfer(user2.address, ethers.utils.parseEther("5"));
      expect(await tokenManager.balanceOf(user2.address)).to.equal(ethers.utils.parseEther("5"));
    });
  });

  describe("Permission Interactions", function () {
    it("Should respect permission hierarchy", async function () {
      const STORAGE_WRITE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STORAGE_WRITE"));
      
      // Revoke permission from TokenManager
      await vereavementAccess.revokePermission(tokenManager.address, STORAGE_WRITE);
      
      // Attempt to mint tokens should fail
      await expect(
        tokenManager.mint(user1.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Permission not granted");
    });
  });

  describe("Cross-Contract Events", function () {
    it("Should emit events across contracts", async function () {
      const birthDate = Math.floor(Date.now() / 1000) - (20 * 365 * 24 * 60 * 60);
      
      await expect(ageVerification.verifyAge(user1.address, birthDate))
        .to.emit(ageVerification, "AgeVerified")
        .withArgs(user1.address, birthDate);
      
      await expect(tokenManager.mint(user1.address, ethers.utils.parseEther("100")))
        .to.emit(tokenManager, "Transfer")
        .withArgs(ethers.constants.AddressZero, user1.address, ethers.utils.parseEther("100"));
    });
  });
}); 