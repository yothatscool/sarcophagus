const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    setupRitualEngine,
    SECONDS_PER_DAY
} = require("./helpers/RitualTestHelpers");

describe("Vereavement Security Features", function () {
    let vereavement;
    let ritualEngine;
    let owner;
    let user1;
    let user2;
    let attacker;

    beforeEach(async function () {
        const setup = await setupRitualEngine();
        ritualEngine = setup.ritualEngine;
        owner = setup.owner;
        [user1, user2, attacker] = await ethers.getSigners();
    });

    describe("Reentrancy Guard Tests", function () {
        it("Should prevent reentrancy in payout functions", async function () {
            const MockReentrantContract = await ethers.getContractFactory("MockReentrantContract");
            const mockContract = await MockReentrantContract.deploy(ritualEngine.address);
            
            await expect(
                mockContract.connect(attacker).attemptReentrantCall()
            ).to.be.revertedWith("ReentrancyGuard: reentrant call");
        });

        it("Should maintain proper reentrancy guard state after failed transactions", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            await expect(
                ritualEngine.connect(user1).completeRitual("TEST")
            ).to.not.be.revertedWith("ReentrancyGuard: reentrant call");
        });
    });

    describe("Rate Limiting Tests", function () {
        it("Should enforce cooldown period between ritual updates", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            await ritualEngine.connect(user1).completeRitual("TEST");
            
            await expect(
                ritualEngine.connect(user1).completeRitual("TEST")
            ).to.be.revertedWith("Rate limit: Too many updates");

            // Wait for cooldown
            await time.increase(3600); // 1 hour
            await expect(
                ritualEngine.connect(user1).completeRitual("TEST")
            ).to.not.be.reverted;
        });

        it("Should track rate limits separately for different users", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            await ritualEngine.connect(user2).createRitualVault();

            await ritualEngine.connect(user1).completeRitual("TEST");
            await expect(
                ritualEngine.connect(user2).completeRitual("TEST")
            ).to.not.be.reverted;
        });
    });

    describe("Emergency Pause Tests", function () {
        it("Should allow admin to pause and unpause", async function () {
            await ritualEngine.connect(owner).emergencyPause();
            expect(await ritualEngine.paused()).to.be.true;

            await expect(
                ritualEngine.connect(user1).createRitualVault()
            ).to.be.revertedWith("Pausable: paused");

            await ritualEngine.connect(owner).emergencyUnpause();
            expect(await ritualEngine.paused()).to.be.false;
        });

        it("Should prevent non-admin from pausing", async function () {
            await expect(
                ritualEngine.connect(attacker).emergencyPause()
            ).to.be.revertedWith("Not admin");
        });
    });

    describe("Timelock Tests", function () {
        it("Should enforce delay for critical parameter changes", async function () {
            const newThreshold = ethers.utils.parseEther("100");
            
            // Propose change
            await ritualEngine.connect(owner).proposeParameterChange(
                "inactivityThreshold",
                newThreshold
            );

            // Try to execute immediately
            await expect(
                ritualEngine.connect(owner).executeParameterChange("inactivityThreshold")
            ).to.be.revertedWith("Timelock: delay not satisfied");

            // Wait for delay
            await time.increase(2 * SECONDS_PER_DAY);

            // Should succeed now
            await ritualEngine.connect(owner).executeParameterChange("inactivityThreshold");
            const config = await ritualEngine.getTreasuryConfig();
            expect(config.defaultInactivityThreshold).to.equal(newThreshold);
        });

        it("Should cancel pending parameter changes", async function () {
            await ritualEngine.connect(owner).proposeParameterChange(
                "inactivityThreshold",
                ethers.utils.parseEther("100")
            );

            await ritualEngine.connect(owner).cancelParameterChange("inactivityThreshold");

            await time.increase(2 * SECONDS_PER_DAY);
            await expect(
                ritualEngine.connect(owner).executeParameterChange("inactivityThreshold")
            ).to.be.revertedWith("Timelock: no pending change");
        });
    });

    describe("Access Control Tests", function () {
        it("Should properly manage admin roles", async function () {
            const adminRole = await ritualEngine.DEFAULT_ADMIN_ROLE();
            expect(await ritualEngine.hasRole(adminRole, owner.address)).to.be.true;
            expect(await ritualEngine.hasRole(adminRole, attacker.address)).to.be.false;
        });

        it("Should prevent unauthorized access to admin functions", async function () {
            await expect(
                ritualEngine.connect(attacker).grantRole(
                    await ritualEngine.DEFAULT_ADMIN_ROLE(),
                    attacker.address
                )
            ).to.be.reverted;
        });
    });
}); 