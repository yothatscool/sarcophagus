const { ethers } = require("hardhat");
const { ROLES, ZERO_ADDRESS, toWei } = require("./TestUtils");

const SECONDS_PER_DAY = 86400;
const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;

async function deployTestContracts() {
    const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy mock contracts
    const MockB3TR = await ethers.getContractFactory("MockB3TR");
    const b3trToken = await MockB3TR.deploy();

    // Deploy mock VNS Resolver
    const MockVNSResolver = await ethers.getContractFactory("MockVNSResolver");
    const vnsResolver = await MockVNSResolver.deploy();

    // Deploy VTHO Manager
    const VTHOManager = await ethers.getContractFactory("VTHOManager");
    const vthoManager = await VTHOManager.deploy();

    // Deploy Ritual Engine
    const RitualEngine = await ethers.getContractFactory("RitualEngine");
    const ritualEngine = await RitualEngine.deploy(b3trToken.target);

    // Deploy main contract
    const Vereavement = await ethers.getContractFactory("Vereavement");
    const vereavement = await Vereavement.deploy(
        toWei("500"), // Weekly allocation
        toWei("1000"), // Treasury yield
        3, // Min confirmations
        vthoManager.target,
        vnsResolver.target,
        ritualEngine.target
    );

    // Setup roles
    await vereavement.grantRole(ROLES.ORACLE_ROLE, addr1.address);
    await vereavement.grantRole(ROLES.MEDIATOR_ROLE, addr2.address);
    await ritualEngine.grantRole(ROLES.ORACLE_ROLE, addr1.address);

    // Fund contracts
    await b3trToken.mint(ritualEngine.target, toWei("1000000"));

    return {
        owner,
        addr1,
        addr2,
        addrs,
        b3trToken,
        vnsResolver,
        vthoManager,
        ritualEngine,
        vereavement
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