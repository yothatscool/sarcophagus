// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IVereavementAccess.sol";
import "./interfaces/IAgeVerification.sol";
import "./interfaces/ITokenManager.sol";
import "./interfaces/IMilestoneManager.sol";
import "./interfaces/IVTHOManager.sol";
import "./interfaces/IVNSResolver.sol";
import "./interfaces/IRitualEngine.sol";
import "./libraries/VereavementStorage.sol";
import "./libraries/VereavementLib.sol";
import "./VereavementBase.sol";

/**
 * @title Vereavement
 * @author yothatscool
 * @notice Main contract for the Vereavement protocol
 * @dev Implements core functionality and coordinates with specialized contracts
 */
contract Vereavement is VereavementBase {
    // Specialized contract interfaces
    IVereavementAccess public immutable accessControl;
    IAgeVerification public immutable ageVerification;
    ITokenManager public immutable tokenManager;
    IMilestoneManager public immutable milestoneManager;

    // Events
    event ContractInitialized(
        address indexed accessControl,
        address indexed ageVerification,
        address indexed tokenManager
    );
    event MilestoneManagerSet(address indexed manager);
    event VaultCreated(address indexed owner, string name);
    event VaultUpdated(address indexed owner, string newName);
    event BeneficiaryAdded(address indexed vault, address indexed beneficiary, uint256 share);
    event BeneficiaryRemoved(address indexed vault, address indexed beneficiary);

    constructor(
        address _accessControl,
        address _ageVerification,
        address _tokenManager,
        address _milestoneManager,
        address _vthoManager,
        address _vnsResolver,
        address _ritualEngine
    ) VereavementBase(_vthoManager, _vnsResolver, _ritualEngine) {
        require(_accessControl != address(0), "Invalid access control address");
        require(_ageVerification != address(0), "Invalid age verification address");
        require(_tokenManager != address(0), "Invalid token manager address");
        require(_milestoneManager != address(0), "Invalid milestone manager address");

        accessControl = IVereavementAccess(_accessControl);
        ageVerification = IAgeVerification(_ageVerification);
        tokenManager = ITokenManager(_tokenManager);
        milestoneManager = IMilestoneManager(_milestoneManager);

        emit ContractInitialized(_accessControl, _ageVerification, _tokenManager);
        emit MilestoneManagerSet(_milestoneManager);
    }

    /**
     * @notice Initialize a new vault and ritual state
     */
    function initialize() external whenNotPaused {
        require(!_isRegistered(msg.sender), "Already registered");

        _initializeVault(msg.sender);
        _initializeRitualState(msg.sender);
    }

    /**
     * @notice Add a beneficiary to the vault
     * @param beneficiary Address of the beneficiary
     * @param percentage Percentage share for the beneficiary
     */
    function addBeneficiary(address beneficiary, uint256 percentage) external whenNotPaused {
        require(beneficiary != address(0), "Invalid beneficiary address");
        require(percentage > 0 && percentage <= 100, "Invalid percentage");

        VereavementStorage.Vault storage vault = _storage().vaults[msg.sender];
        require(!vault.isLocked, "Vault is locked");

        uint256 totalPercentage = percentage;
        for (uint256 i = 0; i < vault.beneficiaries.length; i++) {
            totalPercentage += vault.beneficiaries[i].percentage;
        }
        require(totalPercentage <= 100, "Total percentage exceeds 100");

        vault.beneficiaries.push(VereavementStorage.Beneficiary({
            recipient: beneficiary,
            percentage: percentage,
            vestingDuration: 0,
            isConditional: false,
            condition: "",
            isApproved: false,
            paidAmount: 0,
            conditionMet: false,
            ageVesting: VereavementStorage.AgeBasedVesting({
                fullAccessAge: 0,
                monthlyAllowance: 0,
                guardian: address(0),
                guardianBalance: 0
            }),
            milestones: new VereavementStorage.MilestoneCondition[](0)
        }));

        emit BeneficiaryAdded(msg.sender, beneficiary, percentage);
    }

    /**
     * @notice Remove a beneficiary from the vault
     * @param beneficiary Address of the beneficiary
     */
    function removeBeneficiary(address beneficiary) external whenNotPaused {
        require(beneficiary != address(0), "Invalid beneficiary address");

        VereavementStorage.Vault storage vault = _storage().vaults[msg.sender];
        require(!vault.isLocked, "Vault is locked");

        bool found = false;
        uint256 index;
        for (uint256 i = 0; i < vault.beneficiaries.length; i++) {
            if (vault.beneficiaries[i].recipient == beneficiary) {
                found = true;
                index = i;
                break;
            }
        }
        require(found, "Beneficiary not found");

        // Remove beneficiary by swapping with the last element and popping
        if (index != vault.beneficiaries.length - 1) {
            vault.beneficiaries[index] = vault.beneficiaries[vault.beneficiaries.length - 1];
        }
        vault.beneficiaries.pop();

        emit BeneficiaryRemoved(msg.sender, beneficiary);
    }

    // Override storage function to use base implementation
    function _storage() internal pure returns (VereavementStorage.Layout storage) {
        return super._storage();
    }

    // Additional functions for milestone and token management...
}
