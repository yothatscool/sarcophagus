// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VereavementConstants
 * @author yothatscool
 * @notice Constants used throughout the Vereavement protocol
 */
library VereavementConstants {
    // Time constants
    uint256 public constant MIN_INACTIVITY_THRESHOLD = 30 days;
    uint256 public constant DEFAULT_CHALLENGE_PERIOD = 14 days;
    uint256 public constant MIN_CHALLENGE_PERIOD = 7 days;
    uint256 public constant MAX_CHALLENGE_PERIOD = 30 days;
    
    // Percentage constants (in basis points)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_PERCENTAGE = 100; // 1%
    uint256 public constant MAX_PERCENTAGE = 10000; // 100%
    
    // Error messages
    string public constant ERR_INVALID_ADDRESS = "Invalid address";
    string public constant ERR_INVALID_AMOUNT = "Invalid amount";
    string public constant ERR_INVALID_PERCENTAGE = "Invalid percentage";
    string public constant ERR_UNAUTHORIZED = "Unauthorized";
    string public constant ERR_INVALID_STATE = "Invalid state";
    string public constant ERR_OPERATION_FAILED = "Operation failed";
    string public constant ERR_NO_RITUAL = "No active ritual";
    
    // Ritual constants
    uint256 public constant RITUAL_POWER_MULTIPLIER = 100;
    uint256 public constant MIN_RITUAL_POWER = 1;
    uint256 public constant MAX_RITUAL_POWER = 100;
    uint256 public constant RITUAL_GROWTH_RATE = 5; // 5% per year
    uint256 public constant RITUAL_DECAY_RATE = 2; // 2% per year
    
    // Carbon offset constants
    uint256 public constant MIN_CARBON_OFFSET = 1; // 1 metric ton
    uint256 public constant MAX_CARBON_OFFSET = 1000000; // 1M metric tons
    uint256 public constant CARBON_OFFSET_MULTIPLIER = 10;
    
    // Token constants
    uint256 public constant MIN_TOKEN_BALANCE = 1 ether;
    uint256 public constant MAX_TOKEN_BALANCE = 1000000 ether;
    uint256 public constant VTHO_GENERATION_RATE = 5; // VTHO per VET per day
    
    // Memorial constants
    uint256 public constant MAX_MEMORIAL_SIZE = 1024; // bytes
    uint256 public constant MAX_MEMORIALS_PER_USER = 100;
    
    // Beneficiary constants
    uint256 public constant MAX_BENEFICIARIES = 10;
    uint256 public constant MIN_AGE = 18;
    uint256 public constant MAX_AGE = 120;
    uint256 public constant MAX_MILESTONES = 20;
} 