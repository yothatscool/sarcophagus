// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IDeathVerifier.sol";

contract MockDeathVerifier is IDeathVerifier {
    event DeathVerified(address indexed user, uint256 age, string proofHash);

    function verifyDeath(address user, uint256 age, string calldata proofHash) external {
        emit DeathVerified(user, age, proofHash);
    }

    function calculateBonus(
        uint256 actualAge,
        uint256 lifeExpectancy,
        uint256 totalDeposits,
        uint256 yearsInSystem
    ) external pure override returns (uint256 bonus) {
        // Return a fixed bonus for testing
        return 1000;
    }

    function getUserVerification(address user) external pure override returns (
        bool isVerified,
        uint256 age,
        uint256 lifeExpectancy
    ) {
        // Always return verified, age 50, life expectancy 80 for testing
        return (true, 50, 80);
    }
} 