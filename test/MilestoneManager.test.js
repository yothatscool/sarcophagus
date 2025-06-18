const { expect } = require("chai");
const { ethers } = require("hardhat");
const { ROLES, ZERO_ADDRESS, toWei } = require("./helpers/TestUtils");

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
    
    // Deploy MilestoneManager
    const MilestoneManager = await ethers.getContractFactory("MilestoneManager");
    milestoneManager = await MilestoneManager.deploy(vereavementAccess.target);
    
    // Grant necessary permissions
    await vereavementAccess.grantPermission(
      milestoneManager.target,
      ROLES.STORAGE_WRITE
    );
  });

  describe("Milestone Management", function () {
    it("Should create milestone correctly", async function () {
      const milestone = {
        amount: toWei("100"),
        condition: "Complete 10 carbon offsets",
        isCompleted: false
      };

      await milestoneManager.createMilestone(addr1.address, milestone.amount, milestone.condition);
      const [amount, condition, isCompleted] = await milestoneManager.getMilestone(addr1.address, 0);
      
      expect(amount).to.equal(milestone.amount);
      expect(condition).to.equal(milestone.condition);
      expect(isCompleted).to.equal(milestone.isCompleted);
    });

    it("Should complete milestone correctly", async function () {
      const milestone = {
        amount: toWei("100"),
        condition: "Complete 10 carbon offsets",
        isCompleted: false
      };

      await milestoneManager.createMilestone(addr1.address, milestone.amount, milestone.condition);
      await milestoneManager.completeMilestone(addr1.address, 0);
      
      const [, , isCompleted] = await milestoneManager.getMilestone(addr1.address, 0);
      expect(isCompleted).to.be.true;
    });

    it("Should not allow completing non-existent milestone", async function () {
      await expect(
        milestoneManager.completeMilestone(addr1.address, 0)
      ).to.be.revertedWithCustomError(milestoneManager, "MilestoneNotFound");
    });
  });

  describe("Batch Operations", function () {
    it("Should create multiple milestones in batch", async function () {
      const milestones = [
        {
          amount: toWei("100"),
          condition: "First milestone",
          isCompleted: false
        },
        {
          amount: toWei("200"),
          condition: "Second milestone",
          isCompleted: false
        }
      ];

      const amounts = milestones.map(m => m.amount);
      const conditions = milestones.map(m => m.condition);

      await milestoneManager.createMilestonesBatch(addr1.address, amounts, conditions);

      for (let i = 0; i < milestones.length; i++) {
        const [amount, condition, isCompleted] = await milestoneManager.getMilestone(addr1.address, i);
        expect(amount).to.equal(milestones[i].amount);
        expect(condition).to.equal(milestones[i].condition);
        expect(isCompleted).to.equal(milestones[i].isCompleted);
      }
    });

    it("Should complete multiple milestones in batch", async function () {
      const milestones = [
        {
          amount: toWei("100"),
          condition: "First milestone",
          isCompleted: false
        },
        {
          amount: toWei("200"),
          condition: "Second milestone",
          isCompleted: false
        }
      ];

      const amounts = milestones.map(m => m.amount);
      const conditions = milestones.map(m => m.condition);

      await milestoneManager.createMilestonesBatch(addr1.address, amounts, conditions);
      await milestoneManager.completeMilestonesBatch(addr1.address, [0, 1]);

      for (let i = 0; i < milestones.length; i++) {
        const [, , isCompleted] = await milestoneManager.getMilestone(addr1.address, i);
        expect(isCompleted).to.be.true;
      }
    });
  });

  describe("Access Control", function () {
    it("Should respect storage permissions", async function () {
      await vereavementAccess.revokePermission(
        milestoneManager.target,
        ROLES.STORAGE_WRITE
      );
      
      await expect(
        milestoneManager.createMilestone(addr1.address, toWei("100"), "Test milestone")
      ).to.be.revertedWithCustomError(milestoneManager, "PermissionNotGranted");
    });

    it("Should not allow non-oracle to complete milestone", async function () {
      await milestoneManager.createMilestone(addr1.address, toWei("100"), "Test milestone");
      
      await expect(
        milestoneManager.connect(addr1).completeMilestone(addr1.address, 0)
      ).to.be.revertedWithCustomError(milestoneManager, "AccessControlUnauthorizedAccount");
    });
  });
}); 