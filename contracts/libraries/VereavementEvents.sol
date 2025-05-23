// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VereavementEvents
 * @author yothatscool
 * @notice Events emitted by the Vereavement protocol
 */
library VereavementEvents {
    // Vault events
    event VaultCreated(address indexed user);
    event VaultUpdated(address indexed user, uint256 balance);
    event VaultLocked(address indexed user);
    event VaultUnlocked(address indexed user);
    event VaultClosed(address indexed user);
    
    // Beneficiary events
    event BeneficiaryAdded(address indexed user, address indexed beneficiary, uint256 percentage);
    event BeneficiaryRemoved(address indexed user, address indexed beneficiary);
    event BeneficiaryUpdated(address indexed user, address indexed beneficiary, uint256 newPercentage);
    
    // Death and inheritance events
    event DeathConfirmed(address indexed user, address indexed oracle);
    event DeathChallenged(address indexed user, address indexed challenger);
    event ChallengeResolved(address indexed user, bool wasSuccessful);
    event InheritanceClaimed(address indexed user, address indexed beneficiary, uint256 amount);
    
    // Ritual events
    event RitualVaultCreated(address indexed user, uint256 initialValue);
    event RitualVaultUpdated(address indexed user, uint256 newValue);
    event RitualCompleted(address indexed user, string ritualType);
    event CarbonOffsetRecorded(address indexed user, uint256 amount, string source);
    event MemorialPreserved(address indexed user, string memorialHash);
    
    // Token events
    event TokenAdded(address indexed token, address indexed vault);
    event TokenRemoved(address indexed token, address indexed vault);
    event TokenDeposited(address indexed token, address indexed user, uint256 amount);
    event TokenWithdrawn(address indexed token, address indexed user, uint256 amount);
    
    // System events
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);
    event ConfigUpdated(string indexed parameter, uint256 value);
    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);
} 