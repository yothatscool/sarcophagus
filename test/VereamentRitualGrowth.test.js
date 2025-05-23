const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    deployTestContracts,
    SECONDS_PER_DAY
} = require("./helpers/testHelpers");

describe("Vereavement Ritual Growth", function () {
    let contracts;
    let owner;
    let user1;
    let user2;
    let oracle;

    beforeEach(async function () {
        contracts = await deployTestContracts();
        owner = contracts.owner;
        [user1, user2, oracle] = contracts.addrs;

        await contracts.vereavement.grantRole(
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ROLE")),
            oracle.address
        );

        // Setup basic ritual vault
        await contracts.vereavement.connect(user1).registerUser(
            [user2.address],
            [10000],
            [0],
            [false],
            [""]
        );
        await contracts.vereavement.connect(user1).createRitualVault();
    });

    describe("Growth Rate Calculations", function () {
        it("Should calculate compound growth correctly", async function () {
            // Add initial value
            const initialValue = ethers.utils.parseEther("1");
            await contracts.ritualEngine.connect(oracle).setRitualValue(user1.address, initialValue);

            // Process growth over multiple periods
            for (let i = 0; i < 5; i++) {
                await time.increase(SECONDS_PER_DAY);
                await contracts.vereavement.connect(user1).processSymbolicGrowth();
            }

            const finalValue = await contracts.vereavement.getRitualValue(user1.address);
            expect(finalValue).to.be.gt(initialValue);
            
            // Verify compound nature (should be greater than linear growth)
            const linearGrowth = initialValue.mul(5).div(100); // 5% per day
            const actualGrowth = finalValue.sub(initialValue);
            expect(actualGrowth).to.be.gt(linearGrowth);
        });

        it("Should apply longevity multiplier correctly", async function () {
            // Build up longevity score
            for (let i = 0; i < 3; i++) {
                await time.increase(SECONDS_PER_DAY);
                await contracts.vereavement.connect(user1).completeRitual("Daily Ritual");
            }

            // Add value and process growth
            const initialValue = ethers.utils.parseEther("1");
            await contracts.ritualEngine.connect(oracle).setRitualValue(user1.address, initialValue);
            
            await time.increase(SECONDS_PER_DAY);
            await contracts.vereavement.connect(user1).processSymbolicGrowth();

            const finalValue = await contracts.vereavement.getRitualValue(user1.address);
            const baseGrowth = initialValue.mul(5).div(100); // 5% base rate
            const actualGrowth = finalValue.sub(initialValue);
            expect(actualGrowth).to.be.gt(baseGrowth);
        });
    });

    describe("Growth Limits and Thresholds", function () {
        it("Should respect maximum daily growth rate", async function () {
            // Set very high initial value
            const largeValue = ethers.utils.parseEther("1000000");
            await contracts.ritualEngine.connect(oracle).setRitualValue(user1.address, largeValue);

            await time.increase(SECONDS_PER_DAY);
            await contracts.vereavement.connect(user1).processSymbolicGrowth();

            const finalValue = await contracts.vereavement.getRitualValue(user1.address);
            const growth = finalValue.sub(largeValue);
            const maxAllowedGrowth = largeValue.mul(10).div(100); // 10% max daily
            expect(growth).to.be.lte(maxAllowedGrowth);
        });

        it("Should apply minimum growth threshold", async function () {
            // Set very small initial value
            const smallValue = ethers.utils.parseEther("0.0001");
            await contracts.ritualEngine.connect(oracle).setRitualValue(user1.address, smallValue);

            await time.increase(SECONDS_PER_DAY);
            await contracts.vereavement.connect(user1).processSymbolicGrowth();

            const finalValue = await contracts.vereavement.getRitualValue(user1.address);
            expect(finalValue).to.be.gt(smallValue);
        });
    });

    describe("Growth Modifiers", function () {
        it("Should boost growth with carbon offsets", async function () {
            // Add initial value
            const initialValue = ethers.utils.parseEther("1");
            await contracts.ritualEngine.connect(oracle).setRitualValue(user1.address, initialValue);

            // Record carbon offset
            const oracleKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TEST_KEY"));
            const proof = ethers.utils.defaultAbiCoder.encode(
                ["uint256", "bytes"],
                [await time.latest(), "0x"]
            );
            const signature = await oracle.signMessage(ethers.utils.arrayify(oracleKey));

            await contracts.vereavement.connect(user1).recordCarbonOffset(
                ethers.utils.parseEther("10"),
                "Test Source",
                oracleKey,
                proof,
                signature
            );

            // Process growth
            await time.increase(SECONDS_PER_DAY);
            await contracts.vereavement.connect(user1).processSymbolicGrowth();

            const finalValue = await contracts.vereavement.getRitualValue(user1.address);
            const baseGrowth = initialValue.mul(5).div(100);
            const actualGrowth = finalValue.sub(initialValue);
            expect(actualGrowth).to.be.gt(baseGrowth);
        });

        it("Should apply ritual completion bonuses", async function () {
            // Add initial value
            const initialValue = ethers.utils.parseEther("1");
            await contracts.ritualEngine.connect(oracle).setRitualValue(user1.address, initialValue);

            // Complete multiple rituals
            for (let i = 0; i < 3; i++) {
                await contracts.vereavement.connect(user1).completeRitual("Daily Ritual");
            }

            // Process growth with bonuses
            await time.increase(SECONDS_PER_DAY);
            await contracts.vereavement.connect(user1).processSymbolicGrowth();

            const finalValue = await contracts.vereavement.getRitualValue(user1.address);
            const baseGrowth = initialValue.mul(5).div(100);
            const actualGrowth = finalValue.sub(initialValue);
            expect(actualGrowth).to.be.gt(baseGrowth);
        });
    });

    describe("Growth State Persistence", function () {
        it("Should maintain growth state across updates", async function () {
            // Set initial value and process growth
            const initialValue = ethers.utils.parseEther("1");
            await contracts.ritualEngine.connect(oracle).setRitualValue(user1.address, initialValue);

            // Process multiple growth periods
            for (let i = 0; i < 3; i++) {
                await time.increase(SECONDS_PER_DAY);
                await contracts.vereavement.connect(user1).processSymbolicGrowth();
            }

            // Record state
            const midValue = await contracts.vereavement.getRitualValue(user1.address);

            // Process more growth
            await time.increase(SECONDS_PER_DAY);
            await contracts.vereavement.connect(user1).processSymbolicGrowth();

            const finalValue = await contracts.vereavement.getRitualValue(user1.address);
            expect(finalValue).to.be.gt(midValue);
        });

        it("Should preserve growth history after death", async function () {
            // Build up value and growth history
            const initialValue = ethers.utils.parseEther("1");
            await contracts.ritualEngine.connect(oracle).setRitualValue(user1.address, initialValue);

            for (let i = 0; i < 3; i++) {
                await time.increase(SECONDS_PER_DAY);
                await contracts.vereavement.connect(user1).processSymbolicGrowth();
            }

            const preDeathValue = await contracts.vereavement.getRitualValue(user1.address);

            // Process death
            await contracts.vereavement.connect(oracle).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);

            const postDeathValue = await contracts.vereavement.getRitualValue(user1.address);
            expect(postDeathValue).to.equal(preDeathValue);
        });
    });
}); 