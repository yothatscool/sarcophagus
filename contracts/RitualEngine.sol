// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./interfaces/IRitualEngine.sol";
import "./libraries/VereavementStorage.sol";
import "./libraries/VereavementLib.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title RitualEngine
 * @author yothatscool
 * @notice Handles ritual mechanics for the Vereavement protocol
 * @dev Manages ritual growth, longevity scores, and carbon offsets
 */
contract RitualEngine is IRitualEngine, AccessControl, ReentrancyGuard, Pausable {
    using VereavementStorage for VereavementStorage.Layout;
    using VereavementLib for VereavementStorage.Layout;
    using ECDSA for bytes32;

    // Storage
    VereavementStorage.Layout private _storage;

    // Constants
    uint256 private constant MAX_BATCH_SIZE = 100;
    uint256 private constant MIN_UPDATE_INTERVAL = 1 days;
    uint256 private constant RITUAL_UPDATE_COOLDOWN = 1 hours;
    uint256 private constant LONGEVITY_BASE = 1000;
    uint256 private constant GROWTH_RATE = 10;
    uint256 private constant UPDATE_INTERVAL = 1 days;
    uint256 private constant CARBON_MULTIPLIER = 100;
    uint256 private constant MAX_ACTIONS_PER_DAY = 10;
    uint256 private constant ACTION_COOLDOWN = 1 hours;

    // Custom errors for gas optimization
    error RitualNotActive();

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Batch record carbon offsets for multiple users
     */
    function batchRecordCarbonOffset(
        address[] calldata users,
        uint256[] calldata amounts,
        string[] calldata sources,
        bytes32[] calldata proofHashes
    ) external nonReentrant whenNotPaused {
        uint256 length = users.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        if (amounts.length != length || sources.length != length || proofHashes.length != length) revert ArrayLengthMismatch();

        // Cache the timestamp for gas savings
        uint32 timestamp = uint32(block.timestamp);

        for (uint256 i = 0; i < length;) {
            _recordCarbonOffset(users[i], amounts[i], sources[i], proofHashes[i], timestamp);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Record carbon offset for a user
     */
    function recordCarbonOffset(
        uint256 amount,
        string calldata source,
        bytes32 proofHash
    ) external override nonReentrant whenNotPaused {
        _recordCarbonOffset(msg.sender, amount, source, proofHash, uint32(block.timestamp));
    }

    /**
     * @notice Batch update longevity metrics
     */
    function batchUpdateLongevityMetrics(address[] calldata users) external nonReentrant whenNotPaused {
        uint256 length = users.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();

        // Cache timestamp
        uint32 timestamp = uint32(block.timestamp);
        
        for (uint256 i = 0; i < length;) {
            _updateLongevityMetrics(users[i], timestamp);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Update longevity metrics for caller
     */
    function updateLongevityMetrics() external override nonReentrant whenNotPaused {
        _updateLongevityMetrics(msg.sender, uint32(block.timestamp));
    }

    /**
     * @notice Batch process symbolic growth
     */
    function batchProcessSymbolicGrowth(address[] calldata users) external nonReentrant returns (uint256[] memory values) {
        uint256 length = users.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        
        values = new uint256[](length);
        uint32 timestamp = uint32(block.timestamp);
        
        for (uint256 i = 0; i < length;) {
            values[i] = _processSymbolicGrowth(users[i], timestamp);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Process symbolic growth for caller
     */
    function processSymbolicGrowth() external override nonReentrant whenNotPaused {
        _processSymbolicGrowth(msg.sender, uint32(block.timestamp));
    }

    // Internal functions with gas optimizations
    function _recordCarbonOffset(
        address user,
        uint256 amount,
        string calldata source,
        bytes32 proofHash,
        uint32 timestamp
    ) internal {
        if (amount == 0) revert InvalidAmount();
        if (bytes(source).length == 0) revert InvalidSource();
        if (proofHash == bytes32(0)) revert InvalidProofHash();
        if (user == address(0)) revert InvalidAddress();

        VereavementStorage.RitualState storage state = _storage.ritualStates[user];
        if (!state.isActive) revert RitualNotActive();

        unchecked {
            state.carbonOffset += uint32(amount);
            state.actionCount++;
            state.lastAction = timestamp;
        }
        
        emit CarbonOffsetRecorded(user, amount, source);
    }

    function _updateLongevityMetrics(address user, uint32 timestamp) internal {
        if (user == address(0)) revert InvalidAddress();
        
        VereavementStorage.RitualState storage state = _storage.ritualStates[user];
        if (!state.isActive) revert RitualNotActive();
        if (uint256(timestamp) < uint256(state.lastUpdate) + UPDATE_INTERVAL) revert TooSoonToUpdate();

        uint256 newScore = _calculateLongevityScore(user, timestamp);
        unchecked {
            state.longevityScore = uint32(newScore > type(uint32).max ? type(uint32).max : newScore);
            state.lastUpdate = timestamp;
            state.actionCount++;
            state.lastAction = timestamp;
        }

        emit LongevityScoreUpdated(user, newScore);
    }

    function _processSymbolicGrowth(address user, uint32 timestamp) internal returns (uint256) {
        if (user == address(0)) revert InvalidAddress();

        VereavementStorage.RitualState storage state = _storage.ritualStates[user];
        if (!state.isActive) revert RitualNotActive();

        uint256 newValue = _calculateGrowth(user, timestamp);
        
        unchecked {
            state.totalValue = uint224(newValue);
            state.actionCount++;
            state.lastAction = timestamp;
        }

        emit SymbolicGrowthOccurred(user, newValue);
        return newValue;
    }

    function _calculateLongevityScore(address user, uint32 timestamp) internal view returns (uint256 score) {
        VereavementStorage.RitualState storage state = _storage.ritualStates[user];
        
        unchecked {
            uint256 baseScore = state.longevityScore;
            uint256 carbonScore = uint256(state.carbonOffset) / LONGEVITY_BASE;
            uint256 timeScore = _calculateTimeScore(state, timestamp);
            score = baseScore + carbonScore + timeScore;
        }
    }

    function _calculateTimeScore(VereavementStorage.RitualState storage state, uint32 timestamp) internal view returns (uint256) {
        if (state.lastUpdate == 0) return 0;
        
        unchecked {
            return (uint256(timestamp) - uint256(state.lastUpdate)) / 1 days;
        }
    }

    function _calculateGrowth(address user, uint32 timestamp) internal view returns (uint256) {
        VereavementStorage.RitualState storage state = _storage.ritualStates[user];
        uint256 score = _calculateLongevityScore(user, timestamp);
        
        unchecked {
            uint256 carbonBonus = uint256(state.carbonOffset) / CARBON_MULTIPLIER;
            return score * (GROWTH_RATE + carbonBonus) / 100;
        }
    }

    // View functions
    function getLongevityScore(address user) external view override returns (uint256) {
        return _storage.ritualStates[user].longevityScore;
    }

    function getTotalCarbonOffset(address user) external view override returns (uint256) {
        return _storage.ritualStates[user].carbonOffset;
    }

    function getRitualValue(address user) external view override returns (uint256) {
        return _storage.ritualStates[user].totalValue;
    }

    function calculateLongevityScore(address user) external view override returns (uint256) {
        if (user == address(0)) revert InvalidAddress();
        return _calculateLongevityScore(user, uint32(block.timestamp));
    }

    function batchGetRitualStates(
        address[] calldata users
    ) external view returns (
        uint256[] memory scores,
        uint256[] memory offsets,
        uint256[] memory values
    ) {
        uint256 length = users.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();

        scores = new uint256[](length);
        offsets = new uint256[](length);
        values = new uint256[](length);

        for (uint256 i = 0; i < length;) {
            VereavementStorage.RitualState storage state = _storage.ritualStates[users[i]];
            scores[i] = state.longevityScore;
            offsets[i] = state.carbonOffset;
            values[i] = state.totalValue;
            unchecked { ++i; }
        }
    }
} 