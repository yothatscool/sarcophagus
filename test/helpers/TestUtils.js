const { ethers } = require("hardhat");

/**
 * Helper functions for test files
 */
const TestUtils = {
    // Constants
    ZERO_ADDRESS: ethers.ZeroAddress,
    MAX_UINT256: ethers.MaxUint256,

    // Role constants
    ROLES: {
        ORACLE_ROLE: ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE")),
        MEDIATOR_ROLE: ethers.keccak256(ethers.toUtf8Bytes("MEDIATOR_ROLE")),
        STORAGE_WRITE: ethers.keccak256(ethers.toUtf8Bytes("STORAGE_WRITE")),
        STORAGE_READ: ethers.keccak256(ethers.toUtf8Bytes("STORAGE_READ"))
    },

    // Helper functions
    generateProofHash: (proofString) => ethers.keccak256(ethers.toUtf8Bytes(proofString)),
    generateOracleKey: (keyString) => ethers.keccak256(ethers.toUtf8Bytes(keyString)),

    // Contract deployment helpers
    deployContract: async (name, args = []) => {
        const factory = await ethers.getContractFactory(name);
        const contract = await factory.deploy(...args);
        return contract;
    },

    // Token helpers
    toWei: (amount) => ethers.parseEther(amount),
    fromWei: (amount) => ethers.formatEther(amount),

    // Time helpers
    increaseTime: async (seconds) => {
        await ethers.provider.send("evm_increaseTime", [seconds]);
        await ethers.provider.send("evm_mine");
    },

    // Role helpers
    grantRole: async (contract, role, account) => {
        await contract.grantRole(role, account);
    },

    revokeRole: async (contract, role, account) => {
        await contract.revokeRole(role, account);
    },

    // Permission helpers
    grantPermission: async (accessControl, contract, permission) => {
        await accessControl.grantPermission(contract, permission);
    },

    revokePermission: async (accessControl, contract, permission) => {
        await accessControl.revokePermission(contract, permission);
    },

    // Event helpers
    getEvents: async function(tx, eventName) {
        const receipt = await tx.wait();
        return receipt.events.filter(e => e.event === eventName);
    }
};

module.exports = TestUtils; 