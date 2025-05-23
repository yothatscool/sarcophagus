const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    setupRitualEngine,
    setupRitualState,
    getRitualState,
    SECONDS_PER_DAY,
    SECONDS_PER_MONTH
} = require("./helpers/RitualTestHelpers");

describe("Vereavement Fuzz Testing", function () {
    let vereavement;
    let ritualEngine;
    let b3trToken;
    let owner;
    let oracle;
    let user1;

    beforeEach(async function () {
        const setup = await setupRitualEngine();
        ritualEngine = setup.ritualEngine;
        b3trToken = setup.b3trToken;
        owner = setup.owner;
        oracle = setup.oracle;
        user1 = setup.user1;
    });

    describe("Ritual Calculations Fuzz Tests", function () {
        it("Should handle large carbon offset values", async function () {
            const largeAmount = ethers.utils.parseUnits("1000000", "ether");
            await ritualEngine.connect(oracle).recordCarbonOffset(
                largeAmount,
                "Massive Carbon Offset",
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"))
            );

            const metrics = await ritualEngine.getRitualMetrics(oracle.address);
            expect(metrics.carbonOffset).to.equal(largeAmount);
            expect(metrics.ritualValue).to.be.above(0);
        });

        it("Should handle rapid ritual updates", async function () {
            for (let i = 0; i < 50; i++) {
                await time.increase(SECONDS_PER_DAY);
                await ritualEngine.connect(user1).updateLongevityMetrics();
                await ritualEngine.connect(user1).processSymbolicGrowth();
            }

            const metrics = await ritualEngine.getRitualMetrics(user1.address);
            expect(metrics.longevityScore).to.be.above(0);
        });

        it("Should fuzz test compound growth calculations", async function () {
            const testCases = [];
            for (let i = 0; i < 20; i++) {
                testCases.push({
                    baseValue: ethers.utils.parseUnits(String(Math.floor(Math.random() * 1000) + 1), "ether"),
                    timePeriod: Math.floor(Math.random() * 365) + 1
                });
            }

            for (const testCase of testCases) {
                await ritualEngine.connect(oracle).recordCarbonOffset(
                    testCase.baseValue,
                    "Fuzz Test",
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"))
                );

                await time.increase(testCase.timePeriod * SECONDS_PER_DAY);
                await ritualEngine.connect(oracle).processSymbolicGrowth();

                const metrics = await ritualEngine.getRitualMetrics(oracle.address);
                expect(metrics.ritualValue).to.be.above(testCase.baseValue);
            }
        });
    });

    describe("Edge Cases and Stress Tests", function () {
        it("Should handle maximum uint256 values", async function () {
            const maxUint256 = ethers.constants.MaxUint256;
            await expect(
                ritualEngine.connect(oracle).recordCarbonOffset(
                    maxUint256,
                    "Max Value Test",
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"))
                )
            ).to.be.reverted; // Should revert due to overflow
        });

        it("Should handle minimum ritual values", async function () {
            await ritualEngine.connect(oracle).recordCarbonOffset(
                1,
                "Minimum Value",
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"))
            );

            const metrics = await ritualEngine.getRitualMetrics(oracle.address);
            expect(metrics.ritualValue).to.be.above(0);
        });

        it("Should stress test with multiple concurrent users", async function () {
            const signers = await ethers.getSigners();
            const users = signers.slice(0, 10); // Test with 10 users

            // Each user performs multiple operations
            await Promise.all(users.map(async (user) => {
                await ritualEngine.connect(user).updateLongevityMetrics();
                await time.increase(SECONDS_PER_DAY);
                
                await ritualEngine.connect(oracle).recordCarbonOffset(
                    ethers.utils.parseUnits("100", "ether"),
                    "Stress Test",
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"))
                );

                await ritualEngine.connect(user).processSymbolicGrowth();
            }));

            // Verify all users have valid states
            for (const user of users) {
                const metrics = await ritualEngine.getRitualMetrics(user.address);
                expect(metrics.ritualValue).to.be.above(0);
                expect(metrics.longevityScore).to.be.above(0);
            }
        });
    });

    describe("Gas Usage Benchmarks", function () {
        it("Should measure gas usage for ritual operations", async function () {
            // Record carbon offset
            const tx1 = await ritualEngine.connect(oracle).recordCarbonOffset(
                ethers.utils.parseUnits("100", "ether"),
                "Gas Test",
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"))
            );
            const receipt1 = await tx1.wait();
            console.log("Gas used for recordCarbonOffset:", receipt1.gasUsed.toString());

            // Update longevity metrics
            const tx2 = await ritualEngine.connect(user1).updateLongevityMetrics();
            const receipt2 = await tx2.wait();
            console.log("Gas used for updateLongevityMetrics:", receipt2.gasUsed.toString());

            // Process symbolic growth
            await time.increase(SECONDS_PER_DAY);
            const tx3 = await ritualEngine.connect(user1).processSymbolicGrowth();
            const receipt3 = await tx3.wait();
            console.log("Gas used for processSymbolicGrowth:", receipt3.gasUsed.toString());
        });

        it("Should benchmark gas usage with different input sizes", async function () {
            const testSizes = [10, 100, 1000, 10000];
            
            for (const size of testSizes) {
                const tx = await ritualEngine.connect(oracle).recordCarbonOffset(
                    size,
                    `Gas Benchmark ${size}`,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"))
                );
                const receipt = await tx.wait();
                console.log(`Gas used for size ${size}:`, receipt.gasUsed.toString());
            }
        });
    });
}); 