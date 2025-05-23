// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IVereavementAccess.sol";

/**
 * @title VereavementAccess
 * @author yothatscool
 * @notice Manages access control between Vereavement contracts
 * @dev Implements contract authorization and permission management
 */
contract VereavementAccess is IVereavementAccess, AccessControl {
    // Contract authorization storage
    mapping(address => bool) private authorizedContracts;
    mapping(address => string) private contractTypes;
    mapping(address => bytes32[]) private contractPermissions;
    mapping(address => mapping(bytes32 => bool)) private permissions;

    // Permission constants
    bytes32 public constant STORAGE_WRITE_PERMISSION = keccak256("STORAGE_WRITE");
    bytes32 public constant STORAGE_READ_PERMISSION = keccak256("STORAGE_READ");
    bytes32 public constant ROLE_ADMIN_PERMISSION = keccak256("ROLE_ADMIN");
    bytes32 public constant VAULT_ADMIN_PERMISSION = keccak256("VAULT_ADMIN");

    // Custom errors
    error ContractNotAuthorized(address contractAddress);
    error ContractAlreadyAuthorized(address contractAddress);
    error InvalidContractAddress(address contractAddress);
    error PermissionAlreadyGranted(address contractAddress, bytes32 permission);
    error PermissionNotGranted(address contractAddress, bytes32 permission);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Check if a contract is authorized
     * @param contractAddress Address of the contract to check
     * @return bool Whether the contract is authorized
     */
    function isAuthorizedContract(address contractAddress) external view returns (bool) {
        return authorizedContracts[contractAddress];
    }

    /**
     * @notice Check if a contract has a specific permission
     * @param contractAddress Address of the contract to check
     * @param permission Permission identifier
     * @return bool Whether the contract has the permission
     */
    function hasPermission(address contractAddress, bytes32 permission) external view returns (bool) {
        return permissions[contractAddress][permission];
    }

    /**
     * @notice Authorize a new contract
     * @param contractAddress Address of the contract to authorize
     * @param contractType Type of the contract
     */
    function authorizeContract(address contractAddress, string calldata contractType) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (contractAddress == address(0)) revert InvalidContractAddress(contractAddress);
        if (authorizedContracts[contractAddress]) revert ContractAlreadyAuthorized(contractAddress);

        authorizedContracts[contractAddress] = true;
        contractTypes[contractAddress] = contractType;

        emit ContractAuthorized(contractAddress, contractType);
    }

    /**
     * @notice Deauthorize a contract
     * @param contractAddress Address of the contract to deauthorize
     * @param contractType Type of the contract
     */
    function deauthorizeContract(address contractAddress, string calldata contractType) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!authorizedContracts[contractAddress]) revert ContractNotAuthorized(contractAddress);

        authorizedContracts[contractAddress] = false;
        
        // Clear all permissions
        bytes32[] storage perms = contractPermissions[contractAddress];
        for (uint256 i = 0; i < perms.length; i++) {
            permissions[contractAddress][perms[i]] = false;
        }
        delete contractPermissions[contractAddress];
        delete contractTypes[contractAddress];

        emit ContractDeauthorized(contractAddress, contractType);
    }

    /**
     * @notice Grant a permission to a contract
     * @param contractAddress Address of the contract
     * @param permission Permission identifier
     */
    function grantPermission(address contractAddress, bytes32 permission) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!authorizedContracts[contractAddress]) revert ContractNotAuthorized(contractAddress);
        if (permissions[contractAddress][permission]) revert PermissionAlreadyGranted(contractAddress, permission);

        permissions[contractAddress][permission] = true;
        contractPermissions[contractAddress].push(permission);

        emit ContractPermissionUpdated(contractAddress, permission, true);
    }

    /**
     * @notice Revoke a permission from a contract
     * @param contractAddress Address of the contract
     * @param permission Permission identifier
     */
    function revokePermission(address contractAddress, bytes32 permission) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!authorizedContracts[contractAddress]) revert ContractNotAuthorized(contractAddress);
        if (!permissions[contractAddress][permission]) revert PermissionNotGranted(contractAddress, permission);

        permissions[contractAddress][permission] = false;

        // Remove permission from array
        bytes32[] storage perms = contractPermissions[contractAddress];
        for (uint256 i = 0; i < perms.length; i++) {
            if (perms[i] == permission) {
                perms[i] = perms[perms.length - 1];
                perms.pop();
                break;
            }
        }

        emit ContractPermissionUpdated(contractAddress, permission, false);
    }

    /**
     * @notice Get all permissions for a contract
     * @param contractAddress Address of the contract
     * @return permissions Array of permission identifiers
     */
    function getContractPermissions(address contractAddress) external view returns (bytes32[] memory) {
        return contractPermissions[contractAddress];
    }

    /**
     * @notice Get contract type
     * @param contractAddress Address of the contract
     * @return contractType Type of the contract
     */
    function getContractType(address contractAddress) external view returns (string memory) {
        return contractTypes[contractAddress];
    }

    /**
     * @notice Modifier to check if a contract has a specific permission
     * @param permission Permission identifier
     */
    modifier hasPermissionModifier(bytes32 permission) {
        if (!permissions[msg.sender][permission]) revert PermissionNotGranted(msg.sender, permission);
        _;
    }
} 