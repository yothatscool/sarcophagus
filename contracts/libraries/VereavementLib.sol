// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VereavementConstants.sol";
import "./VereavementStorage.sol";
import "./VereavementShared.sol";

/**
 * @title VereavementLib
 * @author yothatscool
 * @notice Library for core Vereavement protocol functions
 * @dev Gas optimized using unchecked blocks and memory caching
 */
library VereavementLib {
    using VereavementStorage for VereavementStorage.Layout;
    using VereavementShared for *;

    // Core functions
    function validateAddress(address addr) internal pure {
        require(addr != address(0), VereavementConstants.ERR_INVALID_ADDRESS);
    }

    function validateAmount(uint256 amount) internal pure {
        require(amount > 0, VereavementConstants.ERR_INVALID_AMOUNT);
    }

    function validatePercentage(uint256 percentage) internal pure {
        require(
            percentage > 0 && percentage <= VereavementConstants.BASIS_POINTS,
            VereavementConstants.ERR_INVALID_PERCENTAGE
        );
    }

    // Vault management with gas optimizations
    function createVault(
        VereavementStorage.Layout storage s,
        address user,
        address[] memory beneficiaries,
        uint256[] memory percentages
    ) internal {
        require(beneficiaries.length == percentages.length, "Array length mismatch");
        require(beneficiaries.length > 0, "No beneficiaries");
        require(beneficiaries.length <= VereavementConstants.MAX_BENEFICIARIES, "Too many beneficiaries");

        uint256 totalPercentage;
        unchecked {
            for (uint256 i = 0; i < beneficiaries.length; i++) {
                validateAddress(beneficiaries[i]);
                validatePercentage(percentages[i]);
                totalPercentage += percentages[i];
            }
        }
        require(totalPercentage == VereavementConstants.BASIS_POINTS, "Invalid total percentage");

        VereavementStorage.Vault storage vault = s.vaults[user];
        vault.lastActivityTime = block.timestamp;
    }

    // Token management with gas optimizations
    function addToken(
        VereavementStorage.Layout storage s,
        address user,
        address token
    ) internal {
        validateAddress(token);
        VereavementStorage.TokenBalance storage tokenBalance = s.vaults[user].tokenBalances[token];
        require(!tokenBalance.isEnabled, "Token already added");

        tokenBalance.isEnabled = true;
        s.vaults[user].supportedTokens.push(token);
    }

    function removeToken(
        VereavementStorage.Layout storage s,
        address user,
        address token
    ) internal {
        validateAddress(token);
        VereavementStorage.TokenBalance storage tokenBalance = s.vaults[user].tokenBalances[token];
        require(tokenBalance.isEnabled, "Token not enabled");
        require(tokenBalance.balance == 0, "Balance not zero");

        tokenBalance.isEnabled = false;
    }

    // Death and inheritance with gas optimizations
    function confirmDeath(
        VereavementStorage.Layout storage s,
        address user,
        address oracle
    ) internal {
        VereavementStorage.Vault storage vault = s.vaults[user];
        require(!vault.isDeceased, "Already deceased");
        require(!vault.hasConfirmed[oracle], "Already confirmed");

        vault.hasConfirmed[oracle] = true;
        unchecked {
            vault.deathConfirmations++;
        }
    }

    function processPayout(
        VereavementStorage.Layout storage s,
        address user,
        address beneficiary
    ) internal returns (uint256) {
        VereavementStorage.Vault storage vault = s.vaults[user];
        require(vault.isDeceased, "Not deceased");
        
        uint256 amount;
        VereavementStorage.Beneficiary[] storage beneficiaries = vault.beneficiaries;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].recipient == beneficiary) {
                unchecked {
                    amount = (vault.balance * beneficiaries[i].percentage) / VereavementConstants.BASIS_POINTS;
                }
                break;
            }
        }
        require(amount > 0, "No allocation found");

        unchecked {
            vault.balance -= amount;
        }
        return amount;
    }

    // Ritual state management with gas optimizations
    function initializeRitualState(
        VereavementStorage.Layout storage s,
        address user
    ) internal {
        VereavementStorage.RitualState storage state = s.ritualStates[user];
        state.isActive = true;
        state.lastUpdate = uint32(block.timestamp);
        state.lastAction = uint32(block.timestamp);
        state.actionCount = 0;
        state.longevityScore = 0;
        state.carbonOffset = 0;
        state.totalValue = 0;
    }

    function isRitualActive(
        VereavementStorage.Layout storage s,
        address user
    ) internal view returns (bool) {
        return s.ritualStates[user].isActive;
    }

    function getRitualValue(
        VereavementStorage.Layout storage s,
        address user
    ) internal view returns (uint256) {
        return s.ritualStates[user].totalValue;
    }

    function initializeVault(
        VereavementStorage.Layout storage s,
        address user
    ) internal {
        VereavementStorage.Vault storage vault = s.vaults[user];
        vault.balance = 0;
        vault.minimumBalance = 0;
        vault.lastActivityTime = block.timestamp;
        vault.inactivityThreshold = s.treasuryConfig.defaultInactivityThreshold;
        vault.hasCustomInactivityThreshold = false;
        vault.isLocked = false;
        vault.isDeceased = false;
        vault.deathTimestamp = 0;
        vault.deathConfirmations = 0;
        vault.inChallengePeriod = false;
        vault.challengeEndTime = 0;
        vault.emergencyContact = address(0);
    }

    // Batch update helper functions
    function batchUpdateRitualState(
        VereavementStorage.Layout storage s,
        address user,
        uint256 newValue,
        uint256 carbonOffset,
        uint256 longevityScore
    ) internal {
        VereavementStorage.RitualState storage state = s.ritualStates[user];
        state.totalValue = uint224(newValue);
        state.carbonOffset = uint96(carbonOffset);
        state.longevityScore = uint96(longevityScore);
        state.lastUpdate = uint32(block.timestamp);
        state.lastAction = uint32(block.timestamp);
        unchecked {
            state.actionCount++;
        }
    }

    function batchUpdateVaultState(
        VereavementStorage.Layout storage s,
        address user,
        uint256 newBalance,
        uint256 minimumBalance,
        bool isLocked
    ) internal {
        VereavementStorage.Vault storage vault = s.vaults[user];
        vault.balance = newBalance;
        vault.minimumBalance = minimumBalance;
        vault.isLocked = isLocked;
        vault.lastActivityTime = block.timestamp;
    }
} 