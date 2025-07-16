const { ethers } = require("hardhat");
const realEthers = require("ethers"); // Always import the actual ethers library

// For v5
const v5utils = realEthers.utils || {};
const keccak256 = v5utils.keccak256 || realEthers.keccak256;
const toUtf8Bytes = v5utils.toUtf8Bytes || realEthers.toUtf8Bytes;

let AddressZero, MaxUint256;
try {
  ({ AddressZero, MaxUint256 } = realEthers.constants);
} catch (e) {
  AddressZero = realEthers.ZeroAddress;
  MaxUint256 = realEthers.MaxUint256;
}

/**
 * Helper functions for test files
 */
const TestUtils = {
    // Constants
    ZERO_ADDRESS: AddressZero,
    MAX_UINT256: MaxUint256,

    // Role constants
    ROLES: {
        ORACLE_ROLE: keccak256(toUtf8Bytes("ORACLE_ROLE")),
        MEDIATOR_ROLE: keccak256(toUtf8Bytes("MEDIATOR_ROLE")),
        STORAGE_WRITE: keccak256(toUtf8Bytes("STORAGE_WRITE")),
        STORAGE_READ: keccak256(toUtf8Bytes("STORAGE_READ"))
    },

    // Helper functions
    generateProofHash: (proofString) => keccak256(toUtf8Bytes(proofString)),
    generateOracleKey: (keyString) => keccak256(toUtf8Bytes(keyString)),

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