// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./libraries/VereavementShared.sol";
import "./interfaces/IAgeVerification.sol";

/**
 * @title AgeVerification
 * @author yothatscool
 * @notice Handles age verification for the Vereavement protocol
 * @dev Implements age verification and proof management
 */
contract AgeVerification is IAgeVerification, AccessControl {
    using VereavementShared for *;

    // Custom errors for gas optimization
    error InvalidBirthYear(uint256 birthYear);
    error AgeNotVerified(address person);
    error UnderageError(uint256 age);
    error VerificationCooldown(uint256 remainingTime);
    error MaxVerificationsReached();
    error InvalidProof();
    error InvalidAddress(address addr);
    error UnauthorizedAccess(address caller);
    error InvalidState(string reason);
    error ArrayLengthMismatch();
    error BatchSizeTooLarge();

    // Constants
    uint256 private constant MIN_AGE = 18;
    uint256 private constant VERIFICATION_COOLDOWN = 1 days;
    uint256 private constant MAX_VERIFICATIONS_PER_DAY = 100;
    uint256 private constant MAX_BATCH_SIZE = 50;
    uint256 private constant SECONDS_PER_YEAR = 365 days;

    // Optimized storage layout - packed into minimum slots
    struct VerificationData {
        uint32 birthYear;         // 32 bits - Year only
        uint32 verificationTime;  // 32 bits - Timestamp
        uint32 lastUpdate;        // 32 bits - Timestamp
        uint32 actionCount;       // 32 bits - Counter
        bool isVerified;          // 8 bits
        address verifier;         // 160 bits
        bytes32 proofHash;        // 256 bits - Separate slot
    }

    struct VerifierData {
        uint32 lastVerification;  // 32 bits - Timestamp
        uint32 verificationCount; // 32 bits - Counter
        uint32 dailyCount;        // 32 bits - Daily counter
        uint32 lastReset;         // 32 bits - Last counter reset
        bool isAuthorized;        // 8 bits
    }

    // Storage
    mapping(address => VerificationData) private verifications;
    mapping(address => VerifierData) private verifiers;

    // Events with indexed parameters
    event VerifierStatusUpdated(
        address indexed verifier,
        bool status,
        uint32 timestamp
    );
    event AgeVerified(
        address indexed person,
        uint32 birthYear,
        address indexed verifier,
        uint32 timestamp
    );
    event VerificationRevoked(
        address indexed person,
        address indexed revoker,
        uint32 timestamp
    );
    event BatchVerificationCompleted(
        uint256 successCount,
        uint256 totalCount,
        uint32 timestamp
    );

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Batch authorize verifiers
     */
    function batchSetVerifiers(
        address[] calldata verifierAddresses,
        bool[] calldata statuses
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 length = verifierAddresses.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        if (length != statuses.length) revert ArrayLengthMismatch();

        uint32 timestamp = uint32(block.timestamp);

        for (uint256 i = 0; i < length;) {
            _setVerifier(verifierAddresses[i], statuses[i], timestamp);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Set single verifier status
     */
    function setAgeVerifier(
        address verifier,
        bool status
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        _setVerifier(verifier, status, uint32(block.timestamp));
    }

    /**
     * @notice Batch verify ages
     */
    function batchVerifyAge(
        address[] calldata persons,
        uint256[] calldata birthYears,
        bytes[] calldata proofs
    ) external {
        uint256 length = persons.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        if (length != birthYears.length || length != proofs.length)
            revert ArrayLengthMismatch();

        uint32 timestamp = uint32(block.timestamp);
        uint256 successCount;

        // Check verifier status and rate limits
        VerifierData storage verifier = verifiers[msg.sender];
        if (!verifier.isAuthorized) revert UnauthorizedAccess(msg.sender);
        _checkAndUpdateVerifierLimits(verifier, timestamp);

        uint32 currentYear = uint32(block.timestamp / SECONDS_PER_YEAR + 1970);

        for (uint256 i = 0; i < length;) {
            bool success = _verifyAgeInternal(
                persons[i],
                birthYears[i],
                proofs[i],
                msg.sender,
                timestamp,
                currentYear
            );
            if (success) {
                unchecked { successCount++; }
            }
            unchecked { ++i; }
        }

        emit BatchVerificationCompleted(successCount, length, timestamp);
    }

    /**
     * @notice Verify single person's age
     */
    function verifyAge(
        address person,
        uint256 birthYear,
        bytes calldata proof
    ) external override {
        uint32 timestamp = uint32(block.timestamp);
        
        // Check verifier status and rate limits
        VerifierData storage verifier = verifiers[msg.sender];
        if (!verifier.isAuthorized) revert UnauthorizedAccess(msg.sender);
        _checkAndUpdateVerifierLimits(verifier, timestamp);

        uint32 currentYear = uint32(block.timestamp / SECONDS_PER_YEAR + 1970);
        
        require(
            _verifyAgeInternal(person, birthYear, proof, msg.sender, timestamp, currentYear),
            "Verification failed"
        );
    }

    /**
     * @notice Batch revoke verifications
     */
    function batchRevokeVerifications(
        address[] calldata persons
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 length = persons.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();

        uint32 timestamp = uint32(block.timestamp);

        for (uint256 i = 0; i < length;) {
            _revokeVerification(persons[i], timestamp);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Revoke single verification
     */
    function revokeVerification(
        address person
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeVerification(person, uint32(block.timestamp));
    }

    /**
     * @notice Batch check ages
     */
    function batchCheckAges(
        address[] calldata persons
    ) external view returns (uint256[] memory ages) {
        uint256 length = persons.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();

        ages = new uint256[](length);
        uint32 currentYear = uint32(block.timestamp / SECONDS_PER_YEAR + 1970);

        for (uint256 i = 0; i < length;) {
            ages[i] = _checkAgeInternal(persons[i], currentYear);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Check single person's age
     */
    function checkAge(
        address person
    ) external view override returns (uint256) {
        return _checkAgeInternal(
            person,
            uint32(block.timestamp / SECONDS_PER_YEAR + 1970)
        );
    }

    /**
     * @notice Batch get verification details
     */
    function batchGetVerificationDetails(
        address[] calldata persons
    ) external view returns (
        uint256[] memory birthYears,
        uint256[] memory verificationTimes,
        address[] memory verifierList,
        bool[] memory isVerified
    ) {
        uint256 length = persons.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();

        birthYears = new uint256[](length);
        verificationTimes = new uint256[](length);
        verifierList = new address[](length);
        isVerified = new bool[](length);

        for (uint256 i = 0; i < length;) {
            VerificationData storage verification = verifications[persons[i]];
            birthYears[i] = verification.birthYear;
            verificationTimes[i] = verification.verificationTime;
            verifierList[i] = verification.verifier;
            isVerified[i] = verification.isVerified;
            unchecked { ++i; }
        }
    }

    /**
     * @notice Get single verification details
     */
    function getVerificationDetails(
        address person
    ) external view override returns (
        uint256 birthYear,
        uint256 verificationTimestamp,
        address verifier,
        bool isVerified
    ) {
        VerificationData storage verification = verifications[person];
        return (
            verification.birthYear,
            verification.verificationTime,
            verification.verifier,
            verification.isVerified
        );
    }

    function isAuthorizedVerifier(address verifier) external view returns (bool) {
        return verifiers[verifier].isAuthorized;
    }

    // Internal functions
    function _setVerifier(
        address verifier,
        bool status,
        uint32 timestamp
    ) internal {
        if (verifier == address(0)) revert InvalidAddress(verifier);
        
        VerifierData storage verifierData = verifiers[verifier];
        verifierData.isAuthorized = status;
        verifierData.lastVerification = timestamp;
        
        emit VerifierStatusUpdated(verifier, status, timestamp);
    }

    function _verifyAgeInternal(
        address person,
        uint256 birthYear,
        bytes calldata proof,
        address verifier,
        uint32 timestamp,
        uint32 currentYear
    ) internal returns (bool) {
        if (person == address(0)) revert InvalidAddress(person);
        if (birthYear > currentYear) revert InvalidBirthYear(birthYear);
        
        uint256 age = currentYear - birthYear;
        if (age < MIN_AGE) revert UnderageError(age);

        bytes32 proofHash = keccak256(abi.encodePacked(person, birthYear, proof));
        VerificationData storage verification = verifications[person];
        
        verification.birthYear = uint32(birthYear);
        verification.verificationTime = timestamp;
        verification.lastUpdate = timestamp;
        verification.verifier = verifier;
        verification.proofHash = proofHash;
        verification.isVerified = true;
        unchecked {
            verification.actionCount++;
        }

        emit AgeVerified(person, uint32(birthYear), verifier, timestamp);
        return true;
    }

    function _revokeVerification(
        address person,
        uint32 timestamp
    ) internal {
        if (person == address(0)) revert InvalidAddress(person);
        
        delete verifications[person];
        emit VerificationRevoked(person, msg.sender, timestamp);
    }

    function _checkAgeInternal(
        address person,
        uint32 currentYear
    ) internal view returns (uint256) {
        VerificationData storage verification = verifications[person];
        if (!verification.isVerified) revert AgeNotVerified(person);

        unchecked {
            if (currentYear <= verification.birthYear)
                revert InvalidBirthYear(verification.birthYear);
            return currentYear - verification.birthYear;
        }
    }

    function _checkAndUpdateVerifierLimits(
        VerifierData storage verifier,
        uint32 timestamp
    ) internal {
        // Reset daily count if new day
        if (timestamp - verifier.lastReset >= 1 days) {
            verifier.dailyCount = 0;
            verifier.lastReset = timestamp;
        }

        // Check cooldown
        if (timestamp - verifier.lastVerification < VERIFICATION_COOLDOWN)
            revert VerificationCooldown(
                verifier.lastVerification + VERIFICATION_COOLDOWN - timestamp
            );

        // Check daily limit
        if (verifier.dailyCount >= MAX_VERIFICATIONS_PER_DAY)
            revert MaxVerificationsReached();

        // Update verifier stats
        verifier.lastVerification = timestamp;
        unchecked {
            verifier.verificationCount++;
            verifier.dailyCount++;
        }
    }
} 