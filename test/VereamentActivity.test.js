const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    deployTestContracts,
    SECONDS_PER_DAY,
    SECONDS_PER_MONTH
} = require("./helpers/testHelpers");

describe("Vereavement Activity System", function () {
    let contracts;
    let owner;
    let user1;
    let user2;
    let oracle1;
    let oracle2;
    let oracle3;
    let emergencyContact;

    beforeEach(async function () {
        contracts = await deployTestContracts();
        owner = contracts.owner;
        [user1, user2, oracle1, oracle2, oracle3, emergencyContact] = contracts.addrs;

        // Setup oracle roles
        for (const oracle of [oracle1, oracle2, oracle3]) {
            await contracts.vereavement.grantRole(
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ROLE")),
                oracle.address
            );
        }

        // Register user
        await contracts.vereavement.connect(user1).registerUser(
            [user2.address],
            [10000],
            [0],
            [false],
            [""]
        );

        // Set emergency contact
        await contracts.vereavement.connect(user1).setEmergencyContact(emergencyContact.address);
    });

    describe("Activity Monitoring", function () {
        it("Should track user activity", async function () {
            await contracts.vereavement.connect(user1).addActivityProof(
                "DAILY_CHECK",
                "Regular activity check"
            );

            const history = await contracts.vereavement.getActivityHistory(user1.address);
            expect(history[0].proofType).to.equal("DAILY_CHECK");
            expect(history[0].details).to.equal("Regular activity check");
        });

        it("Should update last activity time", async function () {
            const initialTime = await contracts.vereavement.getLastActivityTime(user1.address);
            await time.increase(SECONDS_PER_DAY);
            
            await contracts.vereavement.connect(user1).addActivityProof(
                "DAILY_CHECK",
                "Activity update"
            );

            const newTime = await contracts.vereavement.getLastActivityTime(user1.address);
            expect(newTime).to.be.gt(initialTime);
        });

        it("Should allow emergency contact to add activity proof", async function () {
            await contracts.vereavement.connect(emergencyContact).addActivityProof(
                user1.address,
                "EMERGENCY_CHECK",
                "Emergency welfare check"
            );

            const history = await contracts.vereavement.getActivityHistory(user1.address);
            expect(history[0].proofType).to.equal("EMERGENCY_CHECK");
        });

        it("Should detect inactivity", async function () {
            await time.increase(180 * SECONDS_PER_DAY);
            expect(await contracts.vereavement.checkInactivity(user1.address)).to.be.true;
        });

        it("Should reset inactivity on proof", async function () {
            await time.increase(179 * SECONDS_PER_DAY);
            await contracts.vereavement.connect(user1).addActivityProof(
                "DAILY_CHECK",
                "Activity reset"
            );
            expect(await contracts.vereavement.checkInactivity(user1.address)).to.be.false;
        });
    });

    describe("Multi-signature Death Confirmation", function () {
        it("Should require multiple confirmations", async function () {
            await contracts.vereavement.connect(oracle1).confirmDeath(user1.address);
            
            const vaultDetails = await contracts.vereavement.getVaultDetails(user1.address);
            expect(vaultDetails.isDeceased).to.be.false;
            expect(vaultDetails.deathConfirmations).to.equal(1);
        });

        it("Should declare death after sufficient confirmations", async function () {
            await contracts.vereavement.connect(oracle1).confirmDeath(user1.address);
            await contracts.vereavement.connect(oracle2).confirmDeath(user1.address);
            await contracts.vereavement.connect(oracle3).confirmDeath(user1.address);

            const vaultDetails = await contracts.vereavement.getVaultDetails(user1.address);
            expect(vaultDetails.isDeceased).to.be.true;
            expect(vaultDetails.deathConfirmations).to.equal(3);
        });

        it("Should prevent duplicate confirmations", async function () {
            await contracts.vereavement.connect(oracle1).confirmDeath(user1.address);
            await expect(
                contracts.vereavement.connect(oracle1).confirmDeath(user1.address)
            ).to.be.revertedWith("Already confirmed");
        });

        it("Should enforce challenge period", async function () {
            // Get confirmations
            await contracts.vereavement.connect(oracle1).confirmDeath(user1.address);
            await contracts.vereavement.connect(oracle2).confirmDeath(user1.address);
            await contracts.vereavement.connect(oracle3).confirmDeath(user1.address);

            // Try to claim before challenge period ends
            await expect(
                contracts.vereavement.connect(user2).payoutVault(user1.address, ethers.constants.AddressZero)
            ).to.be.revertedWith("In challenge period");

            // Wait for challenge period
            await time.increase(30 * SECONDS_PER_DAY);

            // Should now allow claim
            await contracts.vereavement.connect(user2).payoutVault(user1.address, ethers.constants.AddressZero);
        });

        it("Should allow death challenge during period", async function () {
            // Get confirmations
            await contracts.vereavement.connect(oracle1).confirmDeath(user1.address);
            await contracts.vereavement.connect(oracle2).confirmDeath(user1.address);
            await contracts.vereavement.connect(oracle3).confirmDeath(user1.address);

            // Challenge death
            await contracts.vereavement.connect(user1).challengeDeath();

            const vaultDetails = await contracts.vereavement.getVaultDetails(user1.address);
            expect(vaultDetails.isDeceased).to.be.false;
            expect(vaultDetails.deathConfirmations).to.equal(0);
        });

        it("Should prevent challenge after period ends", async function () {
            // Get confirmations
            await contracts.vereavement.connect(oracle1).confirmDeath(user1.address);
            await contracts.vereavement.connect(oracle2).confirmDeath(user1.address);
            await contracts.vereavement.connect(oracle3).confirmDeath(user1.address);

            // Wait for challenge period to end
            await time.increase(31 * SECONDS_PER_DAY);

            // Try to challenge
            await expect(
                contracts.vereavement.connect(user1).challengeDeath()
            ).to.be.revertedWith("Challenge period ended");
        });
    });

    describe("Activity-Death Integration", function () {
        it("Should prevent death confirmation during active period", async function () {
            // Regular activity
            await contracts.vereavement.connect(user1).addActivityProof(
                "DAILY_CHECK",
                "Active user"
            );

            // Try to confirm death
            await expect(
                contracts.vereavement.connect(oracle1).confirmDeath(user1.address)
            ).to.be.revertedWith("User still active");
        });

        it("Should allow death confirmation after inactivity", async function () {
            // Wait for inactivity period
            await time.increase(180 * SECONDS_PER_DAY);

            // Should allow death confirmation
            await contracts.vereavement.connect(oracle1).confirmDeath(user1.address);
            expect(await contracts.vereavement.getDeathConfirmations(user1.address)).to.equal(1);
        });

        it("Should handle emergency contact intervention", async function () {
            // Wait for near-inactivity
            await time.increase(170 * SECONDS_PER_DAY);

            // Emergency contact adds proof
            await contracts.vereavement.connect(emergencyContact).addActivityProof(
                user1.address,
                "EMERGENCY_CHECK",
                "User contacted and confirmed alive"
            );

            // Try to confirm death
            await expect(
                contracts.vereavement.connect(oracle1).confirmDeath(user1.address)
            ).to.be.revertedWith("User still active");
        });
    });
}); 