// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IPriceOracle.sol";

contract MockPriceOracle is IPriceOracle {
    mapping(address => mapping(address => uint256)) public conversionRates;
    mapping(address => uint256) public tokenPrices;
    mapping(address => mapping(address => bool)) public supportedPairs;
    mapping(address => uint256) public priceTimestamps;
    
    address public constant VET = address(0);
    address public constant VTHO = address(0x0000000000000000456E65726779);
    address public constant B3TR = address(0x0000000000000000000000000000000000000001);
    address public constant OBOL = address(0x0000000000000000000000000000000000000002);
    address public constant GLO = address(0x0000000000000000000000000000000000000003);
    
    uint256 public constant MAX_PRICE_AGE = 3600;
    
    constructor() {
        conversionRates[VET][VET] = 1e18;
        tokenPrices[VET] = 1e18;
        priceTimestamps[VET] = block.timestamp;
        
        conversionRates[VET][VTHO] = 1000e18;
        conversionRates[VTHO][VET] = 1e15;
        tokenPrices[VTHO] = 1e15;
        priceTimestamps[VTHO] = block.timestamp;
        
        conversionRates[VET][B3TR] = 10e18;
        conversionRates[B3TR][VET] = 1e17;
        tokenPrices[B3TR] = 1e17;
        priceTimestamps[B3TR] = block.timestamp;
        
        conversionRates[VET][OBOL] = 100e18;
        conversionRates[OBOL][VET] = 1e16;
        tokenPrices[OBOL] = 1e16;
        priceTimestamps[OBOL] = block.timestamp;
        
        conversionRates[VET][GLO] = 1e18;
        conversionRates[GLO][VET] = 1e18;
        tokenPrices[GLO] = 1e18;
        priceTimestamps[GLO] = block.timestamp;
        
        supportedPairs[VET][VTHO] = true;
        supportedPairs[VET][B3TR] = true;
        supportedPairs[VET][OBOL] = true;
        supportedPairs[VET][GLO] = true;
        supportedPairs[VTHO][VET] = true;
        supportedPairs[VTHO][B3TR] = true;
        supportedPairs[VTHO][OBOL] = true;
        supportedPairs[VTHO][GLO] = true;
        supportedPairs[B3TR][VET] = true;
        supportedPairs[B3TR][VTHO] = true;
        supportedPairs[B3TR][OBOL] = true;
        supportedPairs[B3TR][GLO] = true;
        supportedPairs[OBOL][VET] = true;
        supportedPairs[OBOL][VTHO] = true;
        supportedPairs[OBOL][B3TR] = true;
        supportedPairs[OBOL][GLO] = true;
        supportedPairs[GLO][VET] = true;
        supportedPairs[GLO][VTHO] = true;
        supportedPairs[GLO][B3TR] = true;
        supportedPairs[GLO][OBOL] = true;
    }
    
    function getConversionRate(address fromToken, address toToken, uint256 amount) external view override returns (uint256) {
        if (!supportedPairs[fromToken][toToken]) return 0;
        return (amount * conversionRates[fromToken][toToken]) / 1e18;
    }
    
    function getTokenPrice(address token) external view override returns (uint256) {
        return tokenPrices[token];
    }
    
    function isSupported(address fromToken, address toToken) external view override returns (bool) {
        return supportedPairs[fromToken][toToken];
    }
    
    function getPrice(address token) external view override returns (uint256 price, uint256 timestamp, bool valid) {
        price = tokenPrices[token];
        timestamp = priceTimestamps[token];
        valid = (block.timestamp - timestamp) <= MAX_PRICE_AGE;
    }
    
    function getPriceRatio(address fromToken, address toToken) external view override returns (uint256 price, bool valid) {
        if (!supportedPairs[fromToken][toToken]) return (0, false);
        price = conversionRates[fromToken][toToken];
        valid = true;
    }
    
    function getMaxPriceAge() external view override returns (uint256 maxAge) {
        return MAX_PRICE_AGE;
    }
    
    function setConversionRate(address fromToken, address toToken, uint256 rate) external {
        conversionRates[fromToken][toToken] = rate;
        supportedPairs[fromToken][toToken] = true;
    }
    
    function setTokenPrice(address token, uint256 price) external {
        tokenPrices[token] = price;
        priceTimestamps[token] = block.timestamp;
    }
}
