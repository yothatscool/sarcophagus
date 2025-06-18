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
                    // Swap beneficiaries by copying fields
                    VereavementStorage.Beneficiary storage b1 = beneficiaries[j];
                    VereavementStorage.Beneficiary storage b2 = beneficiaries[j + 1];

                    // Store b2's values
                    address tempRecipient = b2.recipient;
                    uint256 tempPercentage = b2.percentage;
                    uint256 tempVestingDuration = b2.vestingDuration;
                    bool tempIsConditional = b2.isConditional;
                    string memory tempCondition = b2.condition;
                    bool tempIsApproved = b2.isApproved;
                    uint256 tempPaidAmount = b2.paidAmount;
                    bool tempConditionMet = b2.conditionMet;
                    VereavementStorage.AgeBasedVesting memory tempAgeVesting = b2.ageVesting;
                    uint256 tempMilestoneCount = b2.milestoneCount;

                    // Copy b1 to b2
                    b2.recipient = b1.recipient;
                    b2.percentage = b1.percentage;
                    b2.vestingDuration = b1.vestingDuration;
                    b2.isConditional = b1.isConditional;
                    b2.condition = b1.condition;
                    b2.isApproved = b1.isApproved;
                    b2.paidAmount = b1.paidAmount;
                    b2.conditionMet = b1.conditionMet;
                    b2.ageVesting = b1.ageVesting;
                    b2.milestoneCount = b1.milestoneCount;

                    // Copy b1's milestones to b2
                    for (uint256 k = 0; k < b1.milestoneCount; k++) {
                        b2.milestones[k] = b1.milestones[k];
                    }

                    // Copy temp values to b1
                    b1.recipient = tempRecipient;
                    b1.percentage = tempPercentage;
                    b1.vestingDuration = tempVestingDuration;
                    b1.isConditional = tempIsConditional;
                    b1.condition = tempCondition;
                    b1.isApproved = tempIsApproved;
                    b1.paidAmount = tempPaidAmount;
                    b1.conditionMet = tempConditionMet;
                    b1.ageVesting = tempAgeVesting;
                    b1.milestoneCount = tempMilestoneCount;

                    // Copy temp milestones to b1
                    for (uint256 k = 0; k < tempMilestoneCount; k++) {
                        b1.milestones[k] = b2.milestones[k];
                    }
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
        VereavementStorage.Beneficiary storage beneficiary = s.vaults[user].beneficiaries[beneficiaryIndex];
        uint256 length = beneficiary.milestoneCount;
        
        // Sort milestones by amount (descending) for gas optimization
        for (uint256 i = 0; i < length - 1; i++) {
            for (uint256 j = 0; j < length - i - 1; j++) {
                if (beneficiary.milestones[j].amount < beneficiary.milestones[j + 1].amount) {
                    // Swap milestones
                    VereavementStorage.MilestoneCondition memory temp = beneficiary.milestones[j];
                    beneficiary.milestones[j] = beneficiary.milestones[j + 1];
                    beneficiary.milestones[j + 1] = temp;
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
        string[] storage memorials = s.ritualStates[user].memorials;
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