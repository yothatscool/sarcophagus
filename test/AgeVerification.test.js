const { expect } = require("chai");
const { ethers } = require("hardhat");

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
    await vereavementAccess.deployed();
    
    // Deploy AgeVerification
    const AgeVerification = await ethers.getContractFactory("AgeVerification");
    ageVerification = await AgeVerification.deploy(vereavementAccess.address);
    await ageVerification.deployed();
    
    // Authorize AgeVerification contract
    await vereavementAccess.authorizeContract(
      ageVerification.address,
      "AgeVerification"
    );
    
    // Grant necessary permissions
    await vereavementAccess.grantPermission(
      ageVerification.address,
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STORAGE_WRITE"))
    );
  });

  describe("Initialization", function () {
    it("Should set the correct access control contract", async function () {
      expect(await ageVerification.accessControl()).to.equal(vereavementAccess.address);
    });
  });

  describe("Age Verification", function () {
    it("Should verify age correctly", async function () {
      const birthDate = Math.floor(Date.now() / 1000) - (20 * 365 * 24 * 60 * 60); // 20 years ago
      await ageVerification.verifyAge(addr1.address, birthDate);
      expect(await ageVerification.isAgeVerified(addr1.address)).to.be.true;
    });

    it("Should reject underage verification", async function () {
      const birthDate = Math.floor(Date.now() / 1000) - (15 * 365 * 24 * 60 * 60); // 15 years ago
      await expect(
        ageVerification.verifyAge(addr1.address, birthDate)
      ).to.be.revertedWith("User must be at least 18 years old");
    });
  });

  describe("Access Control", function () {
    it("Should respect permissions", async function () {
      await vereavementAccess.revokePermission(
        ageVerification.address,
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STORAGE_WRITE"))
      );
      
      const birthDate = Math.floor(Date.now() / 1000) - (20 * 365 * 24 * 60 * 60);
      await expect(
        ageVerification.verifyAge(addr1.address, birthDate)
      ).to.be.revertedWith("Permission not granted");
    });
  });
}); 