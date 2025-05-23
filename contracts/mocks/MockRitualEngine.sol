// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IRitualEngine.sol";

contract MockRitualEngine is IRitualEngine {
    mapping(address => uint256) private ritualValues;
    mapping(address => uint256) private carbonOffsets;
    mapping(address => uint256) private longevityScores;
    mapping(address => uint256) private lastUpdates;

    function setRitualValue(address user, uint256 value) external {
        ritualValues[user] = value;
    }

    function incrementRitualValue(address user, uint256 amount) external {
        ritualValues[user] += amount;
    }

    function processSymbolicGrowth(address user) external returns (uint256) {
        uint256 growth = ritualValues[user] / 10;
        ritualValues[user] += growth;
        return growth;
    }

    function batchProcessSymbolicGrowth(
        address[] calldata users
    ) external returns (uint256[] memory values) {
        values = new uint256[](users.length);
        for (uint256 i = 0; i < users.length; i++) {
            values[i] = processSymbolicGrowth(users[i]);
        }
    }

    function updateLongevityMetrics(address user) external {
        lastUpdates[user] = block.timestamp;
        longevityScores[user]++;
    }

    function batchUpdateLongevityMetrics(address[] calldata users) external {
        for (uint256 i = 0; i < users.length; i++) {
            updateLongevityMetrics(users[i]);
        }
    }

    function calculateLongevityScore(address user) external view returns (uint256) {
        return longevityScores[user];
    }

    function getRitualValue(address user) external view returns (uint256) {
        return ritualValues[user];
    }

    function setCarbonOffset(address user, uint256 amount) external {
        carbonOffsets[user] = amount;
    }

    function getTotalCarbonOffset(address user) external view returns (uint256) {
        return carbonOffsets[user];
    }

    function getLongevityScore(address user) external view returns (uint256) {
        return longevityScores[user];
    }

    function recordCarbonOffset(uint256 amount, string calldata source, bytes32 proofHash) external {
        carbonOffsets[msg.sender] += amount;
    }

    function batchRecordCarbonOffset(
        address[] calldata users,
        uint256[] calldata amounts,
        string[] calldata sources
    ) external {
        require(users.length == amounts.length && amounts.length == sources.length, "Length mismatch");
        for (uint256 i = 0; i < users.length; i++) {
            emit CarbonOffsetRecorded(users[i], amounts[i], sources[i]);
        }
    }

    function batchGetRitualStates(
        address[] calldata users
    ) external view returns (
        uint256[] memory values,
        uint256[] memory lastUpdateTimes,
        bool[] memory isActive
    ) {
        values = new uint256[](users.length);
        lastUpdateTimes = new uint256[](users.length);
        isActive = new bool[](users.length);

        for (uint256 i = 0; i < users.length; i++) {
            values[i] = ritualValues[users[i]];
            lastUpdateTimes[i] = lastUpdates[users[i]];
            isActive[i] = true;
        }
    }

    function claimWeeklyAllocation() external {
        // Mock implementation - does nothing
    }
} 