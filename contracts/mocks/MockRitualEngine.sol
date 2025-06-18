// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IRitualEngine.sol";

contract MockRitualEngine is IRitualEngine {
    mapping(address => uint256) private _ritualValues;
    mapping(address => uint256) private _carbonOffsets;
    mapping(address => uint256) private _longevityScores;
    mapping(address => uint256) private _lastUpdates;

    function setRitualValue(address user, uint256 value) external {
        _ritualValues[user] = value;
    }

    function incrementRitualValue(address user, uint256 amount) external {
        _ritualValues[user] += amount;
    }

    function processSymbolicGrowth(address user) external returns (uint256) {
        uint256 growth = _ritualValues[user] / 10;
        _ritualValues[user] += growth;
        return growth;
    }

    function batchProcessSymbolicGrowth(
        address[] calldata users
    ) external returns (uint256[] memory values) {
        values = new uint256[](users.length);
        for (uint256 i = 0; i < users.length; i++) {
            values[i] = this.processSymbolicGrowth(users[i]);
        }
    }

    function updateLongevityMetrics(address user) external {
        _lastUpdates[user] = block.timestamp;
        _longevityScores[user]++;
    }

    function batchUpdateLongevityMetrics(address[] calldata users) external {
        for (uint256 i = 0; i < users.length; i++) {
            this.updateLongevityMetrics(users[i]);
        }
    }

    function calculateLongevityScore(address user) external view returns (uint256) {
        return _longevityScores[user];
    }

    function getRitualValue(address user) external view returns (uint256) {
        return _ritualValues[user];
    }

    function setCarbonOffset(address user, uint256 amount) external {
        _carbonOffsets[user] = amount;
    }

    function getTotalCarbonOffset(address user) external view returns (uint256) {
        return _carbonOffsets[user];
    }

    function getLongevityScore(address user) external view returns (uint256) {
        return _longevityScores[user];
    }

    function recordCarbonOffset(uint256 amount, string calldata source, bytes32 proofHash) external {
        _carbonOffsets[msg.sender] += amount;
    }

    function batchRecordCarbonOffset(
        address[] calldata users,
        uint256[] calldata amounts,
        string[] calldata sources,
        bytes32[] calldata proofHashes
    ) external {
        require(users.length == amounts.length && amounts.length == sources.length && sources.length == proofHashes.length, "Length mismatch");
        for (uint256 i = 0; i < users.length; i++) {
            _carbonOffsets[users[i]] += amounts[i];
            emit CarbonOffsetRecorded(users[i], amounts[i], sources[i]);
        }
    }

    function batchGetRitualStates(
        address[] calldata users
    ) external view returns (
        uint256[] memory scores,
        uint256[] memory offsets,
        uint256[] memory values
    ) {
        scores = new uint256[](users.length);
        offsets = new uint256[](users.length);
        values = new uint256[](users.length);

        for (uint256 i = 0; i < users.length; i++) {
            scores[i] = this.getLongevityScore(users[i]);
            offsets[i] = this.getTotalCarbonOffset(users[i]);
            values[i] = _ritualValues[users[i]];
        }
    }

    function claimWeeklyAllocation() external {
        // Mock implementation - does nothing
    }

    function processSymbolicGrowth() external {
        uint256 growth = _ritualValues[msg.sender] / 10;
        _ritualValues[msg.sender] += growth;
        emit SymbolicGrowthOccurred(msg.sender, growth);
    }

    function updateLongevityMetrics() external {
        _lastUpdates[msg.sender] = block.timestamp;
        _longevityScores[msg.sender]++;
        emit LongevityScoreUpdated(msg.sender, _longevityScores[msg.sender]);
    }
} 