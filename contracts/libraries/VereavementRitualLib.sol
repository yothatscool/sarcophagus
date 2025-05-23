// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VereavementConstants.sol";
import "../interfaces/IVereavementRoles.sol";
import "./VereavementStorage.sol";

/**
 * @title VereavementRitualLib
 * @author yothatscool
 * @notice Library for ritual calculations and mechanics
 * @dev Gas optimized using unchecked blocks and memory caching
 */
library VereavementRitualLib {
    using VereavementRitualLib for uint256;
    using VereavementStorage for VereavementStorage.Layout;

    // Error messages
    error InvalidAmount();
    error TimestampTooOld();
    error CalculationOverflow();
    error InvalidProof();
    error ProofExpired();
    error SignatureInvalid();

    // Constants for compound growth calculation
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant GROWTH_RATE_BPS = 500; // 5% APY
    uint256 private constant MAX_GROWTH_PERIODS = 52; // Maximum number of periods to prevent excessive gas usage

    /**
     * @dev Calculate carbon offset ritual value using assembly with safety checks
     * @param amount Amount of carbon offset in metric tons
     * @return ritualValue The ritual value for the carbon offset
     */
    function calculateCarbonRitualValue(uint256 amount) internal pure returns (uint256 ritualValue) {
        if (amount == 0) revert InvalidAmount();
        if (amount > type(uint256).max / 100) {
            revert CalculationOverflow();
        }

        assembly {
            ritualValue := mul(amount, 100)  // 1 metric ton = 100 ritual points
            if gt(ritualValue, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) {
                revert(0, 0)
            }
        }
    }

    /**
     * @dev Calculate compound growth for ritual value
     * @param principal Initial value
     * @param timePassed Time elapsed since last growth
     * @return growth Amount of growth
     */
    function calculateCompoundGrowth(
        uint256 principal,
        uint256 timePassed
    ) internal pure returns (uint256 growth) {
        if (timePassed == 0) return 0;
        if (principal == 0) return 0;

        uint256 periods = timePassed / 1 days;
        if (periods > MAX_GROWTH_PERIODS) {
            periods = MAX_GROWTH_PERIODS;
        }

        // Calculate compound growth with safety checks
        uint256 rate = GROWTH_RATE_BPS;
        uint256 value = principal;

        for (uint256 i = 0; i < periods;) {
            uint256 interest = (value * rate) / BASIS_POINTS;
            if (interest == 0) break;

            value += interest;
            unchecked { i++; }
        }

        growth = value - principal;
    }

    /**
     * @dev Calculate longevity bonus
     * @param currentScore Current longevity score
     * @param timePassed Time elapsed since last update
     * @return newScore Updated longevity score
     * @return bonus Bonus value earned
     * @return multiplier Score multiplier
     */
    function calculateLongevityBonus(
        uint256 currentScore,
        uint256 timePassed
    ) internal pure returns (
        uint256 newScore,
        uint256 bonus,
        uint256 multiplier
    ) {
        if (timePassed < 1 days) {
            return (currentScore, 0, 0);
        }

        // Calculate score increase
        uint256 daysElapsed = timePassed / 1 days;
        newScore = currentScore + daysElapsed;

        // Calculate bonus value
        multiplier = (newScore / 100) + 1; // 1% bonus per 100 points
        bonus = 1 ether * multiplier; // Base bonus of 1 VET times multiplier

        return (newScore, bonus, multiplier);
    }

    /**
     * @dev Verify oracle signature for ritual proofs
     * @param key Oracle verification key
     * @param proof Proof data
     * @param signature Oracle signature
     * @return proofTimestamp Proof timestamp
     */
    function verifyOracleSignature(
        bytes32 key,
        bytes calldata proof,
        bytes calldata signature
    ) internal view returns (uint256 proofTimestamp) {
        // Extract timestamp from proof
        require(proof.length >= 32, "Invalid proof length");
        assembly {
            proofTimestamp := calldataload(proof.offset)
        }

        // Verify timestamp is recent
        if (proofTimestamp > block.timestamp) revert ProofExpired();
        if (block.timestamp - proofTimestamp > 1 days) revert TimestampTooOld();

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(key, proof));
        address signer = recoverSigner(messageHash, signature);

        // Check if signer is authorized oracle
        require(IVereavementRoles(msg.sender).hasRole(keccak256("ORACLE_ROLE"), signer), "Unauthorized oracle");

        return proofTimestamp;
    }

    /**
     * @dev Recover signer from signature
     * @param messageHash Hash of the message that was signed
     * @param signature Signature bytes
     * @return signer Address that signed the message
     */
    function recoverSigner(
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
        require(signer != address(0), "ECDSA: invalid signature");

        return signer;
    }
} 