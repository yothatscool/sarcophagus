const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Vereavement Ritual Mechanics", function () {
    let vereavement;
    let ritualEngine;
    let b3trToken;
    let vthoManager;
    let vnsResolver;
    let owner;
    let user1;
    let user2;
    let oracle;
    let mediator;

    const WEEK = 7 * 24 * 60 * 60;
    const DAY = 24 * 60 * 60;
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));

    beforeEach(async function () {
        [owner, user1, user2, oracle, mediator] = await ethers.getSigners();

        // Deploy mock contracts
        const MockB3TR = await ethers.getContractFactory("MockB3TR");
        b3trToken = await MockB3TR.deploy();

        const MockVTHOManager = await ethers.getContractFactory("MockVTHOManager");
        vthoManager = await MockVTHOManager.deploy();

        const MockVNSResolver = await ethers.getContractFactory("MockVNSResolver");
        vnsResolver = await MockVNSResolver.deploy();

        // Deploy main contracts
        const RitualEngine = await ethers.getContractFactory("RitualEngine");
        ritualEngine = await RitualEngine.deploy(b3trToken.address);

        const Vereavement = await ethers.getContractFactory("Vereavement");
        vereavement = await Vereavement.deploy(
            ethers.parseEther("500"),
            ethers.parseEther("1000"),
            2,
            vthoManager.address,
            vnsResolver.address,
            ritualEngine.address
        );

        // Setup roles and initial state
        await ritualEngine.grantRole(ORACLE_ROLE, oracle.address);
        await vereavement.grantRole(ORACLE_ROLE, oracle.address);
        await b3trToken.mint(ritualEngine.address, ethers.parseEther("1000000"));
    });

    describe("Carbon Offset Mechanics", function () {
        beforeEach(async function () {
            await vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await vereavement.connect(user1).createRitualVault();
        });

        it("Should calculate ritual value correctly from carbon offset", async function () {
            const amount = ethers.parseEther("1");
            const oracleKey = ethers.keccak256(ethers.toUtf8Bytes("TEST_KEY"));
            const proof = ethers.AbiCoder.defaultAbiCoder().encode(
                ["uint256", "bytes"],
                [await time.latest(), "0x"]
            );
            const signature = await oracle.signMessage(ethers.getBytes(oracleKey));

            await vereavement.connect(user1).recordCarbonOffset(
                amount,
                "Test Source",
                oracleKey,
                proof,
                signature
            );

            const ritualValue = await vereavement.getRitualValue(user1.address);
            expect(ritualValue).to.equal(amount * 100n); // 1 metric ton = 100 ritual points
        });

        it("Should accumulate multiple carbon offsets", async function () {
            const amount1 = ethers.parseEther("1");
            const amount2 = ethers.parseEther("2");
            const oracleKey = ethers.keccak256(ethers.toUtf8Bytes("TEST_KEY"));
            const proof = ethers.AbiCoder.defaultAbiCoder().encode(
                ["uint256", "bytes"],
                [await time.latest(), "0x"]
            );
            const signature = await oracle.signMessage(ethers.getBytes(oracleKey));

            await vereavement.connect(user1).recordCarbonOffset(
                amount1,
                "Source 1",
                oracleKey,
                proof,
                signature
            );

            await vereavement.connect(user1).recordCarbonOffset(
                amount2,
                "Source 2",
                oracleKey,
                proof,
                signature
            );

            const totalOffset = await vereavement.getCarbonOffset(user1.address);
            expect(totalOffset).to.equal(amount1 + amount2);
        });

        it("Should reject invalid oracle signatures", async function () {
            const amount = ethers.parseEther("1");
            const oracleKey = ethers.keccak256(ethers.toUtf8Bytes("TEST_KEY"));
            const proof = ethers.AbiCoder.defaultAbiCoder().encode(
                ["uint256", "bytes"],
                [await time.latest(), "0x"]
            );
            const invalidSignature = await user2.signMessage(ethers.getBytes(oracleKey));

            await expect(
                vereavement.connect(user1).recordCarbonOffset(
                    amount,
                    "Test Source",
                    oracleKey,
                    proof,
                    invalidSignature
                )
            ).to.be.revertedWith("Invalid signature");
        });
    });

    describe("Symbolic Growth Mechanics", function () {
        beforeEach(async function () {
            await vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await vereavement.connect(user1).createRitualVault();
        });

        it("Should apply compound growth over time", async function () {
            // Initial carbon offset
            const amount = ethers.parseEther("1");
            const oracleKey = ethers.keccak256(ethers.toUtf8Bytes("TEST_KEY"));
            const proof = ethers.AbiCoder.defaultAbiCoder().encode(
                ["uint256", "bytes"],
                [await time.latest(), "0x"]
            );
            const signature = await oracle.signMessage(ethers.getBytes(oracleKey));

            await vereavement.connect(user1).recordCarbonOffset(
                amount,
                "Test Source",
                oracleKey,
                proof,
                signature
            );

            const initialValue = await vereavement.getRitualValue(user1.address);

            // Advance time and process growth multiple times
            for (let i = 0; i < 7; i++) {
                await time.increase(DAY);
                await vereavement.connect(user1).processSymbolicGrowth();
            }

            const finalValue = await vereavement.getRitualValue(user1.address);
            expect(finalValue).to.be.gt(initialValue);
        });

        it("Should cap growth at maximum periods", async function () {
            // Initial carbon offset
            const amount = ethers.parseEther("1");
            const oracleKey = ethers.keccak256(ethers.toUtf8Bytes("TEST_KEY"));
            const proof = ethers.AbiCoder.defaultAbiCoder().encode(
                ["uint256", "bytes"],
                [await time.latest(), "0x"]
            );
            const signature = await oracle.signMessage(ethers.getBytes(oracleKey));

            await vereavement.connect(user1).recordCarbonOffset(
                amount,
                "Test Source",
                oracleKey,
                proof,
                signature
            );

            // Advance time beyond max growth periods
            await time.increase(60 * DAY); // More than MAX_GROWTH_PERIODS

            await vereavement.connect(user1).processSymbolicGrowth();
            const value1 = await vereavement.getRitualValue(user1.address);

            // Advance time further
            await time.increase(30 * DAY);

            await vereavement.connect(user1).processSymbolicGrowth();
            const value2 = await vereavement.getRitualValue(user1.address);

            // Growth should be capped
            expect(value2 - value1).to.equal(0n);
        });
    });

    describe("Longevity Score Mechanics", function () {
        beforeEach(async function () {
            await vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await vereavement.connect(user1).createRitualVault();
        });

        it("Should increase longevity score over time", async function () {
            const initialScore = await vereavement.getLongevityScore(user1.address);

            // Complete multiple rituals over time
            for (let i = 0; i < 3; i++) {
                await time.increase(DAY);
                await vereavement.connect(user1).completeRitual("Daily Meditation");
            }

            const finalScore = await vereavement.getLongevityScore(user1.address);
            expect(finalScore).to.equal(initialScore + 3n);
        });

        it("Should apply quadratic bonus for higher scores", async function () {
            // Complete multiple rituals to increase score
            for (let i = 0; i < 5; i++) {
                await time.increase(DAY);
                await vereavement.connect(user1).completeRitual("Daily Meditation");
            }
        });
    });

    describe("Memorial Preservation", function () {
        beforeEach(async function () {
            await vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await vereavement.connect(user1).createRitualVault();
        });

        it("Should preserve memorials in ritual vault", async function () {
            const hash1 = "QmHash1";
            const hash2 = "QmHash2";

            await vereavement.connect(user1).preserveMemorial(hash1);
            await vereavement.connect(user1).preserveMemorial(hash2);

            const memorials = await vereavement.getMemorials(user1.address);
            expect(memorials).to.deep.equal([hash1, hash2]);
        });

        it("Should maintain memorial access after death", async function () {
            const hash = "QmTestHash";
            await vereavement.connect(user1).preserveMemorial(hash);

            // Confirm death
            await vereavement.connect(oracle).confirmDeath(user1.address);
            await vereavement.connect(oracle).confirmDeath(user1.address);

            // Wait for challenge period
            await time.increase(30 * DAY);

            const memorials = await vereavement.getMemorials(user1.address);
            expect(memorials).to.deep.equal([hash]);
        });
    });
}); 