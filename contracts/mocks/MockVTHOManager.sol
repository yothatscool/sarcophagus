// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IVTHOManager.sol";

contract MockVTHOManager is IVTHOManager {
    uint256 public constant VTHO_GENERATION_RATE = 5; // 5 VTHO per VET per day

    function distributeVTHO(
        address _user,
        uint256 vetAmount,
        uint256 timePeriod
    ) external pure override returns (uint256) {
        // Mock implementation - simplified VTHO generation
        uint256 vthoGenerated = (vetAmount * VTHO_GENERATION_RATE * timePeriod) / (1 days);
        return vthoGenerated;
    }

    function getVTHOBalance(address _user) external pure override returns (uint256) {
        // Mock implementation - always return 0
        return 0;
    }

    function claimVTHO() external pure override returns (uint256) {
        // Mock implementation - always return 0
        return 0;
    }
} 