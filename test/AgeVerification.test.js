const { expect } = require("chai");
const { ethers } = require("hardhat");
const { ROLES, ZERO_ADDRESS, toWei } = require("./helpers/TestUtils");

describe("AgeVerification", function () {
  let ageVerification;
  let vereavementAccess;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy VereavementAccess
    const VereavementAccess = await ethers.getContractFactory("VereavementAccess");
    vereavementAccess = await VereavementAccess.deploy();
    
    // Deploy AgeVerification
    const AgeVerification = await ethers.getContractFactory("AgeVerification");
    ageVerification = await AgeVerification.deploy(vereavementAccess.target);
    
    // Grant necessary permissions
    await vereavementAccess.grantPermission(
      ageVerification.target,
      ROLES.STORAGE_WRITE
    );
  });

  describe("Age Verification", function () {
    it("Should verify age correctly", async function () {
      const age = 25;
      await ageVerification.verifyAge(addr1.address, age);
      expect(await ageVerification.getAge(addr1.address)).to.equal(age);
    });

    it("Should not allow invalid age", async function () {
      const age = 0;
      await expect(
        ageVerification.verifyAge(addr1.address, age)
      ).to.be.revertedWithCustomError(ageVerification, "InvalidAge");
    });

    it("Should not allow non-oracle to verify age", async function () {
      await expect(
        ageVerification.connect(addr1).verifyAge(addr2.address, 25)
      ).to.be.revertedWithCustomError(ageVerification, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Batch Operations", function () {
    it("Should verify multiple ages in batch", async function () {
      const addresses = [addr1.address, addr2.address];
      const ages = [25, 30];
      await ageVerification.verifyAgeBatch(addresses, ages);
      
      expect(await ageVerification.getAge(addr1.address)).to.equal(ages[0]);
      expect(await ageVerification.getAge(addr2.address)).to.equal(ages[1]);
    });

    it("Should not allow mismatched arrays", async function () {
      const addresses = [addr1.address];
      const ages = [25, 30];
      await expect(
        ageVerification.verifyAgeBatch(addresses, ages)
      ).to.be.revertedWithCustomError(ageVerification, "ArrayLengthMismatch");
    });
  });

  describe("Access Control", function () {
    it("Should respect storage permissions", async function () {
      await vereavementAccess.revokePermission(
        ageVerification.target,
        ROLES.STORAGE_WRITE
      );
      
      await expect(
        ageVerification.verifyAge(addr1.address, 25)
      ).to.be.revertedWithCustomError(ageVerification, "PermissionNotGranted");
    });
  });
}); 