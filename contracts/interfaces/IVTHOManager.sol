// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVTHOManager {
    function distributeVTHO(
        address user,
        uint256 totalVET,
        uint256 timePeriod
    ) external returns (uint256);

    function getVTHOBalance(address user) external view returns (uint256);
    
    function claimVTHO() external returns (uint256);
} 