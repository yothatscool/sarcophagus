// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IDeathVerifier.sol";

/**
 * @title DeathVerifier
 * @author yothatscool
 * @notice Handles death verification and bonus calculations
 * @dev Calculates carbon offset bonus (early death) and legacy bonus (late death)
 */
contract DeathVerifier is IDeathVerifier, AccessControl, ReentrancyGuard {
    
    // Custom errors
    error InvalidAge();
    error InvalidLifeExpectancy();
    error InvalidProof();
    error ProofExpired();
    error UnauthorizedOracle();

    // Roles
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Bonus calculation constants
    uint256 public constant CARBON_OFFSET_MULTIPLIER = 50; // 50 B3TR per year early
    uint256 public constant LEGACY_BONUS_MULTIPLIER = 25;  // 25 B3TR per year late
    uint256 public constant MAX_BONUS_YEARS = 20;          // Cap bonus at 20 years
    uint256 public constant PROOF_VALIDITY_PERIOD = 7 days; // Proof must be recent
    
    // Oracle verification
    mapping(address => bool) public authorizedOracles;
    mapping(bytes32 => bool) public usedProofs;
    
    // Death verification events
    event DeathVerified(
        address indexed user,
        uint256 deathTimestamp,
        uint256 age,
        uint256 lifeExpectancy,
        uint256 bonus,
        string proofHash
    );
    
    event OracleAuthorized(address indexed oracle);
    event OracleRevoked(address indexed oracle);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(ORACLE_ROLE, msg.sender);
    }

    /**
     * @notice Calculate bonus based on age vs life expectancy
     * @param actualAge Age at death
     * @param lifeExpectancy Expected life expectancy
     * @return bonus Amount of B3TR bonus (in wei)
     */
    function calculateBonus(
        uint256 actualAge,
        uint256 lifeExpectancy
    ) external pure override returns (uint256 bonus) {
        if (actualAge == 0 || lifeExpectancy == 0) revert InvalidAge();
        if (actualAge > 120 || lifeExpectancy > 120) revert InvalidAge();
        
        uint256 ageDifference;
        
        if (actualAge < lifeExpectancy) {
            // Early death - Carbon Offset Bonus
            ageDifference = lifeExpectancy - actualAge;
            if (ageDifference > MAX_BONUS_YEARS) {
                ageDifference = MAX_BONUS_YEARS;
            }
            bonus = ageDifference * CARBON_OFFSET_MULTIPLIER * 1e18; // Convert to wei
        } else if (actualAge > lifeExpectancy) {
            // Late death - Legacy Bonus
            ageDifference = actualAge - lifeExpectancy;
            if (ageDifference > MAX_BONUS_YEARS) {
                ageDifference = MAX_BONUS_YEARS;
            }
            bonus = ageDifference * LEGACY_BONUS_MULTIPLIER * 1e18; // Convert to wei
        }
        // If actualAge == lifeExpectancy, bonus = 0
    }

    /**
     * @notice Verify death with oracle signature
     * @param user Address of deceased
     * @param deathTimestamp Timestamp of death
     * @param age Age at death
     * @param lifeExpectancy Expected life expectancy
     * @param proofHash IPFS hash of death certificate
     * @param oracleSignature Oracle signature
     * @param signatureTimestamp When oracle signed
     */
    function verifyDeathWithProof(
        address user,
        uint256 deathTimestamp,
        uint256 age,
        uint256 lifeExpectancy,
        string calldata proofHash,
        bytes calldata oracleSignature,
        uint256 signatureTimestamp
    ) external onlyRole(ORACLE_ROLE) returns (bool) {
        // Check if proof is recent
        if (block.timestamp - signatureTimestamp > PROOF_VALIDITY_PERIOD) {
            revert ProofExpired();
        }

        // Verify oracle signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            user,
            deathTimestamp,
            age,
            lifeExpectancy,
            proofHash,
            signatureTimestamp
        ));
        
        address signer = _recoverSigner(messageHash, oracleSignature);
        if (!hasRole(ORACLE_ROLE, signer)) {
            revert UnauthorizedOracle();
        }

        // Check if proof already used
        bytes32 proofId = keccak256(abi.encodePacked(proofHash, user));
        if (usedProofs[proofId]) {
            revert InvalidProof();
        }
        usedProofs[proofId] = true;

        // Calculate bonus
        uint256 bonus = this.calculateBonus(age, lifeExpectancy);

        emit DeathVerified(user, deathTimestamp, age, lifeExpectancy, bonus, proofHash);
        
        return true;
    }

    /**
     * @notice Authorize a new oracle
     * @param oracle Address to authorize
     */
    function authorizeOracle(address oracle) external onlyRole(ADMIN_ROLE) {
        if (oracle == address(0)) revert InvalidAge();
        
        authorizedOracles[oracle] = true;
        grantRole(ORACLE_ROLE, oracle);
        
        emit OracleAuthorized(oracle);
    }

    /**
     * @notice Revoke oracle authorization
     * @param oracle Address to revoke
     */
    function revokeOracle(address oracle) external onlyRole(ADMIN_ROLE) {
        authorizedOracles[oracle] = false;
        revokeRole(ORACLE_ROLE, oracle);
        
        emit OracleRevoked(oracle);
    }

    /**
     * @notice Recover signer from signature
     * @param messageHash Hash of the message
     * @param signature Signature bytes
     * @return signer Address that signed
     */
    function _recoverSigner(
        bytes32 messageHash,
        bytes memory signature
    ) internal pure returns (address signer) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid signature recovery id");

        signer = ecrecover(messageHash, v, r, s);
        require(signer != address(0), "Invalid signature");
    }

    // View functions
    function isOracleAuthorized(address oracle) external view returns (bool) {
        return authorizedOracles[oracle];
    }

    function getBonusMultipliers() external pure returns (uint256 carbon, uint256 legacy) {
        return (CARBON_OFFSET_MULTIPLIER, LEGACY_BONUS_MULTIPLIER);
    }

    function getMaxBonusYears() external pure returns (uint256) {
        return MAX_BONUS_YEARS;
    }
} 