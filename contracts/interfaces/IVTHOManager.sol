// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IVTHOManager
 * @notice Interface for VTHO token management and distribution
 */
interface IVTHOManager {
    /**
     * @notice Distribute VTHO tokens to a user based on their VET holdings
     * @param user Address of the user
     * @param vetAmount Amount of VET held
     * @param timePeriod Time period in seconds
     * @return vthoGenerated Amount of VTHO generated
     */
    function distributeVTHO(
        address user,
        uint256 vetAmount,
        uint256 timePeriod
    ) external returns (uint256 vthoGenerated);

    /**
     * @notice Get VTHO balance for a user
     * @param user Address of the user
     * @return balance VTHO balance
     */
    function getVTHOBalance(address user) external view returns (uint256 balance);

    /**
     * @notice Claim VTHO tokens
     * @return claimed Amount of VTHO claimed
     */
    function claimVTHO() external returns (uint256 claimed);
} 