const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    deployTestContracts,
    SECONDS_PER_DAY
} = require("./helpers/testHelpers");

describe("Vereavement Token Management", function () {
    let contracts;
    let owner;
    let user1;
    let user2;
    let mockVTHO;
    let mockB3TR;

    beforeEach(async function () {
        contracts = await deployTestContracts();
        owner = contracts.owner;
        [user1, user2] = contracts.addrs;

        // Deploy mock tokens
        const MockToken = await ethers.getContractFactory("MockToken");
        mockVTHO = await MockToken.deploy("VTHO", "VTHO");
        mockB3TR = await MockToken.deploy("B3TR", "B3TR");
        await mockVTHO.deployed();
        await mockB3TR.deployed();

        // Fund users
        await mockVTHO.mint(user1.address, ethers.utils.parseEther("1000"));
        await mockB3TR.mint(user1.address, ethers.utils.parseEther("1000"));
    });

    describe("VTHO Management", function () {
        it("Should enable VTHO distribution", async function () {
            await contracts.vereavement.connect(user1).setAutoDistributeVTHO(true);
            expect(await contracts.vereavement.connect(user1).isAutoDistributeVTHOEnabled()).to.be.true;
        });

        it("Should accumulate and distribute VTHO", async function () {
            // Setup vault
            await contracts.vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );

            // Enable VTHO
            await contracts.vereavement.connect(user1).setAutoDistributeVTHO(true);

            // Simulate VTHO generation
            await mockVTHO.mint(contracts.vthoManager.address, ethers.utils.parseEther("100"));

            // Time passes
            await time.increase(30 * SECONDS_PER_DAY);

            // Claim VTHO
            await contracts.vereavement.connect(user1).claimVTHO();

            const vthoBalance = await contracts.vereavement.getTokenBalance(
                user1.address,
                mockVTHO.address
            );
            expect(vthoBalance).to.be.gt(0);
        });

        it("Should distribute VTHO to beneficiaries after death", async function () {
            // Setup vault with beneficiaries
            await contracts.vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );

            // Enable VTHO and accumulate
            await contracts.vereavement.connect(user1).setAutoDistributeVTHO(true);
            await mockVTHO.mint(contracts.vthoManager.address, ethers.utils.parseEther("100"));

            // Confirm death
            await contracts.vereavement.connect(owner).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);

            // Beneficiary claims
            await contracts.vereavement.connect(user2).payoutVault(user1.address, mockVTHO.address);

            const vthoBalance = await mockVTHO.balanceOf(user2.address);
            expect(vthoBalance).to.be.gt(0);
        });
    });

    describe("B3TR Token Integration", function () {
        it("Should handle B3TR deposits", async function () {
            await contracts.vereavement.connect(user1).addToken(mockB3TR.address);
            await mockB3TR.connect(user1).approve(contracts.vereavement.address, ethers.utils.parseEther("100"));
            await contracts.vereavement.connect(user1).depositToken(mockB3TR.address, ethers.utils.parseEther("100"));

            const balance = await contracts.vereavement.getTokenBalance(user1.address, mockB3TR.address);
            expect(balance).to.equal(ethers.utils.parseEther("100"));
        });

        it("Should distribute weekly B3TR allocation based on ritual power", async function () {
            await contracts.vereavement.connect(user1).registerUser(
                [user2.address],
                [10000],
                [0],
                [false],
                [""]
            );

            await contracts.ritualEngine.connect(owner).recordCarbonOffset(
                user1.address,
                100,
                "Test Offset",
                ethers.utils.formatBytes32String("proof")
            );

            await time.increase(7 * SECONDS_PER_DAY);
            await contracts.vereavement.connect(user1).claimWeeklyAllocation();

            const b3trBalance = await contracts.vereavement.getTokenBalance(
                user1.address,
                mockB3TR.address
            );
            expect(b3trBalance).to.be.gt(0);
        });
    });

    describe("Multi-token Support", function () {
        it("Should manage multiple token balances", async function () {
            // Add both tokens
            await contracts.vereavement.connect(user1).addToken(mockVTHO.address);
            await contracts.vereavement.connect(user1).addToken(mockB3TR.address);

            // Approve and deposit both tokens
            await mockVTHO.connect(user1).approve(contracts.vereavement.address, ethers.utils.parseEther("50"));
            await mockB3TR.connect(user1).approve(contracts.vereavement.address, ethers.utils.parseEther("50"));

            await contracts.vereavement.connect(user1).depositToken(mockVTHO.address, ethers.utils.parseEther("50"));
            await contracts.vereavement.connect(user1).depositToken(mockB3TR.address, ethers.utils.parseEther("50"));

            // Check balances
            const vthoBalance = await contracts.vereavement.getTokenBalance(user1.address, mockVTHO.address);
            const b3trBalance = await contracts.vereavement.getTokenBalance(user1.address, mockB3TR.address);

            expect(vthoBalance).to.equal(ethers.utils.parseEther("50"));
            expect(b3trBalance).to.equal(ethers.utils.parseEther("50"));
        });

        it("Should handle token removal", async function () {
            await contracts.vereavement.connect(user1).addToken(mockB3TR.address);
            await contracts.vereavement.connect(user1).removeToken(mockB3TR.address);

            await expect(
                contracts.vereavement.connect(user1).depositToken(mockB3TR.address, ethers.utils.parseEther("50"))
            ).to.be.revertedWith("Token not supported");
        });
    });
}); 