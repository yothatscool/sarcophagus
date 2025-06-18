const { expect } = require("chai");
const { ethers } = require("hardhat");
const { ROLES, ZERO_ADDRESS, toWei } = require("./helpers/TestUtils");

describe("TokenManager", function () {
  let tokenManager;
  let vereavementAccess;
  let vthoManager;
  let b3trToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy mock B3TR token
    const MockB3TR = await ethers.getContractFactory("MockB3TR");
    b3trToken = await MockB3TR.deploy();

    // Deploy VTHO Manager
    const VTHOManager = await ethers.getContractFactory("VTHOManager");
    vthoManager = await VTHOManager.deploy();
    
    // Deploy VereavementAccess
    const VereavementAccess = await ethers.getContractFactory("VereavementAccess");
    vereavementAccess = await VereavementAccess.deploy();
    
    // Deploy TokenManager
    const TokenManager = await ethers.getContractFactory("TokenManager");
    tokenManager = await TokenManager.deploy(vthoManager.target, b3trToken.target);
    
    // Authorize TokenManager contract
    await vereavementAccess.authorizeContract(
      tokenManager.target,
      "TokenManager"
    );
    
    // Grant necessary permissions
    await vereavementAccess.grantPermission(
      tokenManager.target,
      ROLES.STORAGE_WRITE
    );

    // Fund the token manager with B3TR tokens
    await b3trToken.mint(tokenManager.target, toWei("1000000"));
  });

  describe("Token Management", function () {
    it("Should add token correctly", async function () {
      await tokenManager.addToken(b3trToken.target);
      expect(await tokenManager.getTokenStatus(owner.address, b3trToken.target))
        .to.deep.equal([true, false, false]);
    });

    it("Should enable VTHO correctly", async function () {
      await tokenManager.addToken(ZERO_ADDRESS); // VTHO address
      await tokenManager.setTokenStatus(ZERO_ADDRESS, true);
      const [isEnabled, isVthoEnabled, isB3trEnabled] = await tokenManager.getTokenStatus(owner.address, ZERO_ADDRESS);
      expect(isEnabled).to.be.true;
      expect(isVthoEnabled).to.be.true;
    });

    it("Should deposit tokens correctly", async function () {
      await tokenManager.addToken(b3trToken.target);
      await tokenManager.setTokenStatus(b3trToken.target, true);
      const amount = toWei("100");
      await b3trToken.approve(tokenManager.target, amount);
      await tokenManager.depositToken(b3trToken.target, amount);
      expect(await tokenManager.getTokenBalance(owner.address, b3trToken.target)).to.equal(amount);
    });

    it("Should batch deposit tokens correctly", async function () {
      const tokens = [b3trToken.target, ZERO_ADDRESS];
      const amounts = [toWei("100"), toWei("50")];
      
      await tokenManager.batchAddTokens(tokens);
      await tokenManager.batchSetTokenStatus(tokens, [true, true]);
      
      await b3trToken.approve(tokenManager.target, amounts[0]);
      await tokenManager.batchDepositTokens(tokens, amounts);
      
      const balances = await tokenManager.batchGetTokenBalances(owner.address, tokens);
      expect(balances[0]).to.equal(amounts[0]);
      expect(balances[1]).to.equal(amounts[1]);
    });
  });

  describe("Access Control", function () {
    it("Should respect storage permissions", async function () {
      await vereavementAccess.revokePermission(
        tokenManager.target,
        ROLES.STORAGE_WRITE
      );
      
      await expect(
        tokenManager.addToken(b3trToken.target)
      ).to.be.revertedWithCustomError(tokenManager, "PermissionNotGranted");
    });

    it("Should not allow non-admin to update B3TR token", async function () {
      await expect(
        tokenManager.connect(addr1).updateB3TRToken(ZERO_ADDRESS)
      ).to.be.revertedWithCustomError(tokenManager, "AccessControlUnauthorizedAccount");
    });
  });
}); 