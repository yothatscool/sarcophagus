// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ITokenManager
 * @author yothatscool
 * @notice Interface for the TokenManager contract
 */
interface ITokenManager {
    /**
     * @notice Emitted when a token is added to a vault
     * @param token Address of the token
     * @param vault Address of the vault
     */
    event TokenAdded(address indexed token, address indexed vault);

    /**
     * @notice Emitted when a token is removed from a vault
     * @param token Address of the token
     * @param vault Address of the vault
     */
    event TokenRemoved(address indexed token, address indexed vault);

    /**
     * @notice Emitted when VTHO is distributed
     * @param user Address of the user
     * @param amount Amount distributed
     */
    event VTHODistributed(address indexed user, uint256 amount);

    /**
     * @notice Emitted when B3TR token address is updated
     * @param oldAddress Previous token address
     * @param newAddress New token address
     */
    event B3TRTokenUpdated(address indexed oldAddress, address indexed newAddress);

    /**
     * @notice Emitted when token status is updated
     * @param token Address of the token
     * @param user Address of the user
     * @param isEnabled New status
     */
    event TokenStatusUpdated(address indexed token, address indexed user, bool isEnabled);

    /**
     * @notice Emitted when tokens are deposited
     * @param token Address of the token
     * @param user Address of the user
     * @param amount Amount deposited
     */
    event TokenDeposited(address indexed token, address indexed user, uint256 amount);

    /**
     * @notice Add a new token to the vault
     * @param tokenAddress Address of the token contract
     */
    function addToken(address tokenAddress) external;

    /**
     * @notice Enable or disable supported token
     * @param tokenAddress Address of the token to enable/disable
     * @param isEnabled Whether to enable or disable the token
     */
    function setTokenStatus(address tokenAddress, bool isEnabled) external;

    /**
     * @notice Deposit supported token
     * @param tokenAddress Address of the token to deposit
     * @param amount Amount to deposit
     */
    function depositToken(address tokenAddress, uint256 amount) external;

    /**
     * @notice Claim VTHO generated from VET holdings
     */
    function claimVTHO() external;

    /**
     * @notice Update B3TR token address
     * @param newAddress New B3TR token address
     */
    function updateB3TRToken(address newAddress) external;

    /**
     * @notice Get token balance for a user
     * @param user Address of the user
     * @param tokenAddress Address of the token
     * @return balance Token balance
     */
    function getTokenBalance(address user, address tokenAddress) external view returns (uint256);

    /**
     * @notice Get supported tokens for a user
     * @param user Address of the user
     * @return Array of supported token addresses
     */
    function getSupportedTokens(address user) external view returns (address[] memory);

    /**
     * @notice Get token status for a user
     * @param user Address of the user
     * @param tokenAddress Address of the token
     * @return isEnabled Whether token is enabled
     * @return isVthoEnabled Whether VTHO is enabled
     * @return isB3trEnabled Whether B3TR is enabled
     */
    function getTokenStatus(address user, address tokenAddress) external view returns (
        bool isEnabled,
        bool isVthoEnabled,
        bool isB3trEnabled
    );

    /**
     * @notice Get VTHO token address
     * @return Address of the VTHO token
     */
    function VTHO() external pure returns (address);

    /**
     * @notice Get B3TR token address
     * @return Address of the B3TR token
     */
    function b3trToken() external view returns (address);
} 