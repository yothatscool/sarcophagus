const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GLO Integration and Token Conversion", function () {
  let sarcophagus, mockVTHO, mockB3TR, mockOBOL, mockGLO, mockDeathVerifier, mockPriceOracle;
  let owner, user1, user2, beneficiary1, beneficiary2;
  let sarcophagusAddress, vthoAddress, b3trAddress, obolAddress, gloAddress, deathVerifierAddress, priceOracleAddress;

  beforeEach(async function () {
    [owner, user1, user2, beneficiary1, beneficiary2] = await ethers.getSigners();

    // Deploy mock contracts
    const MockVTHO = await ethers.getContractFactory("MockToken");
    const MockB3TR = await ethers.getContractFactory("MockToken");
    const OBOL = await ethers.getContractFactory("OBOL");
    const MockGLO = await ethers.getContractFactory("MockToken");
    const MockDeathVerifier = await ethers.getContractFactory("MockDeathVerifier");
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");

    mockVTHO = await MockVTHO.deploy("VeThor Token", "VTHO");
    mockB3TR = await MockB3TR.deploy("B3TR Token", "B3TR");
    obol = await OBOL.deploy();
    mockGLO = await MockGLO.deploy("GLO Stablecoin", "GLO");
    mockDeathVerifier = await MockDeathVerifier.deploy();
    mockPriceOracle = await MockPriceOracle.deploy();

    // Get contract addresses
    vthoAddress = await mockVTHO.getAddress();
    b3trAddress = await mockB3TR.getAddress();
    obolAddress = await obol.getAddress();
    gloAddress = await mockGLO.getAddress();
    deathVerifierAddress = await mockDeathVerifier.getAddress();
    priceOracleAddress = await mockPriceOracle.getAddress();

    // Deploy Sarcophagus contract
    const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
    sarcophagus = await Sarcophagus.deploy(
      vthoAddress,
      b3trAddress,
      obolAddress,
      gloAddress,
      deathVerifierAddress,
      obolAddress, // OBOL rewards contract (using same address for simplicity)
      owner.address // Fee collector
    );

    sarcophagusAddress = await sarcophagus.getAddress();

    // Set price oracle
    await sarcophagus.setPriceOracle(priceOracleAddress);

    // Grant VAULT_ROLE to Sarcophagus in OBOL contract
    const VAULT_ROLE = await obol.VAULT_ROLE();
    await obol.grantRole(VAULT_ROLE, sarcophagusAddress);

    // Mint tokens to users
    await mockVTHO.mint(user1.address, ethers.parseEther("1000"));
    await mockB3TR.mint(user1.address, ethers.parseEther("100"));
    await mockGLO.mint(user1.address, ethers.parseEther("1000"));

    // Approve tokens
    await mockVTHO.connect(user1).approve(sarcophagusAddress, ethers.parseEther("1000"));
    await mockB3TR.connect(user1).approve(sarcophagusAddress, ethers.parseEther("100"));
    await mockGLO.connect(user1).approve(sarcophagusAddress, ethers.parseEther("1000"));

    // Debug: Print GLO addresses
    const contractGLO = await sarcophagus.gloAddress();
    const mockGLOAddr = await mockGLO.getAddress();
    console.log('GLO address in Sarcophagus:', contractGLO);
    console.log('MockGLO address:', mockGLOAddr);
  });

  describe("GLO Integration", function () {
    it("Should allow users to add GLO tokens to vault", async function () {
      // Create sarcophagus first
      const beneficiaries = [beneficiary1.address];
      const percentages = [10000]; // 100%
      
      await sarcophagus.connect(user1).createSarcophagus(
        beneficiaries,
        percentages,
        [ethers.ZeroAddress], // guardians
        [25], // ages
        [ethers.ZeroAddress], // contingent beneficiaries
        [0] // survivorship periods
      );

      const gloAmount = ethers.parseEther("100");
      
      // Debug: Print allowance and balance
      const allowance = await mockGLO.allowance(user1.address, sarcophagusAddress);
      const balance = await mockGLO.balanceOf(user1.address);
      console.log('user1 GLO allowance:', allowance.toString());
      console.log('user1 GLO balance:', balance.toString());

      try {
        await sarcophagus.connect(user1).addGLO(gloAmount);
      } catch (error) {
        console.log('Error details:', error.message);
        console.log('Error code:', error.code);
        console.log('Error data:', error.data);
        console.log('Full error:', error);
        throw error; // Re-throw to fail the test
      }
      
      const sarcophagusData = await sarcophagus.getSarcophagus(user1.address);
      expect(sarcophagusData.gloAmount).to.equal(gloAmount);
    });

    it("Should include GLO in inheritance distribution", async function () {
      // Create sarcophagus with beneficiaries
      const beneficiaries = [beneficiary1.address, beneficiary2.address];
      const percentages = [6000, 4000]; // 60%, 40%
      
      await sarcophagus.connect(user1).createSarcophagus(
        beneficiaries,
        percentages,
        [ethers.ZeroAddress, ethers.ZeroAddress], // guardians
        [25, 30], // ages
        [ethers.ZeroAddress, ethers.ZeroAddress], // contingent beneficiaries
        [0, 0] // survivorship periods
      );

      // Add GLO tokens
      const gloAmount = ethers.parseEther("100");
      try {
        await sarcophagus.connect(user1).addGLO(gloAmount);
      } catch (error) {
        console.log('Error in inheritance test:', error.message);
        console.log('Error code:', error.code);
        console.log('Error data:', error.data);
        throw error;
      }

      // Verify death
      await mockDeathVerifier.connect(owner).verifyDeath(user1.address, 75, "proof_hash");

      // Claim inheritance
      await sarcophagus.connect(beneficiary1).claimInheritance(user1.address, 0);

      // Check GLO was transferred to beneficiary
      const beneficiary1GLO = await mockGLO.balanceOf(beneficiary1.address);
      expect(beneficiary1GLO).to.equal(ethers.parseEther("60")); // 60% of 100 GLO
    });

    it("Should track GLO in total vault value", async function () {
      // Create sarcophagus first
      const beneficiaries = [beneficiary1.address];
      const percentages = [10000]; // 100%
      
      await sarcophagus.connect(user1).createSarcophagus(
        beneficiaries,
        percentages,
        [ethers.ZeroAddress], // guardians
        [25], // ages
        [ethers.ZeroAddress], // contingent beneficiaries
        [0] // survivorship periods
      );

      const gloAmount = ethers.parseEther("100");
      try {
        await sarcophagus.connect(user1).addGLO(gloAmount);
      } catch (error) {
        console.log('Error in vault value test:', error.message);
        console.log('Error code:', error.code);
        console.log('Error data:', error.data);
        throw error;
      }

      // Add other tokens for comparison
      await sarcophagus.connect(user1).depositTokens(
        ethers.parseEther("50"), // VTHO
        ethers.parseEther("10")  // B3TR
      );

      const sarcophagusData = await sarcophagus.getSarcophagus(user1.address);
      expect(sarcophagusData.gloAmount).to.equal(gloAmount);
    });
  });

  describe("Token Conversion", function () {
    beforeEach(async function () {
      // Create sarcophagus first
      const beneficiaries = [beneficiary1.address];
      const percentages = [10000]; // 100%
      
      await sarcophagus.connect(user1).createSarcophagus(
        beneficiaries,
        percentages,
        [ethers.ZeroAddress], // guardians
        [25], // ages
        [ethers.ZeroAddress], // contingent beneficiaries
        [0] // survivorship periods
      );

      // Add tokens to vault
      try {
        await sarcophagus.connect(user1).addGLO(ethers.parseEther("100"));
      } catch (error) {
        console.log('Error in beforeEach:', error.message);
        console.log('Error code:', error.code);
        console.log('Error data:', error.data);
        throw error;
      }
      await sarcophagus.connect(user1).depositTokens(
        ethers.parseEther("50"), // VTHO
        ethers.parseEther("10")  // B3TR
      );
    });

    it("Should convert VET to VTHO using price oracle", async function () {
      const fromToken = ethers.ZeroAddress; // VET
      const toToken = vthoAddress;
      const amount = ethers.parseEther("1");

      // Get conversion rate
      const conversionRate = await sarcophagus.getConversionRate(fromToken, toToken, amount);
      expect(conversionRate).to.be.greaterThan(0);

      // Perform conversion
      await sarcophagus.connect(user1).convertTokens(fromToken, toToken, amount);

      // Check balances
      const sarcophagusData = await sarcophagus.getSarcophagus(user1.address);
      expect(sarcophagusData.vetAmount).to.equal(ethers.parseEther("99")); // 100 - 1
      expect(sarcophagusData.vthoAmount).to.be.greaterThan(ethers.parseEther("50")); // Should have more VTHO
    });

    it("Should convert GLO to B3TR", async function () {
      const fromToken = gloAddress;
      const toToken = b3trAddress;
      const amount = ethers.parseEther("10");

      // Get conversion rate
      const conversionRate = await sarcophagus.getConversionRate(fromToken, toToken, amount);
      expect(conversionRate).to.be.greaterThan(0);

      // Perform conversion
      await sarcophagus.connect(user1).convertTokens(fromToken, toToken, amount);

      // Check balances
      const sarcophagusData = await sarcophagus.getSarcophagus(user1.address);
      expect(sarcophagusData.gloAmount).to.equal(ethers.parseEther("90")); // 100 - 10
      expect(sarcophagusData.b3trAmount).to.be.greaterThan(ethers.parseEther("10")); // Should have more B3TR
    });

    it("Should convert VTHO to OBOL", async function () {
      const fromToken = vthoAddress;
      const toToken = obolAddress;
      const amount = ethers.parseEther("10");

      // Get conversion rate
      const conversionRate = await sarcophagus.getConversionRate(fromToken, toToken, amount);
      expect(conversionRate).to.be.greaterThan(0);

      // Perform conversion
      await sarcophagus.connect(user1).convertTokens(fromToken, toToken, amount);

      // Check balances
      const sarcophagusData = await sarcophagus.getSarcophagus(user1.address);
      expect(sarcophagusData.vthoAmount).to.equal(ethers.parseEther("40")); // 50 - 10
      expect(sarcophagusData.obolAmount).to.be.greaterThan(0); // Should have OBOL
    });

    it("Should fail conversion with insufficient balance", async function () {
      const fromToken = gloAddress;
      const toToken = b3trAddress;
      const amount = ethers.parseEther("200"); // More than available

      try {
        await sarcophagus.connect(user1).convertTokens(fromToken, toToken, amount);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("InsufficientBalance");
      }
    });

    it("Should fail conversion with unsupported token pair", async function () {
      const unsupportedToken = ethers.Wallet.createRandom().address;
      const fromToken = unsupportedToken;
      const toToken = b3trAddress;
      const amount = ethers.parseEther("10");

      try {
        await sarcophagus.connect(user1).convertTokens(fromToken, toToken, amount);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("InvalidConversionRate");
      }
    });

    it("Should fail conversion without price oracle", async function () {
      // Remove price oracle
      await sarcophagus.setPriceOracle(ethers.ZeroAddress);

      const fromToken = gloAddress;
      const toToken = b3trAddress;
      const amount = ethers.parseEther("10");

      try {
        await sarcophagus.connect(user1).convertTokens(fromToken, toToken, amount);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("PriceOracleNotSet");
      }
    });
  });

  describe("Price Oracle Integration", function () {
    it("Should get token prices correctly", async function () {
      const vetPrice = await sarcophagus.getTokenPrice(ethers.ZeroAddress);
      const vthoPrice = await sarcophagus.getTokenPrice(vthoAddress);
      const b3trPrice = await sarcophagus.getTokenPrice(b3trAddress);
      const obolPrice = await sarcophagus.getTokenPrice(obolAddress);
      const gloPrice = await sarcophagus.getTokenPrice(gloAddress);

      expect(vetPrice).to.equal(ethers.parseEther("1"));
      expect(vthoPrice).to.equal(ethers.parseEther("0.001"));
      expect(b3trPrice).to.equal(ethers.parseEther("0.1"));
      expect(obolPrice).to.equal(ethers.parseEther("0.01"));
      expect(gloPrice).to.equal(ethers.parseEther("1"));
    });

    it("Should check conversion support correctly", async function () {
      const vetToVtho = await sarcophagus.isConversionSupported(ethers.ZeroAddress, vthoAddress);
      const vthoToB3tr = await sarcophagus.isConversionSupported(vthoAddress, b3trAddress);
      const unsupported = await sarcophagus.isConversionSupported(ethers.ZeroAddress, ethers.Wallet.createRandom().address);

      expect(vetToVtho).to.be.true;
      expect(vthoToB3tr).to.be.true;
      expect(unsupported).to.be.false;
    });

    it("Should get conversion rates correctly", async function () {
      const amount = ethers.parseEther("1");
      
      const vetToVtho = await sarcophagus.getConversionRate(ethers.ZeroAddress, vthoAddress, amount);
      const vthoToB3tr = await sarcophagus.getConversionRate(vthoAddress, b3trAddress, amount);
      const gloToObol = await sarcophagus.getConversionRate(gloAddress, obolAddress, amount);

      expect(vetToVtho).to.equal(ethers.parseEther("1000"));
      expect(vthoToB3tr).to.equal(ethers.parseEther("0.0001"));
      expect(gloToObol).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to set price oracle", async function () {
      const newOracle = ethers.Wallet.createRandom().address;
      
      await sarcophagus.setPriceOracle(newOracle);
      
      const currentOracle = await sarcophagus.priceOracle();
      expect(currentOracle).to.equal(newOracle);
    });

    it("Should fail when non-admin tries to set price oracle", async function () {
      const newOracle = ethers.Wallet.createRandom().address;
      
      try {
        await sarcophagus.connect(user1).setPriceOracle(newOracle);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("AccessControlUnauthorizedAccount");
      }
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount conversions", async function () {
      const fromToken = gloAddress;
      const toToken = b3trAddress;
      const amount = 0;

      try {
        await sarcophagus.connect(user1).convertTokens(fromToken, toToken, amount);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("InvalidAmount");
      }
    });

    it("Should handle same token conversion", async function () {
      const fromToken = gloAddress;
      const toToken = gloAddress;
      const amount = ethers.parseEther("10");

      try {
        await sarcophagus.connect(user1).convertTokens(fromToken, toToken, amount);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("InvalidAddress");
      }
    });

    it("Should handle minimum conversion amount", async function () {
      const fromToken = gloAddress;
      const toToken = b3trAddress;
      const amount = ethers.parseEther("0.5"); // Less than minimum

      try {
        await sarcophagus.connect(user1).convertTokens(fromToken, toToken, amount);
        expect.fail("Should have reverted");
      } catch (error) {
        expect(error.message).to.include("InvalidAmount");
      }
    });
  });
});
