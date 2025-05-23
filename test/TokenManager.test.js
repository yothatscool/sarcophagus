const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenManager", function () {
  let tokenManager;
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
    
    // Deploy TokenManager
    const TokenManager = await ethers.getContractFactory("TokenManager");
    tokenManager = await TokenManager.deploy(vereavementAccess.address);
    await tokenManager.deployed();
    
    // Authorize TokenManager contract
    await vereavementAccess.authorizeContract(
      tokenManager.address,
      "TokenManager"
    );
    
    // Grant necessary permissions
    await vereavementAccess.grantPermission(
      tokenManager.address,
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STORAGE_WRITE"))
    );
  });

  describe("Token Management", function () {
    it("Should mint tokens correctly", async function () {
      await tokenManager.mint(addr1.address, ethers.utils.parseEther("100"));
      expect(await tokenManager.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should burn tokens correctly", async function () {
      await tokenManager.mint(addr1.address, ethers.utils.parseEther("100"));
      await tokenManager.burn(addr1.address, ethers.utils.parseEther("50"));
      expect(await tokenManager.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("50"));
    });

    it("Should transfer tokens correctly", async function () {
      await tokenManager.mint(addr1.address, ethers.utils.parseEther("100"));
      await tokenManager.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("50"));
      expect(await tokenManager.balanceOf(addr2.address)).to.equal(ethers.utils.parseEther("50"));
    });
  });

  describe("Access Control", function () {
    it("Should respect minting permissions", async function () {
      await vereavementAccess.revokePermission(
        tokenManager.address,
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("STORAGE_WRITE"))
      );
      
      await expect(
        tokenManager.mint(addr1.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Permission not granted");
    });
  });
}); 