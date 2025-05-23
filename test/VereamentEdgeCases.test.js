const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    deployTestContracts,
    SECONDS_PER_DAY
} = require("./helpers/testHelpers");

describe("Vereavement Edge Cases", function () {
    let contracts;
    let owner;
    let user1;
    let user2;
    let oracle;

    beforeEach(async function () {
        contracts = await deployTestContracts();
        owner = contracts.owner;
        [user1, user2, oracle] = contracts.addrs;

        // Setup oracle role
        await contracts.vereavement.grantRole(
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ROLE")),
            oracle.address
        );
    });

    describe("Ritual Value Boundaries", function () {
        beforeEach(async function () {
            await contracts.vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await contracts.vereavement.connect(user1).createRitualVault();
        });

        it("Should handle maximum uint256 ritual value", async function () {
            const maxValue = ethers.constants.MaxUint256;
            await contracts.ritualEngine.connect(oracle).setRitualValue(user1.address, maxValue);
            
            // Attempt to increase value further
            await expect(
                contracts.ritualEngine.connect(oracle).incrementRitualValue(user1.address, 1)
            ).to.be.reverted;
        });

        it("Should handle zero value operations correctly", async function () {
            // Try to record zero carbon offset
            const oracleKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TEST_KEY"));
            const proof = ethers.utils.defaultAbiCoder.encode(
                ["uint256", "bytes"],
                [await time.latest(), "0x"]
            );
            const signature = await oracle.signMessage(ethers.utils.arrayify(oracleKey));

            await expect(
                contracts.vereavement.connect(user1).recordCarbonOffset(
                    0,
                    "Test Source",
                    oracleKey,
                    proof,
                    signature
                )
            ).to.be.revertedWith("Invalid amount");
        });
    });

    describe("Time-based Edge Cases", function () {
        beforeEach(async function () {
            await contracts.vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await contracts.vereavement.connect(user1).createRitualVault();
        });

        it("Should handle extremely long time periods", async function () {
            // Advance time by 100 years
            await time.increase(365 * 100 * SECONDS_PER_DAY);
            
            // Should still be able to process growth
            await contracts.vereavement.connect(user1).processSymbolicGrowth();
            
            const ritualValue = await contracts.vereavement.getRitualValue(user1.address);
            expect(ritualValue).to.equal(0); // No growth without initial value
        });

        it("Should handle rapid consecutive operations", async function () {
            // Perform multiple operations in the same block
            await Promise.all([
                contracts.vereavement.connect(user1).processSymbolicGrowth(),
                contracts.vereavement.connect(user1).updateLongevityMetrics(),
                contracts.vereavement.connect(user1).preserveMemorial("QmTest")
            ]);

            // Verify state consistency
            const ritualState = await contracts.vereavement.getRitualState(user1.address);
            expect(ritualState.lastUpdateTime).to.not.equal(0);
        });
    });

    describe("Beneficiary Edge Cases", function () {
        it("Should handle maximum number of beneficiaries", async function () {
            // Create array of maximum allowed beneficiaries
            const maxBeneficiaries = Array(256).fill(user2.address);
            const percentages = Array(256).fill(Math.floor(10000 / 256));
            percentages[0] += 10000 % 256; // Add remainder to first beneficiary
            const vestingDurations = Array(256).fill(0);
            const isConditional = Array(256).fill(false);
            const conditions = Array(256).fill("");

            await expect(
                contracts.vereavement.connect(user1).registerUser(
                    maxBeneficiaries,
                    percentages,
                    vestingDurations,
                    isConditional,
                    conditions
                )
            ).to.be.revertedWith("Too many beneficiaries");
        });

        it("Should handle complex vesting schedules", async function () {
            // Register with multiple vesting periods
            await contracts.vereavement.connect(user1).registerUser(
                [user2.address, user2.address, user2.address],
                [3333, 3333, 3334], // Splits 100%
                [30 * SECONDS_PER_DAY, 180 * SECONDS_PER_DAY, 365 * SECONDS_PER_DAY],
                [false, false, false],
                ["", "", ""]
            );

            // Confirm death and wait minimum period
            await contracts.vereavement.connect(oracle).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);

            // Check vesting status
            const vestingInfo = await contracts.vereavement.getVestingInfo(user1.address, 0);
            expect(vestingInfo.isVesting).to.be.true;
        });
    });

    describe("Memorial System Edge Cases", function () {
        beforeEach(async function () {
            await contracts.vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await contracts.vereavement.connect(user1).createRitualVault();
        });

        it("Should handle maximum memorial size", async function () {
            // Create very large memorial hash (1MB)
            const largeHash = "0x" + "f".repeat(2097152); // 1MB in hex

            await expect(
                contracts.vereavement.connect(user1).preserveMemorial(largeHash)
            ).to.be.revertedWith("Memorial too large");
        });

        it("Should handle concurrent memorial operations", async function () {
            // Add multiple memorials concurrently
            const hashes = Array(10).fill().map((_, i) => `QmTest${i}`);
            await Promise.all(
                hashes.map(hash => 
                    contracts.vereavement.connect(user1).preserveMemorial(hash)
                )
            );

            const memorials = await contracts.vereavement.getMemorials(user1.address);
            expect(memorials).to.have.lengthOf(hashes.length);
        });
    });
}); 