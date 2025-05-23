// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IVIP180.sol";
import "./interfaces/IVTHOManager.sol";
import "./interfaces/ITokenManager.sol";
import "./libraries/VereavementShared.sol";
import "./libraries/VereavementStorage.sol";

/**
 * @title TokenManager
 * @author yothatscool
 * @notice Handles token management for the Vereavement protocol
 * @dev Manages VIP-180 tokens, VTHO generation, and B3TR token functionality
 */
contract TokenManager is ITokenManager, AccessControl, ReentrancyGuard {
    using VereavementShared for *;
    using VereavementStorage for VereavementStorage.Layout;
    using SafeERC20 for IERC20;

    // Custom errors for gas optimization
    error TokenNotSupported(address token);
    error TokenAlreadyEnabled(address token);
    error TokenNotEnabled(address token);
    error InsufficientBalance(uint256 required, uint256 available);
    error InvalidTokenAddress(address token);
    error InvalidAmount(uint256 amount);
    error InvalidState(string reason);
    error BatchSizeTooLarge();
    error ArrayLengthMismatch();

    // Optimized storage layout - single slot (256 bits)
    struct TokenState {
        uint96 balance;         // 96 bits - Up to 79,228,162,514 tokens
        uint32 lastUpdate;      // 32 bits - Timestamp
        uint32 lastClaim;       // 32 bits - Timestamp
        uint32 actionCount;     // 32 bits - Counter
        bool isEnabled;         // 8 bits
        bool isVthoEnabled;     // 8 bits
        bool isB3trEnabled;     // 8 bits
        uint8 flags;           // 8 bits - Reserved for future use
    }

    struct UserTokens {
        mapping(address => TokenState) tokenStates;
        address[] supportedTokens;
        uint32 lastAllocated;
        uint32 totalTokens;
    }

    // Constants
    uint256 private constant MAX_BATCH_SIZE = 100;
    uint256 private constant MIN_CLAIM_INTERVAL = 1 hours;
    uint256 private constant MAX_TOKENS_PER_USER = 1000;
    address private constant VTHO_ADDRESS = 0x0000000000000000000000000000456E65726779;

    // Storage
    mapping(address => UserTokens) private userTokens;
    mapping(address => mapping(address => bool)) private enabledTokens;
    mapping(address => mapping(address => uint256)) private tokenBalances;
    
    // Immutable addresses for gas savings
    address public immutable VTHO;
    address public immutable b3trToken;
    IVTHOManager public immutable vthoManager;

    // Events with indexed parameters
    event TokenAdded(address indexed user, address indexed token, uint32 timestamp);
    event TokenStatusUpdated(address indexed user, address indexed token, bool isEnabled);
    event TokenDeposited(address indexed user, address indexed token, uint256 amount);
    event VTHOClaimed(address indexed user, uint256 amount, uint32 timestamp);
    event B3TRUpdated(address indexed oldToken, address indexed newToken);

    constructor(address _vthoManager, address _b3trToken) {
        if (_vthoManager == address(0) || _b3trToken == address(0)) revert InvalidTokenAddress(address(0));

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        vthoManager = IVTHOManager(_vthoManager);
        VTHO = VTHO_ADDRESS;
        b3trToken = _b3trToken;
    }

    /**
     * @notice Batch add multiple tokens
     */
    function batchAddTokens(address[] calldata tokenAddresses) external nonReentrant {
        uint256 length = tokenAddresses.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        
        UserTokens storage userState = userTokens[msg.sender];
        if (userState.totalTokens + length > MAX_TOKENS_PER_USER) revert BatchSizeTooLarge();
        
        uint32 timestamp = uint32(block.timestamp);
        
        for (uint256 i = 0; i < length;) {
            _addToken(msg.sender, tokenAddresses[i], timestamp);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Add a single token
     */
    function addToken(address tokenAddress) external override nonReentrant {
        if (tokenAddress == address(0)) revert InvalidTokenAddress(tokenAddress);
        
        UserTokens storage userState = userTokens[msg.sender];
        if (userState.totalTokens >= MAX_TOKENS_PER_USER) revert BatchSizeTooLarge();
        
        _addToken(msg.sender, tokenAddress, uint32(block.timestamp));
    }

    /**
     * @notice Batch set token status
     */
    function batchSetTokenStatus(
        address[] calldata tokenAddresses,
        bool[] calldata statuses
    ) external nonReentrant {
        uint256 length = tokenAddresses.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        if (length != statuses.length) revert ArrayLengthMismatch();
        
        for (uint256 i = 0; i < length;) {
            _setTokenStatus(msg.sender, tokenAddresses[i], statuses[i]);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Set token status
     */
    function setTokenStatus(address tokenAddress, bool isEnabled) external override nonReentrant {
        _setTokenStatus(msg.sender, tokenAddress, isEnabled);
    }

    /**
     * @notice Batch deposit tokens
     */
    function batchDepositTokens(
        address[] calldata tokenAddresses,
        uint256[] calldata amounts
    ) external nonReentrant {
        uint256 length = tokenAddresses.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        if (length != amounts.length) revert ArrayLengthMismatch();
        
        for (uint256 i = 0; i < length;) {
            _depositToken(msg.sender, tokenAddresses[i], amounts[i]);
            unchecked { ++i; }
        }
    }

    /**
     * @notice Deposit token
     */
    function depositToken(address tokenAddress, uint256 amount) external override nonReentrant {
        _depositToken(msg.sender, tokenAddress, amount);
    }

    /**
     * @notice Claim VTHO
     */
    function claimVTHO() external override nonReentrant {
        UserTokens storage user = userTokens[msg.sender];
        TokenState storage vthoState = user.tokenStates[VTHO];
        
        // Check claim interval
        uint32 timestamp = uint32(block.timestamp);
        if (timestamp - vthoState.lastClaim < MIN_CLAIM_INTERVAL) revert InvalidState("Too soon to claim");
        
        if (address(vthoManager) == address(0)) revert InvalidState("VTHO manager not set");
        
        uint256 totalVET = address(this).balance;
        if (totalVET == 0) return;

        uint256 timeSinceLastClaim;
        unchecked {
            timeSinceLastClaim = timestamp - user.lastAllocated;
        }
        
        if (timeSinceLastClaim > 0) {
            uint256 vthoGenerated = vthoManager.distributeVTHO(
                msg.sender,
                totalVET,
                timeSinceLastClaim
            );
            
            if (vthoGenerated > 0) {
                user.lastAllocated = timestamp;
                vthoState.lastClaim = timestamp;
                vthoState.actionCount++;
                emit VTHOClaimed(msg.sender, vthoGenerated, timestamp);
            }
        }
    }

    /**
     * @notice Update B3TR token
     */
    function updateB3TRToken(address newAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newAddress == address(0)) revert InvalidTokenAddress(newAddress);
        address oldAddress = b3trToken;
        emit B3TRUpdated(oldAddress, newAddress);
    }

    // Internal functions
    function _addToken(address user, address token, uint32 timestamp) internal {
        UserTokens storage userState = userTokens[user];
        TokenState storage tokenState = userState.tokenStates[token];
        
        if (tokenState.isEnabled) revert TokenAlreadyEnabled(token);

        tokenState.isEnabled = true;
        tokenState.lastUpdate = timestamp;
        userState.supportedTokens.push(token);
        unchecked {
            userState.totalTokens++;
        }
        
        emit TokenAdded(user, token, timestamp);
    }

    function _setTokenStatus(address user, address token, bool isEnabled) internal {
        if (token != VTHO && token != b3trToken) revert TokenNotSupported(token);

        TokenState storage tokenState = userTokens[user].tokenStates[token];
        if (token == VTHO) {
            tokenState.isVthoEnabled = isEnabled;
        } else {
            tokenState.isB3trEnabled = isEnabled;
        }
        tokenState.lastUpdate = uint32(block.timestamp);
        
        emit TokenStatusUpdated(user, token, isEnabled);
    }

    function _depositToken(address user, address token, uint256 amount) internal {
        if (amount == 0) revert InvalidAmount(amount);
        if (token != VTHO && token != b3trToken) revert TokenNotSupported(token);

        TokenState storage tokenState = userTokens[user].tokenStates[token];
        if (token == VTHO) {
            if (!tokenState.isVthoEnabled) revert TokenNotEnabled(token);
        } else {
            if (!tokenState.isB3trEnabled) revert TokenNotEnabled(token);
        }

        unchecked {
            tokenState.balance = uint96(uint256(tokenState.balance) + amount);
            tokenState.actionCount++;
        }
        tokenState.lastUpdate = uint32(block.timestamp);

        IVIP180(token).transferFrom(user, address(this), amount);
        emit TokenDeposited(user, token, amount);
    }

    // View functions
    function getTokenBalance(address user, address token) external view override returns (uint256) {
        return userTokens[user].tokenStates[token].balance;
    }

    function getSupportedTokens(address user) external view override returns (address[] memory) {
        return userTokens[user].supportedTokens;
    }

    function getTokenStatus(
        address user,
        address token
    ) external view override returns (bool isEnabled, bool isVthoEnabled, bool isB3trEnabled) {
        TokenState storage tokenState = userTokens[user].tokenStates[token];
        return (
            tokenState.isEnabled,
            tokenState.isVthoEnabled,
            tokenState.isB3trEnabled
        );
    }

    // Batch view functions
    function batchGetTokenBalances(
        address user,
        address[] calldata tokens
    ) external view returns (uint256[] memory balances) {
        uint256 length = tokens.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        
        balances = new uint256[](length);
        for (uint256 i = 0; i < length;) {
            balances[i] = userTokens[user].tokenStates[tokens[i]].balance;
            unchecked { ++i; }
        }
    }

    function batchGetTokenStatuses(
        address user,
        address[] calldata tokens
    ) external view returns (
        bool[] memory enabled,
        bool[] memory vthoEnabled,
        bool[] memory b3trEnabled
    ) {
        uint256 length = tokens.length;
        if (length > MAX_BATCH_SIZE) revert BatchSizeTooLarge();
        
        enabled = new bool[](length);
        vthoEnabled = new bool[](length);
        b3trEnabled = new bool[](length);
        
        for (uint256 i = 0; i < length;) {
            TokenState storage state = userTokens[user].tokenStates[tokens[i]];
            enabled[i] = state.isEnabled;
            vthoEnabled[i] = state.isVthoEnabled;
            b3trEnabled[i] = state.isB3trEnabled;
            unchecked { ++i; }
        }
    }
} 