// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockVTHOManager {
    uint256 public constant VTHO_GENERATION_RATE = 5000000000; // 5 VTHO per VET per day

    function distributeVTHO(
        address user,
        uint256 totalVET,
        uint256 timePeriod
    ) external returns (uint256) {
        uint256 vthoGenerated = (totalVET * VTHO_GENERATION_RATE * timePeriod) / (1 days);
        return vthoGenerated;
    }
} 