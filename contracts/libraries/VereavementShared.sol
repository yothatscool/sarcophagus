// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library VereavementShared {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant MEDIATOR_ROLE = keccak256("MEDIATOR_ROLE");
    
    // VeChain ecosystem token addresses
    address public constant VTHO = 0x0000000000000000000000000000456E65726779;
    address public constant B3TR = 0x0000000000000000000000000000423354520000; // B3TR token address

    // Custom errors for better gas efficiency
    error InvalidAddress(address addr);
    error InvalidAmount(uint256 amount);
    error InvalidPercentage(uint256 percentage);
    error UnauthorizedAccess(address caller);
    error InvalidState(string reason);
    error OperationFailed(string reason);

    // Role management errors
    error RoleNotFound(bytes32 role);
    error RoleAlreadyExists(bytes32 role);
    error RoleMemberNotFound(bytes32 role, address account);
    error RoleMemberAlreadyExists(bytes32 role, address account);
    error RoleSuspended(bytes32 role, address account);
    error RoleTransferInProgress(bytes32 role, address from, address to);
    error RoleTransferNotFound(bytes32 role, address from, address to);
    error RoleTransferExpired(bytes32 role, address from, address to);
    error RoleDelegationNotAllowed(bytes32 role, address from, address to);
    error RoleDelegationExpired(bytes32 role, address from, address to);
} 