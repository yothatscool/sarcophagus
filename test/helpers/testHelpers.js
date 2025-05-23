const { ethers } = require("hardhat");

const SECONDS_PER_DAY = 86400;
const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;

async function deployTestContracts() {
    const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy mock VNS Resolver
    const MockVNSResolver = await ethers.getContractFactory("MockVNSResolver");
    const mockVNSResolver = await MockVNSResolver.deploy();
    await mockVNSResolver.waitForDeployment();

    // Deploy VTHO Manager
    const VTHOManager = await ethers.getContractFactory("VTHOManager");
    const vthoManager = await VTHOManager.deploy();
    await vthoManager.waitForDeployment();

    // Deploy mock B3TR token
    const MockB3TR = await ethers.getContractFactory("MockB3TR");
    const b3trToken = await MockB3TR.deploy();
    await b3trToken.waitForDeployment();

    // Deploy Ritual Engine
    const RitualEngine = await ethers.getContractFactory("RitualEngine");
    const ritualEngine = await RitualEngine.deploy(await b3trToken.getAddress());
    await ritualEngine.waitForDeployment();

    // Deploy main contract
    const Vereavement = await ethers.getContractFactory("Vereavement");
    const vereavement = await Vereavement.deploy(
        ethers.parseEther("500"),
        ethers.parseEther("1000"),
        3,
        await vthoManager.getAddress(),
        await mockVNSResolver.getAddress(),
        await ritualEngine.getAddress()
    );
    await vereavement.waitForDeployment();

    // Fund the ritual engine with B3TR tokens
    await b3trToken.mint(await ritualEngine.getAddress(), ethers.parseEther("1000000"));

    return {
        owner,
        addr1,
        addr2,
        addrs,
        mockVNSResolver,
        vthoManager,
        ritualEngine,
        vereavement,
        b3trToken
    };
}

async function registerUser(vereavement, user, beneficiary, percentage = 10000) {
    await vereavement.connect(user).registerUser(
        [await beneficiary.getAddress()],
        [percentage],
        [0],
        [false],
        [""]
    );
}

async function setupRitualVault(vereavement, user) {
    await vereavement.connect(user).createRitualVault();
}

async function increaseTime(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
}

module.exports = {
    SECONDS_PER_DAY,
    SECONDS_PER_MONTH,
    deployTestContracts,
    registerUser,
    setupRitualVault,
    increaseTime
}; 