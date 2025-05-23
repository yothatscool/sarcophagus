// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IRitualEngine
 * @dev Interface for the ritual engine components of Vereavement
 */
interface IRitualEngine {
    // Custom errors
    error InvalidAmount();
    error InvalidSource();
    error InvalidProofHash();
    error InvalidAddress();
    error TooSoonToUpdate();
    error TooSoonToClaim();
    error NoAllocationAvailable();
    error RateLimitExceeded();
    error ArrayLengthMismatch();
    error BatchSizeTooLarge();

    // Structs with optimized packing - 2 slots total
    struct RitualState {
        // Slot 0
        uint96 longevityScore;    // Reduced from 128 to 96 bits
        uint96 carbonOffset;      // Reduced from 128 to 96 bits
        uint32 lastUpdate;        // Reduced to 32 bits
        uint32 lastAction;        // Reduced to 32 bits
        // Slot 1
        uint32 actionCount;       // Reduced to 32 bits
        uint224 ritualValue;      // Reduced from 256 to 224 bits
    }

    // Events
    event CarbonOffsetRecorded(address indexed user, uint256 amount, string source);
    event LongevityScoreUpdated(address indexed user, uint256 newScore);
    event SymbolicGrowthOccurred(address indexed user, uint256 newValue);

    // Batch functions
    function batchRecordCarbonOffset(
        address[] calldata users,
        uint256[] calldata amounts,
        string[] calldata sources,
        bytes32[] calldata proofHashes
    ) external;

    function batchUpdateLongevityMetrics(address[] calldata users) external;

    function batchProcessSymbolicGrowth(address[] calldata users) external returns (uint256[] memory values);

    function batchGetRitualStates(address[] calldata users) external view returns (
        uint256[] memory scores,
        uint256[] memory offsets,
        uint256[] memory values
    );

    // Core functions
    function recordCarbonOffset(uint256 amount, string calldata source, bytes32 proofHash) external;
    function updateLongevityMetrics() external;
    function processSymbolicGrowth() external;
    function getRitualValue(address user) external view returns (uint256);
    function getLongevityScore(address user) external view returns (uint256);
    function getTotalCarbonOffset(address user) external view returns (uint256);
    function calculateLongevityScore(address user) external view returns (uint256);
} 