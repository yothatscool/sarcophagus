// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./libraries/VereavementShared.sol";

/**
 * @title RoleManager
 * @dev Base contract for role management functionality
 */
contract RoleManager is AccessControl {
    using VereavementShared for *;

    // Role member tracking
    mapping(bytes32 => address[]) internal _roleMembers;
    mapping(address => mapping(bytes32 => uint256)) internal _roleMemberIndices;
    mapping(bytes32 => mapping(address => bool)) internal _suspendedMembers;
    mapping(bytes32 => mapping(address => address)) internal _roleDelegates;
    mapping(bytes32 => mapping(address => uint256)) internal _delegationExpiry;

    // Events
    event RoleMemberAdded(bytes32 indexed role, address indexed account);
    event RoleMemberRemoved(bytes32 indexed role, address indexed account);
    event RoleSuspended(bytes32 indexed role, address indexed account);
    event RoleUnsuspended(bytes32 indexed role, address indexed account);
    event RoleDelegated(bytes32 indexed role, address indexed delegator, address indexed delegate, uint256 expiry);
    event RoleDelegationRevoked(bytes32 indexed role, address indexed delegator, address indexed delegate);
    event RoleTransferRequested(bytes32 indexed role, address indexed from, address indexed to);
    event RoleTransferCompleted(bytes32 indexed role, address indexed from, address indexed to);
    event BatchRoleGranted(bytes32 indexed role, uint256 count);
    event BatchRoleRevoked(bytes32 indexed role, uint256 count);
    event BatchRoleSuspended(bytes32 indexed role, uint256 count);
    event BatchRoleUnsuspended(bytes32 indexed role, uint256 count);

    /**
     * @dev Add a new role member
     */
    function _addRoleMember(bytes32 role, address account) internal {
        require(account != address(0), "Invalid address");
        require(!hasRole(role, account), "Already has role");
        
        _roleMembers[role].push(account);
        _roleMemberIndices[account][role] = _roleMembers[role].length - 1;
        _grantRole(role, account);
        
        emit RoleMemberAdded(role, account);
    }
    
    /**
     * @dev Remove a role member
     */
    function _removeRoleMember(bytes32 role, address account) internal {
        require(hasRole(role, account), "Does not have role");
        require(account != msg.sender, "Cannot remove self");
        
        uint256 index = _roleMemberIndices[account][role];
        uint256 lastIndex = _roleMembers[role].length - 1;
        
        if (index != lastIndex) {
            address lastMember = _roleMembers[role][lastIndex];
            _roleMembers[role][index] = lastMember;
            _roleMemberIndices[lastMember][role] = index;
        }
        
        _roleMembers[role].pop();
        delete _roleMemberIndices[account][role];
        _revokeRole(role, account);
        
        emit RoleMemberRemoved(role, account);
    }

    /**
     * @dev Add multiple role members in batch
     */
    function _addRoleMembersBatch(bytes32 role, address[] memory accounts) internal {
        for (uint256 i = 0; i < accounts.length; i++) {
            _addRoleMember(role, accounts[i]);
        }
        emit BatchRoleGranted(role, accounts.length);
    }

    /**
     * @dev Remove multiple role members in batch
     */
    function _removeRoleMembersBatch(bytes32 role, address[] memory accounts) internal {
        for (uint256 i = 0; i < accounts.length; i++) {
            _removeRoleMember(role, accounts[i]);
        }
        emit BatchRoleRevoked(role, accounts.length);
    }

    /**
     * @dev Suspend multiple role members in batch
     */
    function _suspendRoleMembersBatch(bytes32 role, address[] memory accounts) internal {
        for (uint256 i = 0; i < accounts.length; i++) {
            require(hasRole(role, accounts[i]), "Does not have role");
            require(!_suspendedMembers[role][accounts[i]], "Already suspended");
            require(accounts[i] != msg.sender, "Cannot suspend self");
            _suspendedMembers[role][accounts[i]] = true;
            emit RoleSuspended(role, accounts[i]);
        }
        emit BatchRoleSuspended(role, accounts.length);
    }

    /**
     * @dev Unsuspend multiple role members in batch
     */
    function _unsuspendRoleMembersBatch(bytes32 role, address[] memory accounts) internal {
        for (uint256 i = 0; i < accounts.length; i++) {
            require(hasRole(role, accounts[i]), "Does not have role");
            require(_suspendedMembers[role][accounts[i]], "Already unsuspended");
            _suspendedMembers[role][accounts[i]] = false;
            emit RoleUnsuspended(role, accounts[i]);
        }
        emit BatchRoleUnsuspended(role, accounts.length);
    }

    /**
     * @dev Get role members
     */
    function _getRoleMembers(bytes32 role) internal view returns (address[] memory active, address[] memory suspended) {
        uint256 totalMembers = _roleMembers[role].length;
        uint256 activeCount = 0;
        uint256 suspendedCount = 0;
        
        // Count active and suspended members
        for (uint256 i = 0; i < totalMembers; i++) {
            if (_suspendedMembers[role][_roleMembers[role][i]]) {
                suspendedCount++;
            } else {
                activeCount++;
            }
        }
        
        // Initialize arrays
        active = new address[](activeCount);
        suspended = new address[](suspendedCount);
        
        // Fill arrays
        uint256 activeIndex = 0;
        uint256 suspendedIndex = 0;
        for (uint256 i = 0; i < totalMembers; i++) {
            address member = _roleMembers[role][i];
            if (_suspendedMembers[role][member]) {
                suspended[suspendedIndex++] = member;
            } else {
                active[activeIndex++] = member;
            }
        }
    }

    /**
     * @dev Get role information
     */
    function _getRoleInfo(bytes32 role, address account) internal view returns (
        bool hasRole_,
        bool isSuspended,
        address delegatedBy,
        uint256 delegationExpiry
    ) {
        hasRole_ = hasRole(role, account);
        isSuspended = _suspendedMembers[role][account];
        
        // Find delegation info
        for (uint256 i = 0; i < _roleMembers[role].length; i++) {
            address member = _roleMembers[role][i];
            if (_roleDelegates[role][member] == account) {
                delegatedBy = member;
                delegationExpiry = _delegationExpiry[role][member];
                break;
            }
        }
    }

    /**
     * @dev Override hasRole to check suspension status
     */
    function hasRole(bytes32 role, address account) public view virtual override returns (bool) {
        return super.hasRole(role, account) && !_suspendedMembers[role][account];
    }
} 