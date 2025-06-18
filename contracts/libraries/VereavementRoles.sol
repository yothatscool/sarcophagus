// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VereavementRoles
 * @author yothatscool
 * @notice Library for role constants in the Vereavement protocol
 */
library VereavementRoles {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant MEDIATOR_ROLE = keccak256("MEDIATOR_ROLE");
} 