// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IVereavementAccess
 * @author yothatscool
 * @notice Interface for managing access control between Vereavement contracts
 */
interface IVereavementAccess {
    /**
     * @notice Emitted when a contract is authorized
     * @param contractAddress Address of the authorized contract
     * @param contractType Type of the contract (e.g., "AgeVerification", "TokenManager", etc.)
     */
    event ContractAuthorized(address indexed contractAddress, string contractType);

    /**
     * @notice Emitted when a contract is deauthorized
     * @param contractAddress Address of the deauthorized contract
     * @param contractType Type of the contract
     */
    event ContractDeauthorized(address indexed contractAddress, string contractType);

    /**
     * @notice Emitted when a contract's permissions are updated
     * @param contractAddress Address of the contract
     * @param permission Permission type
     * @param isGranted Whether the permission is granted or revoked
     */
    event ContractPermissionUpdated(address indexed contractAddress, bytes32 indexed permission, bool isGranted);

    /**
     * @notice Check if a contract is authorized
     * @param contractAddress Address of the contract to check
     * @return bool Whether the contract is authorized
     */
    function isAuthorizedContract(address contractAddress) external view returns (bool);

    /**
     * @notice Check if a contract has a specific permission
     * @param contractAddress Address of the contract to check
     * @param permission Permission identifier
     * @return bool Whether the contract has the permission
     */
    function hasPermission(address contractAddress, bytes32 permission) external view returns (bool);

    /**
     * @notice Authorize a new contract
     * @param contractAddress Address of the contract to authorize
     * @param contractType Type of the contract
     */
    function authorizeContract(address contractAddress, string calldata contractType) external;

    /**
     * @notice Deauthorize a contract
     * @param contractAddress Address of the contract to deauthorize
     * @param contractType Type of the contract
     */
    function deauthorizeContract(address contractAddress, string calldata contractType) external;

    /**
     * @notice Grant a permission to a contract
     * @param contractAddress Address of the contract
     * @param permission Permission identifier
     */
    function grantPermission(address contractAddress, bytes32 permission) external;

    /**
     * @notice Revoke a permission from a contract
     * @param contractAddress Address of the contract
     * @param permission Permission identifier
     */
    function revokePermission(address contractAddress, bytes32 permission) external;

    /**
     * @notice Get all permissions for a contract
     * @param contractAddress Address of the contract
     * @return permissions Array of permission identifiers
     */
    function getContractPermissions(address contractAddress) external view returns (bytes32[] memory permissions);

    /**
     * @notice Get contract type
     * @param contractAddress Address of the contract
     * @return contractType Type of the contract
     */
    function getContractType(address contractAddress) external view returns (string memory contractType);
} 