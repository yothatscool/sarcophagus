// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IDeathVerifier
 * @author yothatscool
 * @notice Interface for death verification and bonus calculation
 */
interface IDeathVerifier {
    /**
     * @notice Calculate bonus based on age vs life expectancy and participation
     * @param actualAge Age at death
     * @param lifeExpectancy Expected life expectancy
     * @param totalDeposits Total VET equivalent deposited over lifetime
     * @param yearsInSystem Years since sarcophagus creation
     * @return bonus Amount of B3TR bonus (in wei)
     */
    function calculateBonus(
        uint256 actualAge,
        uint256 lifeExpectancy,
        uint256 totalDeposits,
        uint256 yearsInSystem
    ) external pure returns (uint256 bonus);

    function getUserVerification(address user) external view returns (
        bool isVerified,
        uint256 age,
        uint256 lifeExpectancy
    );
} 