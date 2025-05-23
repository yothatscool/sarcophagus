const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Vereavement <> RitualEngine Integration", function () {
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
    const MEDIATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MEDIATOR_ROLE"));

    beforeEach(async function () {
        [owner, user1, user2, oracle, mediator] = await ethers.getSigners();

        // Deploy mock B3TR token
        const MockB3TR = await ethers.getContractFactory("MockB3TR");
        b3trToken = await MockB3TR.deploy();

        // Deploy mock VTHO manager
        const MockVTHOManager = await ethers.getContractFactory("MockVTHOManager");
        vthoManager = await MockVTHOManager.deploy();

        // Deploy mock VNS resolver
        const MockVNSResolver = await ethers.getContractFactory("MockVNSResolver");
        vnsResolver = await MockVNSResolver.deploy();

        // Deploy RitualEngine
        const RitualEngine = await ethers.getContractFactory("RitualEngine");
        ritualEngine = await RitualEngine.deploy(b3trToken.address);

        // Deploy Vereavement with configuration
        const Vereavement = await ethers.getContractFactory("Vereavement");
        vereavement = await Vereavement.deploy(
            ethers.parseEther("500"), // flatWeeklyAllocation
            ethers.parseEther("1000"), // totalTreasuryYield
            2, // minConfirmations
            vthoManager.address,
            vnsResolver.address,
            ritualEngine.address
        );

        // Setup roles
        await ritualEngine.grantRole(ORACLE_ROLE, oracle.address);
        await vereavement.grantRole(ORACLE_ROLE, oracle.address);
        await vereavement.grantRole(MEDIATOR_ROLE, mediator.address);

        // Fund the ritual engine with B3TR tokens
        await b3trToken.mint(ritualEngine.address, ethers.parseEther("1000000"));
    });

    describe("Ritual Vault Creation and Updates", function () {
        it("Should create ritual vaults in both contracts", async function () {
            // Register user in Vereavement
            await vereavement.connect(user1).registerUser(
                [user2.address],
                [10000], // 100%
                [0], // no vesting
                [false], // not conditional
                [""] // no conditions
            );

            // Create ritual vault
            await vereavement.connect(user1).createRitualVault();

            // Verify vault creation in both contracts
            expect(await vereavement.isRitualActive(user1.address)).to.be.true;
            expect(await ritualEngine.getRitualValue(user1.address)).to.equal(0);
        });

        it("Should sync ritual values between contracts", async function () {
            // Setup ritual vault
            await vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await vereavement.connect(user1).createRitualVault();

            // Record carbon offset
            const amount = ethers.parseEther("1");
            const source = "Test Source";
            const oracleKey = ethers.keccak256(ethers.toUtf8Bytes("TEST_KEY"));
            const proof = ethers.AbiCoder.defaultAbiCoder().encode(
                ["uint256", "bytes"],
                [await time.latest(), "0x"]
            );
            const signature = await oracle.signMessage(ethers.getBytes(oracleKey));

            await vereavement.connect(user1).recordCarbonOffset(
                amount,
                source,
                oracleKey,
                proof,
                signature
            );

            // Verify values are synced
            const vereavementValue = await vereavement.getRitualValue(user1.address);
            const engineValue = await ritualEngine.getRitualValue(user1.address);
            expect(vereavementValue).to.equal(engineValue);
        });

        it("Should process symbolic growth correctly", async function () {
            // Setup ritual vault
            await vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await vereavement.connect(user1).createRitualVault();

            // Record initial carbon offset
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

            // Advance time by 1 day
            await time.increase(DAY);

            // Process growth
            await vereavement.connect(user1).processSymbolicGrowth();

            // Verify growth occurred
            const finalValue = await vereavement.getRitualValue(user1.address);
            expect(finalValue).to.be.gt(amount);
        });
    });

    describe("Death Declaration and Ritual State", function () {
        beforeEach(async function () {
            // Setup user with ritual vault
            await vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await vereavement.connect(user1).createRitualVault();

            // Add some ritual value
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
        });

        it("Should preserve ritual state on death declaration", async function () {
            // Get initial ritual state
            const initialState = await vereavement.getRitualState(user1.address);

            // Confirm death
            await vereavement.connect(oracle).confirmDeath(user1.address);
            await vereavement.connect(oracle).confirmDeath(user1.address); // Second confirmation

            // Wait for challenge period
            await time.increase(30 * DAY);

            // Get final ritual state
            const finalState = await vereavement.getRitualState(user1.address);

            // Verify state preservation
            expect(finalState.totalValue).to.equal(initialState.totalValue);
        });
    });
}); 