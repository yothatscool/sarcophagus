// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPriceOracle
 * @author yothatscool
 * @notice Interface for price oracle to get real-time token prices
 * @dev Used for calculating conversion rates in Sarcophagus vault
 */
interface IPriceOracle {
    /**
     * @dev Get the conversion rate from one token to another
     * @param fromToken The token to convert from
     * @param toToken The token to convert to
     * @param amount The amount to convert
     * @return The conversion rate (amount of toToken per fromToken)
     */
    function getConversionRate(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (uint256);
    
    /**
     * @dev Get the price of a token in VET (base currency)
     * @param token The token address
     * @return The price in VET (with 18 decimals)
     */
    function getTokenPrice(address token) external view returns (uint256);
    
    /**
     * @dev Check if the oracle supports a token pair
     * @param fromToken The token to convert from
     * @param toToken The token to convert to
     * @return True if the pair is supported
     */
    function isSupported(address fromToken, address toToken) external view returns (bool);
    
    /**
     * @notice Get the price of a token in USD (with 18 decimals)
     * @param token Address of the token
     * @return price Price in USD with 18 decimals
     * @return timestamp Last update timestamp
     * @return valid Whether the price is valid (not stale)
     */
    function getPrice(address token) external view returns (uint256 price, uint256 timestamp, bool valid);
    
    /**
     * @notice Get the price of a token relative to another token
     * @param fromToken Address of the token to convert from
     * @param toToken Address of the token to convert to
     * @return price Price ratio with 18 decimals
     * @return valid Whether the price is valid
     */
    function getPriceRatio(address fromToken, address toToken) external view returns (uint256 price, bool valid);
    
    /**
     * @notice Get the maximum age of a price before it's considered stale
     * @return maxAge Maximum age in seconds
     */
    function getMaxPriceAge() external view returns (uint256 maxAge);
} 