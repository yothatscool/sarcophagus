// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IVIP180.sol";
import "./interfaces/IVNSResolver.sol";
import "./interfaces/IVTHOManager.sol";
import "./interfaces/IVereavementRitual.sol";
import "./interfaces/IRitualEngine.sol";
import "./interfaces/IVereavementAccess.sol";
import "./interfaces/IAgeVerification.sol";
import "./interfaces/ITokenManager.sol";
import "./interfaces/IMilestoneManager.sol";
import "./libraries/VereavementStorage.sol";
import "./libraries/VereavementConstants.sol";
import "./libraries/VereavementShared.sol";
import "./libraries/VereavementLib.sol";

/**
 * @title VereavementBase
 * @author yothatscool
 * @notice Base contract for Vereavement protocol with core functionality
 * @dev Implements basic access control, security features, and storage
 * @dev Gas optimized using immutable variables, storage caching, and unchecked blocks
 * 
 * Security Features:
 * - Reentrancy Guard: Prevents reentrant calls in critical functions
 * - Rate Limiting: Enforces cooldown periods between ritual updates (1 hour)
 * - Emergency Pause: Allows admins to pause contract in emergencies
 * - Access Control: Role-based access control for admin functions
 * 
 * Gas Optimizations:
 * - Immutable Constants: Uses immutable variables for fixed values
 * - Storage Caching: Minimizes storage reads by caching values
 * - Unchecked Math: Uses unchecked blocks for safe arithmetic
 * - Batch Updates: Combines multiple storage updates
 * - Memory Usage: Optimizes memory vs storage access
 */
