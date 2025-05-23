// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IVTHOManager.sol";

contract VTHOManager is IVTHOManager {
    uint256 public constant VTHO_GENERATION_RATE = 5; // 5 VTHO per VET per day
    mapping(address => uint256) private vthoBalances;
    mapping(address => uint256) private lastClaimTime;

    function distributeVTHO(
        address user,
        uint256 vetAmount,
        uint256 timePeriod
    ) external override returns (uint256) {
        uint256 vthoGenerated = (vetAmount * VTHO_GENERATION_RATE * timePeriod) / (1 days);
        vthoBalances[user] += vthoGenerated;
        return vthoGenerated;
    }

    function getVTHOBalance(address user) external view override returns (uint256) {
        return vthoBalances[user];
    }

    function claimVTHO() external override returns (uint256) {
        uint256 amount = vthoBalances[msg.sender];
        vthoBalances[msg.sender] = 0;
        return amount;
    }
} 