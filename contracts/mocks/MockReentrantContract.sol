// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IRitualEngine.sol";

/**
 * @title MockReentrantContract
 * @dev Mock contract to test reentrancy protection
 */
contract MockReentrantContract {
    IRitualEngine public ritualEngine;
    bool public hasAttemptedReentrancy;

    constructor(address _ritualEngine) {
        ritualEngine = IRitualEngine(_ritualEngine);
    }

    // Function that attempts to perform a reentrant call
    function attemptReentrantCall() external {
        hasAttemptedReentrancy = true;
        // First call to processSymbolicGrowth
        ritualEngine.processSymbolicGrowth();
    }

    // Fallback function that tries to make a reentrant call
    receive() external payable {
        if (hasAttemptedReentrancy) {
            // Second call to processSymbolicGrowth during the first call
            ritualEngine.processSymbolicGrowth();
        }
    }

    // Allow the contract to receive VTHO and other tokens
    fallback() external payable {}
} 