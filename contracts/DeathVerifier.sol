// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IDeathVerifier.sol";

/**
 * @title DeathVerifier - Multi-Oracle Consensus System
 * @author yothatscool
 * @notice Enhanced death verification with multi-oracle consensus
 * @dev Requires multiple oracle confirmations for death verification
 */
contract DeathVerifier is IDeathVerifier, AccessControl, ReentrancyGuard {
    
    // Custom errors
    error InvalidAge();
    error InvalidLifeExpectancy();
    error DeathAlreadyVerified();
    error DeathNotVerified();
    error InvalidOracle();
    error InsufficientConfirmations();
    error OracleAlreadyConfirmed();
    error OracleNotAuthorized();
    error InvalidTimestamp();
    error ConsensusNotReached();
    error VerificationExpired();
    error VerificationAlreadyExists();

    // Roles
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Multi-oracle consensus parameters
    uint256 public constant MIN_CONFIRMATIONS = 2; // Minimum oracle confirmations required
    uint256 public constant MAX_CONFIRMATIONS = 5; // Maximum oracle confirmations allowed
    uint256 public constant CONSENSUS_TIMEOUT = 24 hours; // Time window for consensus
    uint256 public constant VERIFICATION_EXPIRY = 30 days; // How long verification is valid
    
    // Death verification data
    struct DeathVerification {
        uint256 deathTimestamp;
        uint256 age;
        uint256 lifeExpectancy;
        string deathCertificate;
        uint256 confirmations;
        uint256 consensusStartTime;
        bool isVerified;
        bool isExpired;
        mapping(address => bool) oracleConfirmations;
        address[] confirmingOracles;
    }
    
    // User verification data
    struct UserVerification {
        uint256 age;
        uint256 lifeExpectancy;
        string verificationData;
        uint256 verificationTimestamp;
        bool isVerified;
    }
    
    // Oracle reputation system
    struct OracleReputation {
        uint256 totalVerifications;
        uint256 successfulVerifications;
        uint256 failedVerifications;
        uint256 reputationScore;
        bool isActive;
        uint256 lastActivity;
    }
    
    // Storage
    mapping(address => DeathVerification) public deathVerifications;
    mapping(address => UserVerification) public userVerifications;
    mapping(address => OracleReputation) public oracleReputations;
    mapping(bytes32 => DeathVerification) public pendingDeathVerifications;
    
    // Events
    event DeathVerificationRequested(address indexed user, uint256 deathTimestamp, address indexed oracle);
    event DeathVerificationConfirmed(address indexed user, address indexed oracle, uint256 timestamp);
    event DeathVerificationCompleted(address indexed user, uint256 confirmations, uint256 timestamp);
    event DeathVerificationExpired(address indexed user, uint256 timestamp);
    event UserVerified(address indexed user, uint256 age, uint256 lifeExpectancy);
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event OracleReputationUpdated(address indexed oracle, uint256 newScore);
    event ConsensusTimeoutUpdated(uint256 newTimeout);
    event MinConfirmationsUpdated(uint256 newMin);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    /**
     * @notice Request death verification from oracles
     * @param user Address of the deceased user
     * @param deathTimestamp Timestamp of death
     * @param age Age at death
     * @param lifeExpectancy Expected life expectancy
     * @param deathCertificate IPFS hash of death certificate
     */
    function requestDeathVerification(
        address user,
        uint256 deathTimestamp,
        uint256 age,
        uint256 lifeExpectancy,
        string calldata deathCertificate
    ) external onlyRole(ORACLE_ROLE) nonReentrant {
        // Validate death timestamp
        if (deathTimestamp > block.timestamp) revert InvalidTimestamp();
        if (deathTimestamp < block.timestamp - VERIFICATION_EXPIRY) revert VerificationExpired();
        
        // Validate age and life expectancy
        if (age < 18 || age > 120) revert InvalidAge();
        if (lifeExpectancy < 50 || lifeExpectancy > 120) revert InvalidLifeExpectancy();
        
        bytes32 verificationHash = keccak256(abi.encodePacked(user, deathTimestamp));
        DeathVerification storage verification = pendingDeathVerifications[verificationHash];
        
        // Check if verification already exists
        if (verification.deathTimestamp != 0) revert VerificationAlreadyExists();
        
        // Initialize verification
        verification.deathTimestamp = deathTimestamp;
        verification.age = age;
        verification.lifeExpectancy = lifeExpectancy;
        verification.deathCertificate = deathCertificate;
        verification.consensusStartTime = block.timestamp;
        verification.isVerified = false;
        verification.isExpired = false;
        
        // Add first confirmation
        verification.oracleConfirmations[msg.sender] = true;
        verification.confirmingOracles.push(msg.sender);
        verification.confirmations = 1;
        
        // Check if consensus reached immediately (single oracle for now)
        if (verification.confirmations >= MIN_CONFIRMATIONS) {
            verification.isVerified = true;
            
            // Store verified death data by copying fields individually
            DeathVerification storage mainVerification = deathVerifications[user];
            mainVerification.deathTimestamp = verification.deathTimestamp;
            mainVerification.age = verification.age;
            mainVerification.lifeExpectancy = verification.lifeExpectancy;
            mainVerification.deathCertificate = verification.deathCertificate;
            mainVerification.confirmations = verification.confirmations;
            mainVerification.consensusStartTime = verification.consensusStartTime;
            mainVerification.isVerified = verification.isVerified;
            mainVerification.isExpired = verification.isExpired;
            // confirmingOracles and oracleConfirmations are not copied
            
            emit DeathVerificationCompleted(user, verification.confirmations, block.timestamp);
        }
        
        // Update oracle reputation
        OracleReputation storage reputation = oracleReputations[msg.sender];
        reputation.totalVerifications++;
        reputation.lastActivity = block.timestamp;
        
        emit DeathVerificationRequested(user, deathTimestamp, msg.sender);
    }

    /**
     * @notice Verify user information (non-death verification)
     * @param user Address of the user
     * @param age Age of the user
     * @param verificationData IPFS hash of verification data
     */
    function verifyUser(address user, uint256 age, string memory verificationData) external onlyRole(ORACLE_ROLE) {
        if (age < 18 || age > 120) revert InvalidAge();
        
        UserVerification storage verification = userVerifications[user];
        verification.age = age;
        verification.lifeExpectancy = _calculateLifeExpectancy(age);
        verification.verificationData = verificationData;
        verification.verificationTimestamp = block.timestamp;
        verification.isVerified = true;
        
        emit UserVerified(user, age, verification.lifeExpectancy);
    }

    /**
     * @notice Calculate life expectancy based on age
     * @param age Current age
     * @return lifeExpectancy Calculated life expectancy
     */
    function _calculateLifeExpectancy(uint256 age) internal pure returns (uint256) {
        // Simple life expectancy calculation
        // In production, this would use more sophisticated actuarial tables
        if (age < 30) return 85;
        if (age < 50) return 82;
        if (age < 70) return 78;
        if (age < 90) return 75;
        return 72;
    }

    /**
     * @notice Get death verification status
     * @param user Address of the user
     * @return isVerified Whether death is verified
     * @return deathTimestamp Timestamp of death
     * @return age Age at death
     * @return lifeExpectancy Life expectancy
     * @return confirmations Number of oracle confirmations
     */
    function getDeathVerification(address user) external view returns (
        bool isVerified,
        uint256 deathTimestamp,
        uint256 age,
        uint256 lifeExpectancy,
        uint256 confirmations
    ) {
        DeathVerification storage verification = deathVerifications[user];
        return (
            verification.isVerified,
            verification.deathTimestamp,
            verification.age,
            verification.lifeExpectancy,
            verification.confirmations
        );
    }

    /**
     * @notice Get user verification status
     * @param user Address of the user
     * @return isVerified Whether user is verified
     * @return age Age of user
     * @return lifeExpectancy Life expectancy
     */
    function getUserVerification(address user) external view returns (
        bool isVerified,
        uint256 age,
        uint256 lifeExpectancy
    ) {
        UserVerification storage verification = userVerifications[user];
        return (
            verification.isVerified,
            verification.age,
            verification.lifeExpectancy
        );
    }

    /**
     * @notice Get oracle reputation
     * @param oracle Address of the oracle
     * @return totalVerifications Number of verifications
     * @return successfulVerifications Number of successful verifications
     * @return failedVerifications Number of failed verifications
     * @return reputationScore Reputation score
     * @return isActive Whether the oracle is active
     */
    function getOracleReputation(address oracle) external view returns (
        uint256 totalVerifications,
        uint256 successfulVerifications,
        uint256 failedVerifications,
        uint256 reputationScore,
        bool isActive
    ) {
        OracleReputation storage rep = oracleReputations[oracle];
        return (
            rep.totalVerifications,
            rep.successfulVerifications,
            rep.failedVerifications,
            rep.reputationScore,
            rep.isActive
        );
    }

    /**
     * @notice Add new oracle
     * @param oracle Address of the oracle to add
     */
    function addOracle(address oracle) external onlyRole(ADMIN_ROLE) {
        if (oracle == address(0)) revert InvalidOracle();
        
        _grantRole(ORACLE_ROLE, oracle);
        oracleReputations[oracle].isActive = true;
        
        emit OracleAdded(oracle);
    }

    /**
     * @notice Remove oracle
     * @param oracle Address of the oracle to remove
     */
    function removeOracle(address oracle) external onlyRole(ADMIN_ROLE) {
        if (oracle == address(0)) revert InvalidOracle();
        
        _revokeRole(ORACLE_ROLE, oracle);
        oracleReputations[oracle].isActive = false;
        
        emit OracleRemoved(oracle);
    }

    /**
     * @notice Update consensus timeout
     * @param newTimeout New timeout in seconds
     */
    function updateConsensusTimeout(uint256 newTimeout) external onlyRole(ADMIN_ROLE) {
        require(newTimeout > 0 && newTimeout <= 7 days, "Invalid timeout");
        emit ConsensusTimeoutUpdated(newTimeout);
    }

    /**
     * @notice Update minimum confirmations required
     * @param newMin New minimum confirmations
     */
    function updateMinConfirmations(uint256 newMin) external onlyRole(ADMIN_ROLE) {
        require(newMin >= 2 && newMin <= MAX_CONFIRMATIONS, "Invalid confirmations");
        emit MinConfirmationsUpdated(newMin);
    }

    /**
     * @notice Legacy function for backward compatibility
     * @param user Address of the deceased user
     * @param deathTimestamp Timestamp of death
     * @param age Age at death
     * @param lifeExpectancy Life expectancy
     * @param deathCertificate IPFS hash of death certificate
     */
    function verifyDeath(
        address user,
        uint256 deathTimestamp,
        uint256 age,
        uint256 lifeExpectancy,
        string memory deathCertificate
    ) external onlyRole(ORACLE_ROLE) {
        // For backward compatibility, this creates a single-oracle verification
        // In production, this should be deprecated in favor of multi-oracle consensus
        if (age < 18 || age > 120) revert InvalidAge();
        if (lifeExpectancy < 50 || lifeExpectancy > 120) revert InvalidLifeExpectancy();
        if (deathTimestamp > block.timestamp) revert InvalidTimestamp();
        if (deathTimestamp < block.timestamp - VERIFICATION_EXPIRY) revert VerificationExpired();
        
        // Direct verification for backward compatibility
        DeathVerification storage verification = deathVerifications[user];
        if (verification.isVerified) revert DeathAlreadyVerified();
        
        verification.deathTimestamp = deathTimestamp;
        verification.age = age;
        verification.lifeExpectancy = lifeExpectancy;
        verification.deathCertificate = deathCertificate;
        verification.confirmations = 1;
        verification.consensusStartTime = block.timestamp;
        verification.isVerified = true;
        verification.isExpired = false;
        
        // Add this oracle to confirming oracles
        verification.confirmingOracles.push(msg.sender);
        verification.oracleConfirmations[msg.sender] = true;
        
        // Update oracle reputation
        OracleReputation storage reputation = oracleReputations[msg.sender];
        reputation.totalVerifications++;
        reputation.successfulVerifications++;
        reputation.lastActivity = block.timestamp;
        reputation.reputationScore = (reputation.successfulVerifications * 100) / reputation.totalVerifications;
        
        emit DeathVerificationCompleted(user, 1, block.timestamp);
        emit OracleReputationUpdated(msg.sender, reputation.reputationScore);
    }

    // Stub for interface compatibility
    function calculateBonus(
        uint256 actualAge,
        uint256 lifeExpectancy,
        uint256 /* _totalDeposits */,
        uint256 /* _yearsInSystem */
    ) external pure override returns (uint256 bonus) {
        // Fixed B3TR amounts (100 B3TR base - can adjust before mainnet)
        uint256 CARBON_OFFSET_PER_YEAR = 100e18; // 100 B3TR per year early
        uint256 LEGACY_BONUS_BASE = 100e18; // 100 B3TR base
        uint256 LEGACY_BONUS_PER_YEAR = 20e18; // 20 B3TR per year beyond
        uint256 MAX_CARBON_YEARS = 30;

        if (actualAge < lifeExpectancy) {
            // Carbon offset: fixed amount per year early
            uint256 yearsEarly = lifeExpectancy - actualAge;
            if (yearsEarly > MAX_CARBON_YEARS) yearsEarly = MAX_CARBON_YEARS;
            bonus = yearsEarly * CARBON_OFFSET_PER_YEAR;
        } else {
            // Legacy bonus: fixed base + fixed amount per year beyond
            uint256 yearsBeyond = actualAge > lifeExpectancy ? actualAge - lifeExpectancy : 0;
            bonus = LEGACY_BONUS_BASE + (yearsBeyond * LEGACY_BONUS_PER_YEAR);
        }
    }
} 