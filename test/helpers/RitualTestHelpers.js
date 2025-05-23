const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = SECONDS_PER_DAY * 7;
const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;

async function setupRitualEngine() {
    const [owner, oracle, user1, user2] = await ethers.getSigners();
    
    // Deploy mock B3TR
    const B3TRToken = await ethers.getContractFactory("MockB3TR");
    const b3trToken = await B3TRToken.deploy();
    await b3trToken.waitForDeployment();
    
    // Deploy RitualEngine
    const RitualEngine = await ethers.getContractFactory("RitualEngine");
    const ritualEngine = await RitualEngine.deploy(await b3trToken.getAddress());
    await ritualEngine.waitForDeployment();
    
    // Setup roles
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    await ritualEngine.grantRole(ORACLE_ROLE, await oracle.getAddress());
    
    // Fund contract
    await b3trToken.mint(await ritualEngine.getAddress(), ethers.parseEther("1000000"));
    
    return {
        owner,
        oracle,
        user1,
        user2,
        b3trToken,
        ritualEngine
    };
}

async function setupRitualState(ritualEngine, oracle, user, options = {}) {
    const {
        carbonOffset = 10,
        longevityPeriods = 1,
        growthPeriods = 1
    } = options;
    
    // Record carbon offset
    await ritualEngine.connect(oracle).recordCarbonOffset(
        carbonOffset,
        "Test Source",
        ethers.ZeroHash
    );
    
    // Setup longevity
    await ritualEngine.connect(user).updateLongevityMetrics();
    for (let i = 0; i < longevityPeriods; i++) {
        await time.increase(SECONDS_PER_MONTH);
        await ritualEngine.connect(user).updateLongevityMetrics();
    }
    
    // Process growth
    for (let i = 0; i < growthPeriods; i++) {
        await time.increase(SECONDS_PER_DAY);
        await ritualEngine.connect(user).processSymbolicGrowth();
    }
}

async function getRitualState(ritualEngine, user) {
    const metrics = await ritualEngine.getRitualMetrics(await user.getAddress());
    return {
        ritualValue: metrics.ritualValue,
        carbonOffset: metrics.carbonOffset,
        longevityScore: metrics.longevityScore,
        lastGrowth: metrics.lastGrowth,
        b3trBalance: metrics.b3trBalance,
        ritualPower: metrics.ritualPower
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