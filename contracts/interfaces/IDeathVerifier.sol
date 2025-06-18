// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IDeathVerifier
 * @author yothatscool
 * @notice Interface for death verification and bonus calculation
 */
interface IDeathVerifier {
    /**
     * @notice Calculate bonus based on age vs life expectancy
     * @param actualAge Age at death
     * @param lifeExpectancy Expected life expectancy
     * @return bonus Amount of B3TR bonus (in wei)
     */
    function calculateBonus(
        uint256 actualAge,
        uint256 lifeExpectancy
    ) external pure returns (uint256 bonus);
} 