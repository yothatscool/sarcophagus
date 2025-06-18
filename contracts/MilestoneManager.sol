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

    // Struct definitions
    struct UserMilestones {
        uint256 milestoneCount;
        uint32 lastUpdate;
        uint32 totalActions;
        bool isDeceased;
        mapping(uint256 => Milestone) milestones;
    }

    struct Milestone {
        uint96 amount;
        uint32 achievementDate;
        uint32 lastUpdate;
        uint32 actionCount;
        string description;
        bytes32 oracleKey;
        bool isAchieved;
    }

    // Storage
    mapping(address => UserMilestones) public userMilestones;
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
        uint256 beneficiaryIndex,
        uint128 amount,
        string calldata description,
        bytes32 oracleKey
    ) external {
        require(amount > 0, "Invalid amount");
        require(bytes(description).length > 0, "Empty description");
        require(oracleKey != bytes32(0), "Invalid oracle key");

        VereavementStorage.Vault storage vault = _storage.vaults[msg.sender];
        require(beneficiaryIndex < vault.beneficiaries.length, "Invalid beneficiary index");

        VereavementStorage.Beneficiary storage beneficiary = vault.beneficiaries[beneficiaryIndex];
        uint256 milestoneIndex = beneficiary.milestoneCount;
        beneficiary.milestones[milestoneIndex] = VereavementStorage.MilestoneCondition({
            amount: amount,
            achievementDate: 0,
            description: description,
            oracleKey: oracleKey,
            isAchieved: false
        });
        beneficiary.milestoneCount++;

        emit MilestoneAdded(msg.sender, beneficiary.recipient, description);
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
        if (indices.length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        if (indices.length != oracleKeys.length || indices.length != proofs.length || indices.length != signatures.length)
            revert ArrayLengthMismatch();

        UserMilestones storage userState = userMilestones[user];
        if (!userState.isDeceased) revert UserNotDeceased(user);

        uint32 timestamp = uint32(block.timestamp);

        for (uint256 i = 0; i < indices.length;) {
            if (_achieveMilestone(user, indices[i], oracleKeys[i], proofs[i], signatures[i], timestamp)) {
                Milestone storage milestone = userState.milestones[indices[i]];
                emit MilestoneAchieved(user, address(0), indices[i], milestone.amount);
            }
            unchecked { ++i; }
        }
    }

    /**
     * @notice Achieve a single milestone
     */
    function achieveMilestone(
        address user,
        uint256 beneficiaryIndex,
        uint256 milestoneIndex,
        bytes32 oracleKey,
        bytes calldata proof,
        bytes calldata signature
    ) external {
        require(user != address(0), "Invalid address");
        require(beneficiaryIndex < _storage.vaults[user].beneficiaries.length, "Invalid beneficiary index");
        
        VereavementStorage.Vault storage vault = _storage.vaults[user];
        VereavementStorage.Beneficiary storage beneficiary = vault.beneficiaries[beneficiaryIndex];
        require(milestoneIndex < beneficiary.milestoneCount, "Invalid milestone index");
        
        VereavementStorage.MilestoneCondition storage milestone = beneficiary.milestones[milestoneIndex];
        require(!milestone.isAchieved, "Already achieved");
        require(milestone.oracleKey == oracleKey, "Invalid oracle key");
        require(verifyOracleSignature(oracleKey, proof, signature), "Invalid signature");

        milestone.isAchieved = true;
        milestone.achievementDate = uint32(block.timestamp);

        emit MilestoneAchieved(user, beneficiary.recipient, milestoneIndex, milestone.amount);
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
        uint256[] memory amounts,
        bool[] memory achievements,
        uint256[] memory dates
    ) {
        VereavementStorage.Vault storage vault = _storage.vaults[user];
        require(vault.beneficiaries.length > 0, "No beneficiaries");

        uint256 milestoneCount = 0;
        uint256 beneficiaryIndex = type(uint256).max;
        for (uint256 i = 0; i < vault.beneficiaries.length;) {
            if (vault.beneficiaries[i].recipient == beneficiary) {
                milestoneCount = vault.beneficiaries[i].milestoneCount;
                beneficiaryIndex = i;
                break;
            }
            unchecked { ++i; }
        }
        require(beneficiaryIndex != type(uint256).max, "Beneficiary not found");

        descriptions = new string[](milestoneCount);
        amounts = new uint256[](milestoneCount);
        achievements = new bool[](milestoneCount);
        dates = new uint256[](milestoneCount);

        VereavementStorage.Beneficiary storage beneficiaryData = vault.beneficiaries[beneficiaryIndex];
        for (uint256 i = 0; i < milestoneCount;) {
            VereavementStorage.MilestoneCondition storage milestone = beneficiaryData.milestones[i];
            descriptions[i] = milestone.description;
            amounts[i] = milestone.amount;
            achievements[i] = milestone.isAchieved;
            dates[i] = milestone.achievementDate;
            unchecked { ++i; }
        }
    }

    /**
     * @notice Get milestone details
     */
    function getMilestoneDetails(
        address user,
        uint256 beneficiaryIndex,
        uint256 milestoneIndex
    ) external view returns (
        uint256 amount,
        uint256 achievementDate,
        string memory description,
        bool isAchieved
    ) {
        require(user != address(0), "Invalid address");
        require(beneficiaryIndex < _storage.vaults[user].beneficiaries.length, "Invalid beneficiary index");
        
        VereavementStorage.Vault storage vault = _storage.vaults[user];
        VereavementStorage.Beneficiary storage beneficiary = vault.beneficiaries[beneficiaryIndex];
        require(milestoneIndex < beneficiary.milestoneCount, "Invalid milestone index");
        
        VereavementStorage.MilestoneCondition storage milestone = beneficiary.milestones[milestoneIndex];
        return (
            milestone.amount,
            milestone.achievementDate,
            milestone.description,
            milestone.isAchieved
        );
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

        emit MilestoneAdded(user, address(0), description);
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

        emit MilestoneAchieved(user, address(0), milestoneIndex, milestone.amount);
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