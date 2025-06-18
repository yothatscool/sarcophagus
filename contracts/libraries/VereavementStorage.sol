// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VereavementStorage
 * @author yothatscool
 * @notice Storage layout for the Vereavement protocol
 * @dev Gas optimized using struct packing and memory pooling
 */
library VereavementStorage {
    struct Layout {
        mapping(address => Vault) vaults;
        mapping(address => RitualState) ritualStates;
        TreasuryConfig treasuryConfig;
    }

    struct TreasuryConfig {
        uint96 flatWeeklyAllocation;
        uint96 totalTreasuryYield;
        uint8 minConfirmationsRequired;
        uint256 defaultInactivityThreshold;
        uint256 challengePeriod;
    }

    struct Vault {
        uint256 balance;
        uint256 minimumBalance;
        uint256 lastActivityTime;
        uint256 inactivityThreshold;
        bool hasCustomInactivityThreshold;
        bool isLocked;
        bool isDeceased;
        uint256 deathTimestamp;
        uint256 lastAllocated;
        uint8 deathConfirmations;
        bool inChallengePeriod;
        uint256 challengeEndTime;
        address emergencyContact;
        Beneficiary[] beneficiaries;
        ActivityProof[] activityHistory;
        mapping(address => TokenBalance) tokenBalances;
        address[] supportedTokens;
        mapping(address => bool) hasConfirmed;
    }

    struct RitualState {
        uint96 longevityScore;
        uint96 carbonOffset;
        uint32 lastUpdate;
        uint32 lastAction;
        uint32 actionCount;
        uint224 totalValue;
        bool isActive;
        string[] memorials;
    }

    struct TokenBalance {
        uint256 balance;
        bool isEnabled;
        bool isVthoEnabled;
        bool isB3trEnabled;
        uint256 reserved;
    }

    struct Beneficiary {
        address recipient;
        uint256 percentage;
        uint256 vestingDuration;
        bool isConditional;
        string condition;
        bool isApproved;
        uint256 paidAmount;
        bool conditionMet;
        AgeBasedVesting ageVesting;
        uint256 milestoneCount;
        mapping(uint256 => MilestoneCondition) milestones;
    }

    struct MilestoneCondition {
        uint128 amount;
        uint32 achievementDate;
        string description;
        bytes32 oracleKey;
        bool isAchieved;
    }

    struct AgeBasedVesting {
        uint32 fullAccessAge;
        uint96 monthlyAllowance;
        address guardian;
        uint256 guardianBalance;
    }

    struct ActivityProof {
        uint32 timestamp;
        uint8 proofType;
        string details;
    }

    // Memory variant of Vault struct for efficient returns in view functions
    struct VaultMemory {
        uint256 balance;
        uint256 minimumBalance;
        uint256 lastActivityTime;
        uint256 inactivityThreshold;
        bool hasCustomInactivityThreshold;
        bool isLocked;
        bool isDeceased;
        uint256 deathTimestamp;
        uint8 deathConfirmations;
        bool inChallengePeriod;
        uint256 challengeEndTime;
        address emergencyContact;
    }

    function getVault(Layout storage s, address user) internal view returns (Vault storage) {
        return s.vaults[user];
    }

    function getRitualState(Layout storage s, address user) internal view returns (RitualState storage) {
        return s.ritualStates[user];
    }
} 