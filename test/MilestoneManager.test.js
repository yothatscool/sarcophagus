const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MilestoneManager", function () {
  let milestoneManager;
  let vereavementAccess;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy VereavementAccess
    const VereavementAccess = await ethers.getContractFactory("VereavementAccess");
    vereavementAccess = await VereavementAccess.deploy();
    await vereavementAccess.deployed();
    
    // Deploy MilestoneManager
    const MilestoneManager = await ethers.getContractFactory("MilestoneManager");
    milestoneManager = await MilestoneManager.deploy(vereavementAccess.address);
    await milestoneManager.deployed();
    
    // Authorize MilestoneManager contract
    await vereavementAccess.authorizeContract(
      milestoneManager.address,
      "MilestoneManager"
    );
    
    // Grant necessary permissions
    await vereavementAccess.grantPermission(
      milestoneManager.address,
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STORAGE_WRITE"))
    );
  });

  describe("Milestone Management", function () {
    it("Should create milestone correctly", async function () {
      await milestoneManager.createMilestone(
        "Test Milestone",
        ethers.utils.parseEther("100"),
        86400 // 1 day
      );
      
      const milestone = await milestoneManager.getMilestone(0);
      expect(milestone.name).to.equal("Test Milestone");
      expect(milestone.reward).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should complete milestone correctly", async function () {
      await milestoneManager.createMilestone(
        "Test Milestone",
        ethers.utils.parseEther("100"),
        86400
      );
      
      await milestoneManager.completeMilestone(0, addr1.address);
      expect(await milestoneManager.isMilestoneCompleted(0, addr1.address)).to.be.true;
    });
  });

  describe("Access Control", function () {
    it("Should respect milestone creation permissions", async function () {
      await vereavementAccess.revokePermission(
        milestoneManager.address,
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STORAGE_WRITE"))
      );
      
      await expect(
        milestoneManager.createMilestone(
          "Test Milestone",
          ethers.utils.parseEther("100"),
          86400
        )
      ).to.be.revertedWith("Permission not granted");
    });
  });
}); 