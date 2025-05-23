// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VereavementStorage.sol";
import "./VereavementConstants.sol";
import "./VereavementShared.sol";

/**
 * @title VereavementStorageOptimizer
 * @author yothatscool
 * @notice Library for optimizing storage operations in the Vereavement protocol
 * @dev Gas optimized using struct packing and memory pooling
 */
library VereavementStorageOptimizer {
    using VereavementStorage for VereavementStorage.Layout;
    using VereavementShared for *;

    // Optimization functions
    function optimizeBeneficiaries(
        VereavementStorage.Layout storage s,
        address user
    ) internal {
        VereavementStorage.Beneficiary[] storage beneficiaries = s.vaults[user].beneficiaries;
        uint256 length = beneficiaries.length;
        
        // Sort beneficiaries by percentage (descending) for gas optimization
        for (uint256 i = 0; i < length - 1; i++) {
            for (uint256 j = 0; j < length - i - 1; j++) {
                if (beneficiaries[j].percentage < beneficiaries[j + 1].percentage) {
                    // Swap beneficiaries
                    VereavementStorage.Beneficiary memory temp = beneficiaries[j];
                    beneficiaries[j] = beneficiaries[j + 1];
                    beneficiaries[j + 1] = temp;
                }
            }
        }
    }

    function optimizeTokenBalances(
        VereavementStorage.Layout storage s,
        address user
    ) internal {
        address[] storage tokens = s.vaults[user].supportedTokens;
        uint256 length = tokens.length;
        
        // Remove tokens with zero balance
        for (uint256 i = 0; i < length; i++) {
            if (s.vaults[user].tokenBalances[tokens[i]].balance == 0) {
                // Move last element to current position
                tokens[i] = tokens[length - 1];
                tokens.pop();
                length--;
                i--;
            }
        }
    }

    function optimizeMilestones(
        VereavementStorage.Layout storage s,
        address user,
        uint256 beneficiaryIndex
    ) internal {
        VereavementStorage.MilestoneCondition[] storage milestones = 
            s.vaults[user].beneficiaries[beneficiaryIndex].milestones;
        uint256 length = milestones.length;
        
        // Sort milestones by amount (descending) for gas optimization
        for (uint256 i = 0; i < length - 1; i++) {
            for (uint256 j = 0; j < length - i - 1; j++) {
                if (milestones[j].amount < milestones[j + 1].amount) {
                    // Swap milestones
                    VereavementStorage.MilestoneCondition memory temp = milestones[j];
                    milestones[j] = milestones[j + 1];
                    milestones[j + 1] = temp;
                }
            }
        }
    }

    function optimizeActivityHistory(
        VereavementStorage.Layout storage s,
        address user
    ) internal {
        VereavementStorage.ActivityProof[] storage proofs = s.vaults[user].activityHistory;
        uint256 length = proofs.length;
        
        // Keep only the most recent proofs if exceeding limit
        if (length > 100) {
            // Create new array with most recent proofs
            VereavementStorage.ActivityProof[] memory recent = new VereavementStorage.ActivityProof[](100);
            for (uint256 i = 0; i < 100; i++) {
                recent[i] = proofs[length - 100 + i];
            }
            
            // Clear storage array
            delete s.vaults[user].activityHistory;
            
            // Repopulate with recent proofs
            for (uint256 i = 0; i < 100; i++) {
                s.vaults[user].activityHistory.push(recent[i]);
            }
        }
    }

    function optimizeMemorials(
        VereavementStorage.Layout storage s,
        address user
    ) internal {
        string[] storage memorials = s.vaults[user].memorials;
        uint256 length = memorials.length;
        
        // Keep only the most recent memorials if exceeding limit
        if (length > VereavementConstants.MAX_MEMORIALS_PER_USER) {
            uint256 toRemove = length - VereavementConstants.MAX_MEMORIALS_PER_USER;
            for (uint256 i = 0; i < toRemove; i++) {
                memorials.pop();
            }
        }
    }
} 