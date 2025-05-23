// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IMilestoneManager.sol";
import "./libraries/VereavementShared.sol";
import "./libraries/VereavementStorage.sol";

/**
 * @title MilestoneManager
 * @author yothatscool
 * @notice Handles milestone management for the Vereavement protocol
 * @dev Manages milestone creation, achievement, and verification
 */
contract MilestoneManager is IMilestoneManager, AccessControl, ReentrancyGuard {
    using VereavementShared for *;
    using VereavementStorage for VereavementStorage.Layout;

    // Storage
    VereavementStorage.Layout private _storage;

    // Custom errors for gas optimization
    error InvalidMilestoneIndex(uint256 index);
    error MilestoneAlreadyAchieved(uint256 index);
    error InvalidOracleKey(bytes32 key);
    error UserNotDeceased(address user);
    error InvalidDescription();
    error InvalidAmount(uint256 amount);
    error ArrayLengthMismatch();
    error BatchSizeTooLarge();
    error RateLimitExceeded();
    error InvalidSignature();

    // Constants
    uint256 private constant MAX_BATCH_SIZE = 50;
    uint256 private constant MAX_MILESTONES_PER_USER = 100;
    uint256 private constant MIN_UPDATE_INTERVAL = 1 hours;
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Batch add multiple milestones
     */
    function batchAddMilestones(
        uint96[] calldata amounts,
        string[] calldata descriptions,
        bytes32[] calldata oracleKeys
    ) external nonReentrant {
        uint256 length = amounts.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        if (length != descriptions.length || length != oracleKeys.length) 
            revert ArrayLengthMismatch();

        UserMilestones storage user = userMilestones[msg.sender];
        if (user.milestoneCount + length > MAX_MILESTONES_PER_USER)
            revert BatchSizeTooLarge();

        uint32 timestamp = uint32(block.timestamp);
        _checkRateLimit(user, timestamp);

        for (uint256 i = 0; i < length;) {
            _addMilestone(msg.sender, amounts[i], descriptions[i], oracleKeys[i], timestamp);
            unchecked { ++i; }
        }

        user.lastUpdate = timestamp;
        unchecked {
            user.totalActions++;
        }
    }

    /**
     * @notice Add a single milestone
     */
    function addMilestone(
        address user,
        address beneficiary,
        string calldata description,
        uint256 reward,
        uint256 deadline
    ) external nonReentrant {
        require(user != address(0) && beneficiary != address(0), "Invalid address");
        require(bytes(description).length > 0, "Empty description");
        require(reward > 0, "Invalid reward");
        require(deadline > block.timestamp, "Invalid deadline");

        VereavementStorage.Vault storage vault = _storage.vaults[user];
        require(vault.beneficiaries.length > 0, "No beneficiaries");

        bool found = false;
        for (uint256 i = 0; i < vault.beneficiaries.length;) {
            if (vault.beneficiaries[i].recipient == beneficiary) {
                vault.beneficiaries[i].milestones.push(VereavementStorage.MilestoneCondition({
                    amount: uint128(reward),
                    achievementDate: 0,
                    description: description,
                    oracleKey: bytes32(0),
                    isAchieved: false
                }));
                found = true;
                break;
            }
            unchecked { ++i; }
        }

        require(found, "Beneficiary not found");
        emit MilestoneAdded(user, beneficiary, description, reward, deadline);
    }

    /**
     * @notice Batch achieve milestones
     */
    function batchAchieveMilestones(
        address user,
        uint256[] calldata indices,
        bytes32[] calldata oracleKeys,
        bytes[] calldata proofs,
        bytes[] calldata signatures
    ) external nonReentrant onlyRole(ORACLE_ROLE) {
        uint256 length = indices.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        if (length != oracleKeys.length || length != proofs.length || length != signatures.length)
            revert ArrayLengthMismatch();

        UserMilestones storage userState = userMilestones[user];
        if (!userState.isDeceased) revert UserNotDeceased(user);

        uint32 timestamp = uint32(block.timestamp);
        bool[] memory achievements = new bool[](length);

        for (uint256 i = 0; i < length;) {
            if (_achieveMilestone(user, indices[i], oracleKeys[i], proofs[i], signatures[i], timestamp)) {
                achievements[i] = true;
            }
            unchecked { ++i; }
        }

        emit MilestoneBatchUpdated(user, indices, achievements, timestamp);
    }

    /**
     * @notice Achieve a single milestone
     */
    function achieveMilestone(
        address user,
        address beneficiary,
        uint256 milestoneIndex
    ) external nonReentrant onlyRole(ORACLE_ROLE) {
        require(user != address(0) && beneficiary != address(0), "Invalid address");
        
        VereavementStorage.Vault storage vault = _storage.vaults[user];
        require(vault.beneficiaries.length > 0, "No beneficiaries");

        bool found = false;
        for (uint256 i = 0; i < vault.beneficiaries.length;) {
            if (vault.beneficiaries[i].recipient == beneficiary) {
                require(milestoneIndex < vault.beneficiaries[i].milestones.length, "Invalid milestone index");
                require(!vault.beneficiaries[i].milestones[milestoneIndex].isAchieved, "Already achieved");

                vault.beneficiaries[i].milestones[milestoneIndex].isAchieved = true;
                vault.beneficiaries[i].milestones[milestoneIndex].achievementDate = uint32(block.timestamp);
                found = true;
                break;
            }
            unchecked { ++i; }
        }

        require(found, "Beneficiary not found");
        emit MilestoneAchieved(user, beneficiary, milestoneIndex, block.timestamp);
    }

    /**
     * @notice Batch get milestone details
     */
    function batchGetMilestoneDetails(
        address user,
        uint256[] calldata indices
    ) external view returns (
        uint256[] memory amounts,
        uint256[] memory dates,
        string[] memory descriptions,
        bool[] memory achievements
    ) {
        uint256 length = indices.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();

        amounts = new uint256[](length);
        dates = new uint256[](length);
        descriptions = new string[](length);
        achievements = new bool[](length);

        UserMilestones storage userState = userMilestones[user];
        
        for (uint256 i = 0; i < length;) {
            if (indices[i] >= userState.milestoneCount) revert InvalidMilestoneIndex(indices[i]);
            
            Milestone storage milestone = userState.milestones[indices[i]];
            amounts[i] = milestone.amount;
            dates[i] = milestone.achievementDate;
            descriptions[i] = milestone.description;
            achievements[i] = milestone.isAchieved;
            
            unchecked { ++i; }
        }
    }

    /**
     * @notice Get all milestones for a user
     */
    function getMilestones(
        address user,
        address beneficiary
    ) external view returns (
        string[] memory descriptions,
        uint256[] memory rewards,
        uint256[] memory deadlines,
        bool[] memory completionStatus,
        uint256[] memory completionTimes
    ) {
        VereavementStorage.Vault storage vault = _storage.vaults[user];
        require(vault.beneficiaries.length > 0, "No beneficiaries");

        uint256 milestoneCount = 0;
        for (uint256 i = 0; i < vault.beneficiaries.length;) {
            if (vault.beneficiaries[i].recipient == beneficiary) {
                milestoneCount = vault.beneficiaries[i].milestones.length;
                break;
            }
            unchecked { ++i; }
        }

        descriptions = new string[](milestoneCount);
        rewards = new uint256[](milestoneCount);
        deadlines = new uint256[](milestoneCount);
        completionStatus = new bool[](milestoneCount);
        completionTimes = new uint256[](milestoneCount);

        for (uint256 i = 0; i < vault.beneficiaries.length;) {
            if (vault.beneficiaries[i].recipient == beneficiary) {
                for (uint256 j = 0; j < milestoneCount;) {
                    VereavementStorage.MilestoneCondition storage milestone = vault.beneficiaries[i].milestones[j];
                    descriptions[j] = milestone.description;
                    rewards[j] = milestone.amount;
                    deadlines[j] = 0; // Not used in MilestoneCondition
                    completionStatus[j] = milestone.isAchieved;
                    completionTimes[j] = milestone.achievementDate;
                    unchecked { ++j; }
                }
                break;
            }
            unchecked { ++i; }
        }
    }

    /**
     * @notice Get milestone details
     */
    function getMilestoneDetails(
        address user,
        address beneficiary,
        uint256 milestoneIndex
    ) external view returns (
        string memory description,
        uint256 reward,
        uint256 deadline,
        bool isCompleted,
        uint256 completionTime
    ) {
        require(user != address(0) && beneficiary != address(0), "Invalid address");
        
        VereavementStorage.Vault storage vault = _storage.vaults[user];
        require(vault.beneficiaries.length > 0, "No beneficiaries");

        bool found = false;
        for (uint256 i = 0; i < vault.beneficiaries.length;) {
            if (vault.beneficiaries[i].recipient == beneficiary) {
                require(milestoneIndex < vault.beneficiaries[i].milestones.length, "Invalid milestone index");
                VereavementStorage.MilestoneCondition storage milestone = vault.beneficiaries[i].milestones[milestoneIndex];
                return (
                    milestone.description,
                    milestone.amount,
                    0, // Not used in MilestoneCondition
                    milestone.isAchieved,
                    milestone.achievementDate
                );
            }
            unchecked { ++i; }
        }

        revert("Beneficiary not found");
    }

    function getMilestoneCount(address user) external view returns (uint256) {
        return userMilestones[user].milestoneCount;
    }

    function isUserDeceased(address user) external view returns (bool) {
        return userMilestones[user].isDeceased;
    }

    function setUserDeceased(address user, bool deceased) external onlyRole(DEFAULT_ADMIN_ROLE) {
        userMilestones[user].isDeceased = deceased;
    }

    // Internal functions
    function _addMilestone(
        address user,
        uint96 amount,
        string calldata description,
        bytes32 oracleKey,
        uint32 timestamp
    ) internal {
        UserMilestones storage userState = userMilestones[msg.sender];
        uint256 index = userState.milestoneCount;
        
        Milestone storage milestone = userState.milestones[index];
        milestone.amount = amount;
        milestone.achievementDate = timestamp;
        milestone.lastUpdate = timestamp;
        milestone.description = description;
        milestone.oracleKey = oracleKey;
        milestone.isAchieved = false;

        unchecked {
            userState.milestoneCount++;
            milestone.actionCount = 1;
        }

        emit MilestoneCreated(user, index, amount, oracleKey, timestamp);
    }

    function _achieveMilestone(
        address user,
        uint256 milestoneIndex,
        bytes32 oracleKey,
        bytes calldata proof,
        bytes calldata signature,
        uint32 timestamp
    ) internal returns (bool) {
        UserMilestones storage userState = userMilestones[user];
        if (milestoneIndex >= userState.milestoneCount) revert InvalidMilestoneIndex(milestoneIndex);
        
        Milestone storage milestone = userState.milestones[milestoneIndex];
        if (milestone.isAchieved) revert MilestoneAlreadyAchieved(milestoneIndex);
        if (milestone.oracleKey != oracleKey) revert InvalidOracleKey(oracleKey);
        
        if (!verifyOracleSignature(oracleKey, proof, signature)) revert InvalidSignature();
        
        milestone.isAchieved = true;
        milestone.achievementDate = timestamp;
        milestone.lastUpdate = timestamp;
        unchecked {
            milestone.actionCount++;
        }

        emit MilestoneAchieved(user, milestoneIndex, milestone.amount, timestamp);
        return true;
    }

    function _checkRateLimit(UserMilestones storage user, uint32 timestamp) internal view {
        if (timestamp - user.lastUpdate < MIN_UPDATE_INTERVAL)
            revert RateLimitExceeded();
    }

    function verifyOracleSignature(
        bytes32 oracleKey,
        bytes calldata proof,
        bytes calldata signature
    ) internal pure returns (bool) {
        // Implement signature verification logic
        return true; // Placeholder
    }
} 