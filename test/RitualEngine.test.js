const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    deployTestContracts,
    registerUser,
    setupRitualVault,
    increaseTime,
    SECONDS_PER_DAY
} = require("./helpers/testHelpers");

describe("RitualEngine", function () {
    let contracts;
    let owner;
    let user;
    let oracle;

    beforeEach(async function () {
        contracts = await deployTestContracts();
        owner = contracts.owner;
        user = contracts.addr1;
        oracle = contracts.addr2;

        // Setup oracle role
        await contracts.ritualEngine.grantRole(
            ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE")),
            oracle.address
        );

        // Register user and setup ritual vault
        await registerUser(contracts.vereavement, user, contracts.addr2);
        await setupRitualVault(contracts.vereavement, user);
    });

    describe("Carbon Offset", function () {
        it("Should record carbon offset correctly", async function () {
            const amount = 50; // 50 metric tons
            await contracts.ritualEngine.connect(oracle).recordCarbonOffset(
                amount,
                "Test Offset",
                ethers.encodeBytes32String("proof")
            );

            expect(await contracts.ritualEngine.getTotalCarbonOffset(user.address)).to.equal(amount);
        });

        it("Should calculate ritual value from carbon offset", async function () {
            const amount = 50; // 50 metric tons
            await contracts.ritualEngine.connect(oracle).recordCarbonOffset(
                amount,
                "Test Offset",
                ethers.encodeBytes32String("proof")
            );

            const ritualValue = await contracts.ritualEngine.getRitualValue(user.address);
            expect(ritualValue).to.be.gt(0n);
        });
    });

    describe("Longevity Score", function () {
        it("Should increase longevity score over time", async function () {
            const initialScore = await contracts.ritualEngine.getLongevityScore(user.address);
            
            // Increase time by 30 days
            await increaseTime(30 * SECONDS_PER_DAY);
            
            // Update metrics
            await contracts.vereavement.connect(user).completeRitual("Daily Check-in");
            
            const newScore = await contracts.ritualEngine.getLongevityScore(user.address);
            expect(newScore).to.be.gt(initialScore);
        });
    });

    describe("Ritual Power", function () {
        it("Should calculate ritual power based on multiple factors", async function () {
            // Record carbon offset
            await contracts.ritualEngine.connect(oracle).recordCarbonOffset(
                50,
                "Test Offset",
                ethers.encodeBytes32String("proof")
            );

            // Increase time for longevity
            await increaseTime(30 * SECONDS_PER_DAY);
            await contracts.vereavement.connect(user).completeRitual("Daily Check-in");

            // Get ritual metrics
            const metrics = await contracts.ritualEngine.getRitualMetrics(user.address);
            expect(metrics.ritualPower).to.be.gt(0n);
        });
    });

    describe("Weekly Allocation", function () {
        it("Should distribute weekly B3TR allocation based on ritual power", async function () {
            // Build up ritual power
            await contracts.ritualEngine.connect(oracle).recordCarbonOffset(
                100,
                "Major Offset",
                ethers.encodeBytes32String("proof")
            );

            await increaseTime(7 * SECONDS_PER_DAY);

            // Attempt to claim allocation
            await contracts.vereavement.connect(user).claimWeeklyAllocation();

            // Verify B3TR balance increased
            const balance = await contracts.vereavement.getTokenBalance(
                user.address,
                await contracts.vereavement.B3TR()
            );
            expect(balance).to.be.gt(0n);
        });
    });
}); 