require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Whitelist and Value Cap Tests", function () {
    let sarcophagus, obol, deathVerifier;
    let owner, user1, beneficiary1;
    let user1Address, beneficiary1Address;
    let mockB3TR, mockVTHO, mockObol, mockGLO;

    beforeEach(async function () {
        [owner, user1, beneficiary1] = await ethers.getSigners();
        user1Address = user1.address;
        beneficiary1Address = beneficiary1.address;

        // Deploy mock contracts
        const MockB3TR = await ethers.getContractFactory("MockB3TR");
        try {
            mockB3TR = await MockB3TR.deploy();
            await mockB3TR.waitForDeployment();
            console.log('MockB3TR deployed successfully:', mockB3TR.target);
        } catch (error) {
            console.error('MockB3TR deployment failed:', error.message);
            throw error;
        }

        const MockVTHO = await ethers.getContractFactory("MockToken");
        try {
            mockVTHO = await MockVTHO.deploy("VTHO", "VTHO");
            await mockVTHO.waitForDeployment();
            console.log('MockVTHO deployed successfully:', mockVTHO.target);
        } catch (error) {
            console.error('MockVTHO deployment failed:', error.message);
            throw error;
        }

        const MockObol = await ethers.getContractFactory("MockToken");
        try {
            mockObol = await MockObol.deploy("OBOL", "OBOL");
            await mockObol.waitForDeployment();
            console.log('MockObol deployed successfully:', mockObol.target);
        } catch (error) {
            console.error('MockObol deployment failed:', error.message);
            throw error;
        }

        const MockGLO = await ethers.getContractFactory("MockGLO");
        try {
            mockGLO = await MockGLO.deploy();
            await mockGLO.waitForDeployment();
            console.log('MockGLO deployed successfully:', mockGLO.target);
        } catch (error) {
            console.error('MockGLO deployment failed:', error.message);
            throw error;
        }

        const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
        try {
            deathVerifier = await DeathVerifier.deploy();
            await deathVerifier.waitForDeployment();
            console.log('DeathVerifier deployed successfully:', deathVerifier.target);
        } catch (error) {
            console.error('DeathVerifier deployment failed:', error.message);
            throw error;
        }

        const OBOL = await ethers.getContractFactory("OBOL");
        try {
            obol = await OBOL.deploy();
            await obol.waitForDeployment();
            console.log('OBOL deployed successfully:', obol.target);
        } catch (error) {
            console.error('OBOL deployment failed:', error.message);
            throw error;
        }

        if (!owner.address) throw new Error('owner address is invalid');

        console.log('Deploying Sarcophagus with:');
        console.log('mockVTHO.target:', mockVTHO.target);
        console.log('mockB3TR.target:', mockB3TR.target);
        console.log('mockObol.target:', mockObol.target);
        console.log('mockGLO.target:', mockGLO.target);
        console.log('deathVerifier.target:', deathVerifier.target);
        console.log('obol.target:', obol.target);
        console.log('owner.address:', owner.address);

        const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
        sarcophagus = await Sarcophagus.deploy(
            mockVTHO.target,
            mockB3TR.target,
            mockObol.target,
            mockGLO.target,
            deathVerifier.target,
            obol.target,
            owner.address // feeCollector
        );

        if (!mockVTHO.target) throw new Error('mockVTHO address is invalid');
        if (!mockB3TR.target) throw new Error('mockB3TR address is invalid');
        if (!mockObol.target) throw new Error('mockObol address is invalid');
        if (!mockGLO.target) throw new Error('mockGLO address is invalid');
        if (!deathVerifier.target) throw new Error('deathVerifier address is invalid');
        if (!obol.target) throw new Error('obol address is invalid');
        if (!owner.address) throw new Error('owner address is invalid');

        // Setup OBOL contract
        await obol.grantRole(await obol.VAULT_ROLE(), sarcophagus.target);

        // Verify user before creating sarcophagus
        await deathVerifier.verifyUser(user1Address, 25, "ipfs://verification-data");

        // Create sarcophagus
        await sarcophagus.connect(user1).createSarcophagus(
            [beneficiary1Address],
            [10000], // 100%
            [ethers.ZeroAddress], // No guardian
            [25], // Age
            [ethers.ZeroAddress], // No contingent beneficiary
            [0] // No survivorship period
        );
    });

    describe("NFT Whitelist Management", function () {
        it("Should allow admin to whitelist NFT collections", async function () {
            const maxValue = ethers.parseEther("10"); // 10 VET max per NFT
            const testNFTAddress = ethers.Wallet.createRandom().address; // Mock NFT address
            
            await sarcophagus.connect(owner).whitelistNFTCollection(testNFTAddress, maxValue);
            
            const [isWhitelisted, maxValueReturned] = await sarcophagus.getNFTCollectionInfo(testNFTAddress);
            expect(isWhitelisted).to.be.true;
            expect(maxValueReturned).to.equal(maxValue);
        });

        it("Should allow admin to remove NFT collections from whitelist", async function () {
            const maxValue = ethers.parseEther("10");
            const testNFTAddress = ethers.Wallet.createRandom().address;
            
            // First whitelist
            await sarcophagus.connect(owner).whitelistNFTCollection(testNFTAddress, maxValue);
            
            // Then remove
            await sarcophagus.connect(owner).removeNFTCollection(testNFTAddress);
            
            const [isWhitelisted, maxValueReturned] = await sarcophagus.getNFTCollectionInfo(testNFTAddress);
            expect(isWhitelisted).to.be.false;
            expect(maxValueReturned).to.equal(0n);
        });

        it("Should allow admin to update global max NFT value", async function () {
            const newGlobalMax = ethers.parseEther("5");
            
            await sarcophagus.connect(owner).updateGlobalMaxNFTValue(newGlobalMax);
            
            expect(await sarcophagus.globalMaxNFTValue()).to.equal(newGlobalMax);
        });

        it("Should allow admin to update collection-specific max value", async function () {
            const initialMax = ethers.parseEther("10");
            const newMax = ethers.parseEther("20");
            const testNFTAddress = ethers.Wallet.createRandom().address;
            
            // Whitelist with initial max
            await sarcophagus.connect(owner).whitelistNFTCollection(testNFTAddress, initialMax);
            
            // Update max value
            await sarcophagus.connect(owner).updateNFTCollectionMaxValue(testNFTAddress, newMax);
            
            const [isWhitelisted, maxValueReturned] = await sarcophagus.getNFTCollectionInfo(testNFTAddress);
            expect(isWhitelisted).to.be.true;
            expect(maxValueReturned).to.equal(newMax);
        });
    });

    describe("Access Control", function () {
        it("Should prevent non-admin from whitelisting collections", async function () {
            const maxValue = ethers.parseEther("10");
            const testNFTAddress = ethers.Wallet.createRandom().address;
            
            await expect(
                sarcophagus.connect(user1).whitelistNFTCollection(testNFTAddress, maxValue)
            ).to.be.revertedWithCustomError(sarcophagus, "AccessControlUnauthorizedAccount");
        });

        it("Should prevent non-admin from removing collections", async function () {
            const testNFTAddress = ethers.Wallet.createRandom().address;
            
            await expect(
                sarcophagus.connect(user1).removeNFTCollection(testNFTAddress)
            ).to.be.revertedWithCustomError(sarcophagus, "AccessControlUnauthorizedAccount");
        });

        it("Should prevent non-admin from updating global max value", async function () {
            const newMax = ethers.parseEther("5");
            
            await expect(
                sarcophagus.connect(user1).updateGlobalMaxNFTValue(newMax)
            ).to.be.revertedWithCustomError(sarcophagus, "AccessControlUnauthorizedAccount");
        });
    });
}); 