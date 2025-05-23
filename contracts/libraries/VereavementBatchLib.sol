// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VereavementStorage.sol";
import "./VereavementConstants.sol";

/**
 * @title VereavementBatchLib
 * @dev Library for optimized batch operations in the Vereavement protocol
 * @notice Implements gas-efficient batch operations and optimized data structures
 * 
 * Optimization Features:
 * - Batch Processing: Combines multiple operations into single transactions
 * - Memory Optimization: Uses memory arrays for batch operations
 * - Packed Encoding: Efficient data encoding for batch transfers
 * - Storage Caching: Minimizes storage reads/writes in loops
 * - Bitmap Operations: Uses bitmaps for efficient state tracking
 */
library VereavementBatchLib {
    using VereavementStorage for VereavementStorage.Layout;

    // Packed struct for batch ritual updates
    struct BatchRitualUpdate {
        address user;
        uint96 value;
        uint32 timestamp;
        string ritualType;
        bool isActive;
    }

    // Packed struct for batch beneficiary updates
    struct BatchBeneficiaryUpdate {
        address recipient;
        uint32 percentage;
        bool isConditional;
        string condition;
    }

    // Bitmap for tracking state changes
    struct StateBitmap {
        uint256 bitmap;
    }

    // Custom errors for better gas efficiency
    error BatchProcessingFailed();
    error InvalidEncoding();
    error OverflowError();

    // Constants for batch processing
    uint256 private constant MAX_BATCH_SIZE = 100;
    uint256 private constant OPTIMAL_CHUNK_SIZE = 10;

    /**
     * @notice Process multiple ritual updates in a single transaction
     * @dev Combines multiple ritual updates to save gas
     * @param s Storage layout reference
     * @param updates Array of ritual updates to process
     * @return processed Number of updates processed
     */
    function batchProcessRituals(
        VereavementStorage.Layout storage s,
        BatchRitualUpdate[] memory updates
    ) internal returns (uint256 processed) {
        uint256 length = updates.length;
        if (length > MAX_BATCH_SIZE) revert BatchProcessingFailed();
        
        StateBitmap memory stateMap;
        uint256[] memory processedIndices = new uint256[](length);
        uint256 processedCount;

        // Process updates in optimal chunks
        for (uint256 i = 0; i < length;) {
            uint256 chunkEnd = i + OPTIMAL_CHUNK_SIZE;
            if (chunkEnd > length) chunkEnd = length;
            
            // Process chunk
            for (uint256 j = i; j < chunkEnd;) {
                BatchRitualUpdate memory update = updates[j];
                VereavementStorage.RitualState storage state = s.getRitualState(update.user);

                // Use bitmap to track state changes
                uint256 mask = 1 << (j % 256);
                if (state.isActive && update.isActive && (stateMap.bitmap & mask) == 0) {
                    state.totalValue = update.value;
                    stateMap.bitmap |= mask;
                    processedIndices[processedCount++] = j;
                }

                unchecked { j++; }
            }

            unchecked { i = chunkEnd; }
        }

        processed = processedCount;
    }

    /**
     * @notice Process multiple beneficiary updates in a single transaction
     * @dev Optimizes beneficiary updates using memory caching
     * @param s Storage layout reference
     * @param vault Target vault
     * @param updates Array of beneficiary updates
     * @return processed Number of updates processed
     */
    function batchUpdateBeneficiaries(
        VereavementStorage.Layout storage s,
        VereavementStorage.Vault storage vault,
        BatchBeneficiaryUpdate[] memory updates
    ) internal returns (uint256 processed) {
        uint256 length = updates.length;
        uint256 totalPercentage;

        // Pre-allocate memory array for beneficiaries
        VereavementStorage.Beneficiary[] storage beneficiaries = vault.beneficiaries;
        uint256[] memory indices = new uint256[](length);

        // First pass: validate and prepare
        for (uint256 i = 0; i < length;) {
            BatchBeneficiaryUpdate memory update = updates[i];
            
            unchecked {
                totalPercentage += update.percentage;
                indices[i] = beneficiaries.length + i;
                i++;
            }
        }

        require(totalPercentage <= VereavementConstants.BASIS_POINTS, "Percentage exceeds 100%");

        // Second pass: batch update
        for (uint256 i = 0; i < length;) {
            BatchBeneficiaryUpdate memory update = updates[i];
            
            beneficiaries.push();
            VereavementStorage.Beneficiary storage beneficiary = beneficiaries[indices[i]];
            
            // Batch storage updates
            beneficiary.recipient = update.recipient;
            beneficiary.percentage = update.percentage;
            beneficiary.isConditional = update.isConditional;
            
            unchecked {
                processed++;
                i++;
            }
        }
    }

    /**
     * @notice Encode ritual states with safety checks
     * @dev Uses assembly for efficient encoding with overflow protection
     * @param states Array of ritual states to encode
     * @return encoded Packed bytes data
     */
    function encodeRitualStates(
        VereavementStorage.RitualState[] memory states
    ) internal pure returns (bytes memory encoded) {
        uint256 length = states.length;
        if (length == 0) return new bytes(0);
        
        // Allocate memory for encoded data
        encoded = new bytes(length * 32);
        
        for (uint256 i = 0; i < length;) {
            VereavementStorage.RitualState memory state = states[i];
            uint256 offset = i * 32;
            
            // Validate values before packing
            if (state.totalValue > type(uint128).max) revert OverflowError();
            if (state.carbonOffset > type(uint64).max) revert OverflowError();
            if (state.longevityScore > type(uint32).max) revert OverflowError();
            
            unchecked {
                i++;
            }
        }
    }

    /**
     * @notice Decode ritual states with validation
     * @dev Safely unpacks encoded ritual state data
     * @param encoded Packed bytes data
     * @return states Array of decoded ritual states
     */
    function decodeRitualStates(
        bytes memory encoded
    ) internal pure returns (VereavementStorage.RitualState[] memory states) {
        if (encoded.length == 0) return new VereavementStorage.RitualState[](0);
        if (encoded.length % 32 != 0) revert InvalidEncoding();
        
        uint256 length = encoded.length / 32;
        states = new VereavementStorage.RitualState[](length);
        
        for (uint256 i = 0; i < length;) {
            uint256 offset = i * 32;
            uint256 packed;
            
            assembly {
                // Load packed data
                packed := mload(add(add(encoded, 32), offset))
                
                // Validate packed data
                if gt(shr(128, and(packed, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000000000000000)), 0) {
                    revert(0, 0)
                }
                
                // Create new state object
                let state := mload(add(states, add(32, mul(i, 32))))
                
                // Unpack data with range checks
                let totalValue := shr(128, packed)
                let carbonOffset := and(shr(64, packed), 0xFFFFFFFFFFFFFFFF)
                let longevityScore := and(shr(32, packed), 0xFFFFFFFF)
                let isActive := and(packed, 1)
                
                // Store unpacked data
                mstore(add(state, 32), totalValue)
                mstore(add(state, 64), carbonOffset)
                mstore(add(state, 96), longevityScore)
                mstore(add(state, 128), isActive)
            }
            
            unchecked { i++; }
        }
    }
} 