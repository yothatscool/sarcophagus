const { ethers } = require("hardhat");
const { ROLES, ZERO_ADDRESS, toWei } = require("./TestUtils");

const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = SECONDS_PER_DAY * 7;
const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;

async function setupRitualEngine() {
    const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy mock B3TR token
    const MockB3TR = await ethers.getContractFactory("MockB3TR");
    const b3trToken = await MockB3TR.deploy();

    // Deploy Ritual Engine (no constructor parameters)
    const RitualEngine = await ethers.getContractFactory("RitualEngine");
    const ritualEngine = await RitualEngine.deploy();

    // Setup roles
    await ritualEngine.grantRole(ROLES.ORACLE_ROLE, addr1.address);

    // Fund the ritual engine
    await b3trToken.mint(ritualEngine.target, toWei("1000000"));

    return {
        owner,
        addr1,
        addr2,
        addrs,
        b3trToken,
        ritualEngine
    };
}

async function setupRitualState(ritualEngine, user, carbonOffset = 50) {
    await ritualEngine.connect(user).createRitualVault();
    await ritualEngine.recordCarbonOffset(
        user.address,
        carbonOffset,
        "Major Carbon Offset",
        ethers.keccak256(ethers.toUtf8Bytes("proof"))
    );
}

async function getRitualState(ritualEngine, user) {
    const vault = await ritualEngine.getRitualVault(user.address);
    const carbonOffsets = await ritualEngine.getCarbonOffsets(user.address);
    const ritualValue = await ritualEngine.getRitualValue(user.address);
    
    return {
        vault,
        carbonOffsets,
        ritualValue
    };
}

async function mineBlocks(blocks) {
    for (let i = 0; i < blocks; i++) {
        await ethers.provider.send("evm_mine", []);
    }
}

module.exports = {
    setupRitualEngine,
    setupRitualState,
    getRitualState,
    mineBlocks,
    SECONDS_PER_DAY,
    SECONDS_PER_WEEK,
    SECONDS_PER_MONTH
}; 