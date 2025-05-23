// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IVTHOManager.sol";

contract MockVTHOManager is IVTHOManager {
    uint256 public constant VTHO_GENERATION_RATE = 5; // 5 VTHO per VET per day

    function distributeVTHO(
        address user,
        uint256 vetAmount,
        uint256 timePeriod
    ) external override returns (uint256) {
        // Mock implementation - simplified VTHO generation
        uint256 vthoGenerated = (vetAmount * VTHO_GENERATION_RATE * timePeriod) / (1 days);
        return vthoGenerated;
    }

    function getVTHOBalance(address user) external view override returns (uint256) {
        // Mock implementation - always return 0
        return 0;
    }

    function claimVTHO() external override returns (uint256) {
        // Mock implementation - always return 0
        return 0;
    }
} 