abstract contract VereavementBase is AccessControl, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    using VereavementStorage for VereavementStorage.Layout;
    using VereavementShared for *;
    using VereavementLib for VereavementStorage.Layout;
    
    // Custom errors for gas optimization
    error InvalidAddress(address addr);
    error InvalidAmount(uint256 amount);
    error InvalidPercentage(uint256 percentage);
    error UnauthorizedAccess(address caller);
    error InvalidState(string reason);
    error OperationFailed(string reason);
    error RateLimitExceeded(uint256 nextAllowedTime);
    error NotRegistered();
    error NotEmergencyContact();
    error VaultLockedError();
    error NotMediator();
    error NotAdmin();
    error InvalidConfig();
    error InvalidTimestamp();
    error InvalidSignature();
    
    // Immutable state variables
    bytes32 public constant MEDIATOR_ROLE = keccak256("MEDIATOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    uint256 private immutable RITUAL_UPDATE_COOLDOWN;
    uint256 private immutable MAX_BATCH_SIZE;
    uint256 private immutable MIN_UPDATE_INTERVAL;
    
    // External contract references - immutable for gas savings
    IVTHOManager public immutable vthoManager;
    IVNSResolver public immutable vnsResolver;
    IRitualEngine public immutable ritualEngine;
    
    // Optimized storage packing
    struct RateLimit {
        uint32 lastUpdate;
        uint32 lastAction;
        uint32 actionCount;
        bool isActive;
    }
    
    // Storage mappings
    mapping(address => RateLimit) private rateLimits;
    
    // Events with indexed parameters for efficient filtering
    event EmergencyPaused(address indexed admin, uint256 timestamp);
    event EmergencyUnpaused(address indexed admin, uint256 timestamp);
    event RateLimitUpdated(address indexed user, uint32 timestamp, uint32 actionCount);
    event VaultInitialized(address indexed user, uint256 timestamp);
    event RitualStateInitialized(address indexed user, uint256 timestamp);
    event EmergencyContactUpdated(address indexed user, address indexed oldContact, address indexed newContact);
    event TokenEnabled(address indexed user, address indexed token, uint256 timestamp);
    event TokenDisabled(address indexed user, address indexed token, uint256 timestamp);
    event VaultLocked(address indexed user, uint256 timestamp);
    event VaultUnlocked(address indexed user, uint256 timestamp);
    event DeathConfirmed(address indexed user, address indexed confirmer, uint256 timestamp);
    event DeathChallenged(address indexed user, address indexed challenger, uint256 timestamp);
    event ChallengePeriodEnded(address indexed user, bool isDeceased, uint256 timestamp);
    
    constructor(
        address _vthoManager,
        address _vnsResolver,
        address _ritualEngine
    ) {
        if (_vthoManager == address(0) || _vnsResolver == address(0) || _ritualEngine == address(0)) 
            revert InvalidConfig();

        vthoManager = IVTHOManager(_vthoManager);
        vnsResolver = IVNSResolver(_vnsResolver);
        ritualEngine = IRitualEngine(_ritualEngine);
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Initialize immutable constants
        RITUAL_UPDATE_COOLDOWN = 1 hours;
        MAX_BATCH_SIZE = 100;
        MIN_UPDATE_INTERVAL = 1 days;
    }

    // Virtual storage layout with gas optimization
    VereavementStorage.Layout private _storageLayout;

    // Modifiers with gas optimizations
    modifier rateLimited() {
        RateLimit storage limit = rateLimits[msg.sender];
        uint32 timestamp = uint32(block.timestamp);
        
        unchecked {
            if (timestamp < limit.lastUpdate + uint32(RITUAL_UPDATE_COOLDOWN))
                revert RateLimitExceeded(uint256(limit.lastUpdate) + RITUAL_UPDATE_COOLDOWN);
            
            if (limit.actionCount >= MAX_BATCH_SIZE && 
                timestamp - limit.lastAction < 1 days)
                revert RateLimitExceeded(uint256(limit.lastAction) + 1 days);
        }
        
        limit.lastUpdate = timestamp;
        limit.actionCount++;
        limit.lastAction = timestamp;
        
        emit RateLimitUpdated(msg.sender, timestamp, limit.actionCount);
        _;
    }

    modifier onlyRegisteredUser() {
        if (_storageLayout.vaults[msg.sender].beneficiaries.length == 0) 
            revert NotRegistered();
        _;
    }

    modifier onlyEmergencyContact(address user) {
        if (msg.sender != _storageLayout.vaults[user].emergencyContact)
            revert NotEmergencyContact();
        _;
    }

    modifier notLocked(address user) {
        if (_storageLayout.vaults[user].isLocked)
            revert VaultLockedError();
        _;
    }

    modifier onlyMediator() {
        if (!hasRole(MEDIATOR_ROLE, msg.sender))
            revert NotMediator();
        _;
    }

    // Emergency functions with better error handling
    function emergencyPause() external {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert NotAdmin();
        _pause();
        emit EmergencyPaused(msg.sender, block.timestamp);
    }

    function emergencyUnpause() external {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert NotAdmin();
        _unpause();
        emit EmergencyUnpaused(msg.sender, block.timestamp);
    }

    // Internal helper functions with gas optimizations
    function _getStorage() internal view returns (VereavementStorage.Layout storage) {
        return _storageLayout;
    }

    function _validateAddress(address addr) internal pure {
        if (addr == address(0)) revert InvalidAddress(addr);
    }

    function _validateAmount(uint256 amount) internal pure {
        if (amount == 0) revert InvalidAmount(amount);
    }

    function _validatePercentage(uint256 percentage) internal pure {
        unchecked {
            if (percentage == 0 || percentage > VereavementConstants.BASIS_POINTS)
                revert InvalidPercentage(percentage);
        }
    }

    function _isRegistered(address user) internal view returns (bool) {
        return _storageLayout.vaults[user].beneficiaries.length > 0;
    }

    function _initializeVault(address user) internal {
        require(user != address(0), "Invalid address");
        require(!_isRegistered(user), "Already registered");

        VereavementStorage.Vault storage vault = _storageLayout.vaults[user];
        vault.emergencyContact = address(0);
        vault.isLocked = false;
        vault.lastActivityTime = block.timestamp;
        vault.inactivityThreshold = _storageLayout.treasuryConfig.defaultInactivityThreshold;
        vault.hasCustomInactivityThreshold = false;
        vault.isDeceased = false;
        vault.deathTimestamp = 0;
        vault.deathConfirmations = 0;
        vault.inChallengePeriod = false;
        vault.challengeEndTime = 0;

        emit VaultInitialized(user, block.timestamp);
    }

    function _initializeRitualState(address user) internal {
        require(user != address(0), "Invalid address");
        
        VereavementStorage.RitualState storage state = _storageLayout.ritualStates[user];
        state.isActive = true;
        state.lastUpdate = uint32(block.timestamp);
        state.lastAction = uint32(block.timestamp);
        state.actionCount = 0;
        state.longevityScore = 0;
        state.carbonOffset = 0;
        state.totalValue = 0;

        emit RitualStateInitialized(user, block.timestamp);
    }

    // View functions with gas optimizations
    function getRateLimitStatus(address user) external view returns (
        uint256 nextAllowedUpdate,
        uint256 actionCount,
        bool isActive
    ) {
        RateLimit storage limit = rateLimits[user];
        unchecked {
            nextAllowedUpdate = uint256(limit.lastUpdate) + RITUAL_UPDATE_COOLDOWN;
            actionCount = limit.actionCount;
            isActive = limit.isActive;
        }
    }

    function getRitualValue(address user) public view virtual returns (uint256) {
        return _storageLayout.ritualStates[user].totalValue;
    }

    function getTokenBalance(address user, address token) public view virtual returns (uint256) {
        if (token == address(0)) revert InvalidAddress(token);
        return IVIP180(token).balanceOf(user);
    }

    function isRitualActive(address user) public view virtual returns (bool) {
        return _storageLayout.ritualStates[user].isActive;
    }

    // Batch operations for gas efficiency
    function batchGetRitualValues(address[] calldata users) external view returns (uint256[] memory values) {
        uint256 length = users.length;
        if (length > MAX_BATCH_SIZE) revert InvalidAmount(length);
        
        values = new uint256[](length);
        for (uint256 i = 0; i < length;) {
            values[i] = getRitualValue(users[i]);
            unchecked { ++i; }
        }
    }

    function batchGetTokenBalances(
        address[] calldata users,
        address[] calldata tokens
    ) external view returns (uint256[][] memory balances) {
        uint256 userLength = users.length;
        uint256 tokenLength = tokens.length;
        if (userLength > MAX_BATCH_SIZE || tokenLength > MAX_BATCH_SIZE) 
            revert InvalidAmount(userLength > tokenLength ? userLength : tokenLength);
        
        balances = new uint256[][](userLength);
        for (uint256 i = 0; i < userLength;) {
            balances[i] = new uint256[](tokenLength);
            for (uint256 j = 0; j < tokenLength;) {
                balances[i][j] = getTokenBalance(users[i], tokens[j]);
                unchecked { ++j; }
            }
            unchecked { ++i; }
        }
    }
} 