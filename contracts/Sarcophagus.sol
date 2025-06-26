// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/IDeathVerifier.sol";
import "./interfaces/IOBOL.sol";

/**
 * @title Sarcophagus - Phase 1
 * @author yothatscool
 * @notice Digital inheritance protocol with environmental rewards - Phase 1 Launch Version
 * @dev Core inheritance functionality without health tracking features
 */
contract Sarcophagus is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Custom errors for gas optimization
    error NotVerified();
    error SarcophagusNotExists();
    error SarcophagusAlreadyExists();
    error InsufficientBalance();
    error InvalidAmount();
    error InvalidBeneficiary();
    error DeathAlreadyVerified();
    error AlreadyClaimed();
    error MinimumLockNotMet();
    error InvalidBeneficiaryCount();
    error InvalidPercentage();
    error TotalPercentageNot100();
    error InvalidVETAmount();
    error InvalidAddress();
    error DuplicateBeneficiary();
    error InvalidAge();
    error InvalidLifeExpectancy();
    error InvalidDeathTimestamp();
    error InvalidVerificationHash();
    error BeneficiaryLimitExceeded();
    error CircuitBreakerActive();
    error CircuitBreakerNotActive();
    error CircuitBreakerExpired();
    error InvalidFeeRate();
    error FeeCollectionFailed();
    error InvalidGuardian();
    error GuardianRequired();
    error NotGuardian();
    error BeneficiaryNotMinor();
    error BeneficiaryIsMinor();
    error NoValidBeneficiaries();
    error CharityNotDesignated();
    error InvalidSurvivorshipPeriod();
    error SurvivorshipPeriodNotMet();
    error WithdrawalPeriodNotMet();
    error InvalidWithdrawalPercentage();
    error EmergencyWithdrawalTooEarly();

    // Roles
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // Token addresses
    address public immutable vthoAddress; // VTHO token address
    address public immutable b3trAddress; // B3TR token address
    address public immutable obolAddress; // OBOL token address

    // Fee configuration
    uint256 public constant INHERITANCE_FEE_RATE = 100; // 1% (100 basis points)
    uint256 public constant OBOL_WITHDRAWAL_FEE_RATE = 50; // 0.5% (50 basis points)
    uint256 public constant BASIS_POINTS = 10000; // 100%
    address public immutable feeCollector; // Address to collect fees

    // Anti-farming constants
    uint256 public constant MINIMUM_LOCK_PERIOD = 30 days;
    uint256 public constant MINIMUM_DEPOSIT = 100 ether; // 100 VET minimum
    uint256 public constant MAX_BENEFICIARIES = 5;
    uint256 public constant MAX_AGE = 120;
    uint256 public constant MIN_AGE = 18;
    uint256 public constant GRANDFATHERING_DEADLINE = 90 days; // 90 days to create new vault
    uint256 public constant MINOR_AGE_LIMIT = 18; // Age limit for minors
    uint256 public constant GUARDIAN_AGE_MINIMUM = 21; // Minimum age for guardians
    uint256 public constant DEFAULT_SURVIVORSHIP_PERIOD = 30 days; // Default survivorship period
    uint256 public constant MAX_SURVIVORSHIP_PERIOD = 365 days; // Maximum survivorship period
    
    // Time-locked withdrawal constants
    uint256 public constant WITHDRAWAL_LOCK_PERIOD = 7 * 365 days; // No withdrawal for first 7 years
    uint256 public constant PARTIAL_WITHDRAWAL_PERIOD = 15 * 365 days; // Partial withdrawal after 15 years
    uint256 public constant PARTIAL_WITHDRAWAL_PENALTY = 3500; // 35% penalty (3500 basis points)
    uint256 public constant FULL_WITHDRAWAL_PENALTY = 2000; // 20% penalty (2000 basis points)
    uint256 public constant EMERGENCY_WITHDRAWAL_PENALTY = 9000; // 90% penalty (9000 basis points)

    // Circuit breaker for emergency situations
    bool public circuitBreakerActive;
    uint256 public constant circuitBreakerTimestamp = 0; // Never modified, can be constant

    // Fee tracking
    uint256 public totalInheritanceFeesCollected;
    uint256 public totalObolFeesCollected;

    // Phase 1: Core beneficiary structure with contingent beneficiaries and survivorship
    struct Beneficiary {
        address recipient;
        uint256 percentage; // in basis points (10000 = 100%)
        address guardian; // Guardian for minor beneficiaries (address(0) if not minor)
        bool isMinor; // Whether beneficiary is under 18
        uint256 age; // Age of beneficiary at time of designation
        address contingentBeneficiary; // Backup beneficiary if primary dies
        uint256 survivorshipPeriod; // Days beneficiary must survive user (0 = no requirement)
        // Phase 2 features (commented out for future implementation)
        // address successorGuardian; // Backup guardian if primary guardian dies
        // string contactInfo; // IPFS hash of contact details
    }

    struct SarcophagusData {
        uint256 vetAmount;
        uint256 vthoAmount;
        uint256 b3trAmount;
        uint256 obolAmount; // OBOL tokens locked in vault
        uint256 initialVetAmount;
        uint256 initialVthoAmount;
        uint256 initialB3trAmount;
        uint256 initialObolAmount;
        uint256 createdAt;
        uint256 lastDeposit;
        uint256 dailyDepositTotal;
        uint256 lastDepositReset;
        Beneficiary[] beneficiaries;
        bool isDeceased;
        uint256 deathTimestamp;
        uint256 lifeExpectancy; // Expected death age in years
        uint256 actualAge; // Age at death
        // NFT storage
        address[] nftContracts; // List of NFT contract addresses
        mapping(address => uint256[]) lockedNFTs; // NFT contract => token IDs
        mapping(address => mapping(uint256 => bool)) isNFTLocked; // NFT contract => token ID => locked status
        mapping(address => mapping(uint256 => address)) nftBeneficiaries; // NFT contract => token ID => beneficiary address
        uint256 totalNFTValue; // Total VET-equivalent value of locked NFTs
    }

    struct UserVerification {
        bool isVerified;
        uint256 verificationDate;
        uint256 age;
        string verificationHash; // IPFS hash of verification documents
    }

    // Inheritance tracking for grandfathering
    struct InheritanceRecipient {
        address originalVaultOwner; // Who died
        uint256 inheritanceAmount; // How much they received
        uint256 claimTimestamp; // When they claimed
        uint256 grandfatheringDeadline; // Deadline to create new vault
        bool hasCreatedNewVault; // Whether they created a new vault
        uint256 originalObolRate; // Rate from original vault (for grandfathering)
    }

    // Storage
    mapping(address => SarcophagusData) public sarcophagi;
    mapping(address => UserVerification) public verifications;
    mapping(address => mapping(address => bool)) public claimed;
    mapping(address => InheritanceRecipient) public inheritanceRecipients;
    mapping(address => address) public charityDesignations; // User => Charity address

    // NFT whitelist and value caps
    mapping(address => bool) public allowedNFTCollections;
    mapping(address => uint256) public maxNFTValue; // NFT contract => max VET-equivalent value per NFT
    uint256 public globalMaxNFTValue; // Global cap for NFTs not in the mapping

    // Events
    event SarcophagusCreated(address indexed user, address[] beneficiaries, uint256[] percentages);
    event TokensDeposited(address indexed user, uint256 vet, uint256 vtho, uint256 b3tr);
    event DeathVerified(address indexed user, uint256 timestamp, uint256 age);
    event InheritanceClaimed(address indexed user, address indexed beneficiary, uint256 totalValue);
    event UserVerified(address indexed user, uint256 age, string verificationHash);
    event ObolTokensLocked(address indexed user, uint256 obolAmount);
    event GrandfatheringApplied(address indexed user, address indexed originalVaultOwner, uint256 originalObolRate);
    event CircuitBreakerActivated(address indexed admin, uint256 timestamp);
    event CircuitBreakerDeactivated(address indexed admin, uint256 timestamp);
    event InheritanceFeeCollected(address indexed beneficiary, uint256 feeAmount, uint256 totalValue);
    event ObolWithdrawalFeeCollected(address indexed user, uint256 feeAmount, uint256 withdrawalAmount);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event GuardianDesignated(address indexed beneficiary, address indexed guardian, uint256 age);
    event InheritanceClaimedForMinor(address indexed user, address indexed minor, address indexed guardian, uint256 totalValue);
    event CharityDonation(address indexed user, address indexed charity, uint256 amount);
    event ContingentBeneficiarySet(address indexed user, uint256 indexed beneficiaryIndex, address indexed beneficiary, address contingentBeneficiary);
    event ContingentInheritanceClaimed(address indexed user, address indexed primaryBeneficiary, address indexed contingentBeneficiary, uint256 totalValue);
    event SurvivorshipPeriodSet(address indexed user, uint256 indexed beneficiaryIndex, address indexed beneficiary, uint256 survivorshipPeriod);
    event PartialWithdrawal(address indexed user, uint256 totalWithdrawal, uint256 penaltyAmount, uint256 netWithdrawal);
    event FullWithdrawal(address indexed user, uint256 totalWithdrawal, uint256 penaltyAmount, uint256 netWithdrawal);
    event WithdrawalPenaltyCollected(address indexed user, uint256 penaltyAmount, uint256 totalWithdrawal);
    event EmergencyWithdrawal(address indexed user, uint256 totalWithdrawal, uint256 penaltyAmount, uint256 netWithdrawal, string reason);
    event NFTLocked(address indexed user, address indexed nftContract, uint256 indexed tokenId, uint256 nftValue);
    event NFTUnlocked(address indexed user, address indexed nftContract, uint256 indexed tokenId);
    event NFTInheritanceDistributed(address indexed user, address indexed beneficiary, uint256 nftInheritance, uint256 percentage);
    event NFTBeneficiaryUpdated(address indexed user, address indexed nftContract, uint256 indexed tokenId, address oldBeneficiary, address newBeneficiary);
    event NFTsTransferredToBeneficiary(address indexed user, address indexed beneficiary);
    event NFTCollectionWhitelisted(address indexed nftContract, uint256 maxValue);
    event NFTCollectionRemoved(address indexed nftContract);
    event GlobalMaxNFTValueUpdated(uint256 oldValue, uint256 newValue);

    IDeathVerifier public immutable deathVerifier;
    IOBOL public immutable obol;

    constructor(address _vthoToken, address _b3trToken, address _obolToken, address _deathVerifier, address _obol, address _feeCollector) {
        if (_vthoToken == address(0) || _b3trToken == address(0) || _obolToken == address(0) || _deathVerifier == address(0) || _obol == address(0) || _feeCollector == address(0)) {
            revert InvalidAddress();
        }
        
        vthoAddress = _vthoToken;
        b3trAddress = _b3trToken;
        obolAddress = _obolToken;
        deathVerifier = IDeathVerifier(_deathVerifier);
        obol = IOBOL(_obol);
        feeCollector = _feeCollector;
        
        // Initialize circuit breaker
        circuitBreakerActive = false;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @notice Add NFT collection to whitelist (admin only)
     * @param nftContract Address of the NFT contract
     * @param maxValue Maximum VET-equivalent value per NFT in this collection
     */
    function whitelistNFTCollection(address nftContract, uint256 maxValue) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (nftContract == address(0)) revert InvalidAddress();
        if (maxValue == 0) revert InvalidAmount();
        
        allowedNFTCollections[nftContract] = true;
        maxNFTValue[nftContract] = maxValue;
        
        emit NFTCollectionWhitelisted(nftContract, maxValue);
    }

    /**
     * @notice Remove NFT collection from whitelist (admin only)
     * @param nftContract Address of the NFT contract
     */
    function removeNFTCollection(address nftContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (nftContract == address(0)) revert InvalidAddress();
        
        allowedNFTCollections[nftContract] = false;
        maxNFTValue[nftContract] = 0;
        
        emit NFTCollectionRemoved(nftContract);
    }

    /**
     * @notice Update global maximum NFT value (admin only)
     * @param newMaxValue New global maximum VET-equivalent value per NFT
     */
    function updateGlobalMaxNFTValue(uint256 newMaxValue) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldValue = globalMaxNFTValue;
        globalMaxNFTValue = newMaxValue;
        
        emit GlobalMaxNFTValueUpdated(oldValue, newMaxValue);
    }

    /**
     * @notice Update maximum value for a specific NFT collection (admin only)
     * @param nftContract Address of the NFT contract
     * @param newMaxValue New maximum VET-equivalent value per NFT
     */
    function updateNFTCollectionMaxValue(address nftContract, uint256 newMaxValue) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (nftContract == address(0)) revert InvalidAddress();
        if (!allowedNFTCollections[nftContract]) revert("NFT collection not whitelisted");
        
        uint256 oldValue = maxNFTValue[nftContract];
        maxNFTValue[nftContract] = newMaxValue;
        
        emit NFTCollectionWhitelisted(nftContract, newMaxValue);
    }

    /**
     * @notice Validate beneficiary data
     * @param beneficiary Address of beneficiary
     * @param percentage Inheritance percentage in basis points
     * @param guardian Guardian address (if beneficiary is minor)
     * @param age Age of beneficiary
     */
    function _validateBeneficiary(
        address beneficiary,
        uint256 percentage,
        address guardian,
        uint256 age
    ) internal pure {
        if (beneficiary == address(0)) revert InvalidAddress();
        if (percentage == 0 || percentage > BASIS_POINTS) revert InvalidPercentage();
        if (age < MIN_AGE || age > MAX_AGE) revert InvalidAge();
        
        // Guardian validation for minors
        if (age < MINOR_AGE_LIMIT) {
            if (guardian == address(0)) revert GuardianRequired();
            if (guardian == beneficiary) revert InvalidGuardian();
        }
    }

    /**
     * @notice Validate beneficiary parameters
     * @param beneficiary Beneficiary address
     * @param percentage Inheritance percentage
     * @param guardian Guardian address
     * @param age Beneficiary age
     * @param survivorshipPeriod Survivorship period
     */
    function _validateBeneficiaryWithSurvivorship(
        address beneficiary,
        uint256 percentage,
        address guardian,
        uint256 age,
        uint256 survivorshipPeriod
    ) internal pure {
        _validateBeneficiary(beneficiary, percentage, guardian, age);
        if (survivorshipPeriod > MAX_SURVIVORSHIP_PERIOD) revert InvalidSurvivorshipPeriod();
    }

    /**
     * @notice Validate all beneficiary arrays have same length
     * @param beneficiaries Array of beneficiary addresses
     * @param percentages Array of inheritance percentages
     * @param guardians Array of guardian addresses
     * @param ages Array of beneficiary ages
     * @param contingentBeneficiaries Array of contingent beneficiary addresses
     * @param survivorshipPeriods Array of survivorship periods
     */
    function _validateArrayLengths(
        address[] calldata beneficiaries,
        uint256[] calldata percentages,
        address[] calldata guardians,
        uint256[] calldata ages,
        address[] calldata contingentBeneficiaries,
        uint256[] calldata survivorshipPeriods
    ) internal pure {
        uint256 beneficiaryCount = beneficiaries.length;
        if (beneficiaryCount != percentages.length || 
            beneficiaryCount != guardians.length || 
            beneficiaryCount != ages.length || 
            beneficiaryCount != contingentBeneficiaries.length || 
            beneficiaryCount != survivorshipPeriods.length) {
            revert InvalidBeneficiaryCount();
        }
    }

    /**
     * @notice Validate total percentage equals 100%
     * @param percentages Array of inheritance percentages
     */
    function _validateTotalPercentage(uint256[] calldata percentages) internal pure {
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            totalPercentage += percentages[i];
        }
        if (totalPercentage != BASIS_POINTS) revert TotalPercentageNot100();
    }

    /**
     * @notice Add beneficiary to sarcophagus
     * @param sarc Sarcophagus data storage
     * @param beneficiary Beneficiary address
     * @param percentage Inheritance percentage
     * @param guardian Guardian address
     * @param age Beneficiary age
     * @param contingentBeneficiary Contingent beneficiary address
     * @param survivorshipPeriod Survivorship period
     */
    function _addBeneficiary(
        SarcophagusData storage sarc,
        address beneficiary,
        uint256 percentage,
        address guardian,
        uint256 age,
        address contingentBeneficiary,
        uint256 survivorshipPeriod
    ) internal {
        bool isMinor = age < MINOR_AGE_LIMIT;
        sarc.beneficiaries.push(Beneficiary({
            recipient: beneficiary,
            percentage: percentage,
            guardian: guardian,
            isMinor: isMinor,
            age: age,
            contingentBeneficiary: contingentBeneficiary,
            survivorshipPeriod: survivorshipPeriod
        }));

        if (isMinor) {
            emit GuardianDesignated(beneficiary, guardian, age);
        }
    }

    /**
     * @notice Create a new sarcophagus (inheritance vault)
     * @param beneficiaries Array of beneficiary addresses
     * @param percentages Array of inheritance percentages (basis points)
     * @param guardians Array of guardian addresses (for minor beneficiaries)
     * @param ages Array of beneficiary ages
     * @param contingentBeneficiaries Array of contingent beneficiary addresses
     * @param survivorshipPeriods Array of survivorship periods in days
     */
    function createSarcophagus(
        address[] calldata beneficiaries,
        uint256[] calldata percentages,
        address[] calldata guardians,
        uint256[] calldata ages,
        address[] calldata contingentBeneficiaries,
        uint256[] calldata survivorshipPeriods
    ) external {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        if (sarcophagi[msg.sender].createdAt != 0) revert SarcophagusAlreadyExists();
        
        // Check verification status from DeathVerifier contract
        (bool isVerified,,) = deathVerifier.getUserVerification(msg.sender);
        if (!isVerified) revert NotVerified();
        
        uint256 beneficiaryCount = beneficiaries.length;
        if (beneficiaryCount == 0 || beneficiaryCount > MAX_BENEFICIARIES) revert InvalidBeneficiaryCount();
        
        // Validate array lengths
        _validateArrayLengths(beneficiaries, percentages, guardians, ages, contingentBeneficiaries, survivorshipPeriods);

        // Validate total percentage equals 100%
        _validateTotalPercentage(percentages);

        // Validate each beneficiary
        for (uint256 i = 0; i < beneficiaryCount; i++) {
            _validateBeneficiaryWithSurvivorship(
                beneficiaries[i], 
                percentages[i], 
                guardians[i], 
                ages[i], 
                survivorshipPeriods[i]
            );
        }

        // Create sarcophagus
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        sarc.createdAt = block.timestamp;
        sarc.lastDepositReset = block.timestamp;

        // Add beneficiaries
        for (uint256 i = 0; i < beneficiaryCount; i++) {
            _addBeneficiary(
                sarc,
                beneficiaries[i],
                percentages[i],
                guardians[i],
                ages[i],
                contingentBeneficiaries[i],
                survivorshipPeriods[i]
            );
        }

        emit SarcophagusCreated(msg.sender, beneficiaries, percentages);
    }

    /**
     * @notice Set contingent beneficiary for an existing beneficiary
     * @param beneficiaryIndex Index of beneficiary to update
     * @param contingentBeneficiary Address of contingent beneficiary
     */
    function setContingentBeneficiary(
        uint256 beneficiaryIndex,
        address contingentBeneficiary
    ) external {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();
        if (beneficiaryIndex >= sarc.beneficiaries.length) revert InvalidBeneficiary();

        sarc.beneficiaries[beneficiaryIndex].contingentBeneficiary = contingentBeneficiary;
        
        emit ContingentBeneficiarySet(
            msg.sender,
            beneficiaryIndex,
            sarc.beneficiaries[beneficiaryIndex].recipient,
            contingentBeneficiary
        );
    }

    /**
     * @notice Lock OBOL tokens in vault for inheritance
     * @param obolAmount Amount of OBOL tokens to lock
     */
    function lockObolTokens(uint256 obolAmount) external nonReentrant {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        if (obolAmount == 0) revert InvalidAmount();
        
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();

        // Transfer OBOL tokens from user to vault
        IERC20(obolAddress).safeTransferFrom(msg.sender, address(this), obolAmount);
        
        // Update vault OBOL balance
        sarc.obolAmount += obolAmount;
        if (sarc.initialObolAmount == 0) {
            sarc.initialObolAmount = obolAmount;
        } else {
            sarc.initialObolAmount += obolAmount;
        }

        // Update OBOL rewards for all locked tokens
        _updateObolRewards(msg.sender);

        emit ObolTokensLocked(msg.sender, obolAmount);
    }

    /**
     * @notice Lock NFT in vault for inheritance
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID of the NFT
     * @param nftValue VET-equivalent value of the NFT for OBOL rewards
     * @param beneficiary Address of the beneficiary who will receive this NFT
     */
    function lockNFT(address nftContract, uint256 tokenId, uint256 nftValue, address beneficiary) external nonReentrant {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        if (nftContract == address(0)) revert InvalidAddress();
        if (nftValue == 0) revert InvalidAmount();
        if (beneficiary == address(0)) revert InvalidAddress();
        
        // Check if NFT collection is whitelisted
        if (!allowedNFTCollections[nftContract]) revert("NFT collection not whitelisted");
        
        // Enforce value cap
        uint256 maxAllowedValue = maxNFTValue[nftContract];
        if (maxAllowedValue == 0) {
            maxAllowedValue = globalMaxNFTValue;
        }
        if (maxAllowedValue > 0 && nftValue > maxAllowedValue) {
            nftValue = maxAllowedValue; // Cap the value
        }
        
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();

        // Check if NFT is already locked
        if (sarc.isNFTLocked[nftContract][tokenId]) revert("NFT already locked");

        // Validate beneficiary exists in the vault
        bool beneficiaryExists = false;
        for (uint256 i = 0; i < sarc.beneficiaries.length; i++) {
            if (sarc.beneficiaries[i].recipient == beneficiary) {
                beneficiaryExists = true;
                break;
            }
        }
        if (!beneficiaryExists) revert InvalidBeneficiary();

        // Transfer NFT from user to vault
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Update vault NFT storage
        sarc.lockedNFTs[nftContract].push(tokenId);
        sarc.isNFTLocked[nftContract][tokenId] = true;
        sarc.nftBeneficiaries[nftContract][tokenId] = beneficiary;
        sarc.totalNFTValue += nftValue;

        // Add NFT contract to list if not already present
        bool contractExists = false;
        for (uint256 i = 0; i < sarc.nftContracts.length; i++) {
            if (sarc.nftContracts[i] == nftContract) {
                contractExists = true;
                break;
            }
        }
        if (!contractExists) {
            sarc.nftContracts.push(nftContract);
        }

        // Update OBOL rewards for all locked tokens
        _updateObolRewards(msg.sender);

        emit NFTLocked(msg.sender, nftContract, tokenId, nftValue);
    }

    /**
     * @notice Unlock NFT from vault (only before death verification)
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID of the NFT
     */
    function unlockNFT(address nftContract, uint256 tokenId) external nonReentrant {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        if (nftContract == address(0)) revert InvalidAddress();
        
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();

        // Check if NFT is locked
        if (!sarc.isNFTLocked[nftContract][tokenId]) revert("NFT not locked");

        // Remove NFT from storage
        sarc.isNFTLocked[nftContract][tokenId] = false;
        
        // Find and remove token ID from array
        uint256[] storage tokenIds = sarc.lockedNFTs[nftContract];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == tokenId) {
                // Remove by swapping with last element and popping
                tokenIds[i] = tokenIds[tokenIds.length - 1];
                tokenIds.pop();
                break;
            }
        }

        // Transfer NFT back to user
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);

        emit NFTUnlocked(msg.sender, nftContract, tokenId);
    }

    /**
     * @notice Update NFT beneficiary assignment
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID of the NFT
     * @param newBeneficiary New beneficiary address for the NFT
     */
    function updateNFTBeneficiary(address nftContract, uint256 tokenId, address newBeneficiary) external {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        if (nftContract == address(0)) revert InvalidAddress();
        if (newBeneficiary == address(0)) revert InvalidAddress();
        
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();

        // Check if NFT is locked
        if (!sarc.isNFTLocked[nftContract][tokenId]) revert("NFT not locked");

        // Validate new beneficiary exists in the vault
        bool beneficiaryExists = false;
        for (uint256 i = 0; i < sarc.beneficiaries.length; i++) {
            if (sarc.beneficiaries[i].recipient == newBeneficiary) {
                beneficiaryExists = true;
                break;
            }
        }
        if (!beneficiaryExists) revert InvalidBeneficiary();

        // Update beneficiary assignment
        address oldBeneficiary = sarc.nftBeneficiaries[nftContract][tokenId];
        sarc.nftBeneficiaries[nftContract][tokenId] = newBeneficiary;

        emit NFTBeneficiaryUpdated(msg.sender, nftContract, tokenId, oldBeneficiary, newBeneficiary);
    }

    /**
     * @notice Deposit tokens into sarcophagus
     * @param vetAmount Amount of VET to deposit
     * @param vthoAmount Amount of VTHO to deposit
     * @param b3trAmount Amount of B3TR to deposit
     */
    function depositTokens(
        uint256 vetAmount,
        uint256 vthoAmount,
        uint256 b3trAmount
    ) external payable nonReentrant {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();

        // Validate amounts
        if (vetAmount < MINIMUM_DEPOSIT && sarc.vetAmount == 0) revert InvalidVETAmount();
        if (vetAmount == 0 && vthoAmount == 0 && b3trAmount == 0) revert InvalidAmount();

        // Check minimum lock period for new deposits
        if (sarc.vetAmount == 0 && sarc.vthoAmount == 0 && sarc.b3trAmount == 0) {
            // First deposit - check minimum lock period
            if (block.timestamp < sarc.createdAt + MINIMUM_LOCK_PERIOD) {
                revert MinimumLockNotMet();
            }
        }

        // Transfer tokens and update balances
        if (vetAmount > 0) {
            if (msg.value != vetAmount) revert InvalidVETAmount();
            sarc.vetAmount += vetAmount;
            sarc.initialVetAmount += vetAmount;
        }

        if (vthoAmount > 0) {
            IERC20(vthoAddress).safeTransferFrom(msg.sender, address(this), vthoAmount);
            sarc.vthoAmount += vthoAmount;
            sarc.initialVthoAmount += vthoAmount;
        }

        if (b3trAmount > 0) {
            IERC20(b3trAddress).safeTransferFrom(msg.sender, address(this), b3trAmount);
            sarc.b3trAmount += b3trAmount;
            sarc.initialB3trAmount += b3trAmount;
        }

        // Update deposit tracking
        sarc.lastDeposit = block.timestamp;
        sarc.dailyDepositTotal += vetAmount + vthoAmount + b3trAmount;

        // Update OBOL rewards for all locked tokens
        _updateObolRewards(msg.sender);

        emit TokensDeposited(msg.sender, vetAmount, vthoAmount, b3trAmount);
    }

    /**
     * @notice Verify user death and unlock inheritance
     * @param user Address of deceased user
     * @param deathTimestamp When the user died
     * @param age Age at death
     */
    function verifyDeath(
        address user,
        uint256 deathTimestamp,
        uint256 age
    ) external onlyRole(VERIFIER_ROLE) {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        SarcophagusData storage sarc = sarcophagi[user];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();
        if (deathTimestamp == 0 || deathTimestamp > block.timestamp) revert InvalidDeathTimestamp();
        if (age < MIN_AGE || age > MAX_AGE) revert InvalidAge();

        sarc.isDeceased = true;
        sarc.deathTimestamp = deathTimestamp;
        sarc.actualAge = age;

        emit DeathVerified(user, deathTimestamp, age);
    }

    /**
     * @notice Calculate inheritance amounts for a beneficiary
     * @param sarc Sarcophagus data
     * @param beneficiary Beneficiary data
     * @return vetInheritance VET inheritance amount
     * @return vthoInheritance VTHO inheritance amount
     * @return b3trInheritance B3TR inheritance amount
     * @return obolInheritance OBOL inheritance amount
     * @return totalValue Total inheritance value
     */
    function _calculateInheritanceAmounts(
        SarcophagusData storage sarc,
        Beneficiary storage beneficiary
    ) internal view returns (
        uint256 vetInheritance,
        uint256 vthoInheritance,
        uint256 b3trInheritance,
        uint256 obolInheritance,
        uint256 totalValue
    ) {
        vetInheritance = (sarc.vetAmount * beneficiary.percentage) / BASIS_POINTS;
        vthoInheritance = (sarc.vthoAmount * beneficiary.percentage) / BASIS_POINTS;
        b3trInheritance = (sarc.b3trAmount * beneficiary.percentage) / BASIS_POINTS;
        obolInheritance = (sarc.obolAmount * beneficiary.percentage) / BASIS_POINTS;
        totalValue = vetInheritance + vthoInheritance + b3trInheritance + obolInheritance;
    }

    /**
     * @notice Transfer inheritance tokens to beneficiary
     * @param beneficiary Address of beneficiary
     * @param vetInheritance VET inheritance amount
     * @param vthoInheritance VTHO inheritance amount
     * @param b3trInheritance B3TR inheritance amount
     * @param obolInheritance OBOL inheritance amount
     */
    function _transferInheritance(
        address beneficiary,
        uint256 vetInheritance,
        uint256 vthoInheritance,
        uint256 b3trInheritance,
        uint256 obolInheritance
    ) internal {
        if (vetInheritance > 0) {
            payable(beneficiary).transfer(vetInheritance);
        }
        if (vthoInheritance > 0) {
            IERC20(vthoAddress).safeTransfer(beneficiary, vthoInheritance);
        }
        if (b3trInheritance > 0) {
            IERC20(b3trAddress).safeTransfer(beneficiary, b3trInheritance);
        }
        if (obolInheritance > 0) {
            // Calculate OBOL withdrawal fee (0.5%)
            uint256 obolFee = (obolInheritance * OBOL_WITHDRAWAL_FEE_RATE) / BASIS_POINTS;
            uint256 obolNet = obolInheritance - obolFee;
            
            // Transfer net amount to beneficiary
            IERC20(obolAddress).safeTransfer(beneficiary, obolNet);
            
            // Transfer fee to fee collector
            IERC20(obolAddress).safeTransfer(feeCollector, obolFee);
            
            emit ObolWithdrawalFeeCollected(beneficiary, obolFee, obolInheritance);
        }
    }

    /**
     * @notice Distribute NFTs to beneficiary based on percentage
     * @param user Address of deceased user
     * @param beneficiary Address of beneficiary
     * @param percentage Inheritance percentage in basis points
     */
    function _distributeNFTs(address user, address beneficiary, uint256 percentage) internal {
        SarcophagusData storage sarc = sarcophagi[user];
        
        // Transfer NFTs assigned to this specific beneficiary
        // Note: In a production system, you might want to track NFT contracts separately
        // For now, we'll use a simple approach and let the frontend handle the iteration
        
        // This is a simplified implementation - in practice, you'd want to:
        // 1. Track NFT contracts in a separate array
        // 2. Iterate through each contract and its locked NFTs
        // 3. Transfer only NFTs assigned to the claiming beneficiary
        
        // For now, we'll just update the total NFT value
        // The actual NFT transfer logic would be:
        // for each NFT contract:
        //   for each locked token ID:
        //     if (nftBeneficiaries[contract][tokenId] == beneficiary) {
        //       transfer NFT to beneficiary
        //       update totalNFTValueTransferred
        //     }
        
        // Update total NFT value (simplified for now)
        uint256 nftInheritance = (sarc.totalNFTValue * percentage) / BASIS_POINTS;
        sarc.totalNFTValue -= nftInheritance;
        
        emit NFTInheritanceDistributed(user, beneficiary, nftInheritance, percentage);
    }

    /**
     * @notice Set up grandfathering for inheritance recipient
     * @param beneficiary Beneficiary address
     * @param user Deceased user address
     * @param totalValue Total inheritance value
     */
    function _setupGrandfathering(
        address beneficiary,
        address user,
        uint256 totalValue
    ) internal {
        inheritanceRecipients[beneficiary] = InheritanceRecipient({
            originalVaultOwner: user,
            inheritanceAmount: totalValue,
            claimTimestamp: block.timestamp,
            grandfatheringDeadline: block.timestamp + GRANDFATHERING_DEADLINE,
            hasCreatedNewVault: false,
            originalObolRate: obol.getDailyRewardRate(user)
        });
    }

    /**
     * @notice Claim inheritance for a specific beneficiary
     * @param user Address of the deceased user
     * @param beneficiaryIndex Index of the beneficiary claiming inheritance
     */
    function claimInheritance(address user, uint256 beneficiaryIndex) external nonReentrant {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        SarcophagusData storage sarc = sarcophagi[user];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (!sarc.isDeceased) revert DeathAlreadyVerified();
        if (beneficiaryIndex >= sarc.beneficiaries.length) revert InvalidBeneficiary();

        Beneficiary storage beneficiary = sarc.beneficiaries[beneficiaryIndex];
        if (claimed[user][beneficiary.recipient]) revert AlreadyClaimed();

        // Check survivorship requirements
        _checkSurvivorshipRequirements(sarc, beneficiary);

        // Calculate inheritance amounts (including NFTs)
        uint256 totalValue = sarc.vetAmount + sarc.vthoAmount + sarc.b3trAmount + sarc.obolAmount + sarc.totalNFTValue;
        uint256 inheritanceAmount = (totalValue * beneficiary.percentage) / BASIS_POINTS;
        
        uint256 vetInheritance = (sarc.vetAmount * beneficiary.percentage) / BASIS_POINTS;
        uint256 vthoInheritance = (sarc.vthoAmount * beneficiary.percentage) / BASIS_POINTS;
        uint256 b3trInheritance = (sarc.b3trAmount * beneficiary.percentage) / BASIS_POINTS;
        uint256 obolInheritance = (sarc.obolAmount * beneficiary.percentage) / BASIS_POINTS;
        uint256 nftInheritance = (sarc.totalNFTValue * beneficiary.percentage) / BASIS_POINTS;

        // Calculate fee
        uint256 feeAmount = (inheritanceAmount * INHERITANCE_FEE_RATE) / BASIS_POINTS;

        // Mark as claimed BEFORE external calls
        claimed[user][beneficiary.recipient] = true;

        // Transfer inheritance
        _transferInheritance(beneficiary.recipient, vetInheritance, vthoInheritance, b3trInheritance, obolInheritance);

        // Transfer NFTs assigned to this beneficiary
        _transferNFTsToBeneficiary(user, beneficiary.recipient);

        // Update vault balances after inheritance transfer
        sarc.vetAmount -= vetInheritance;
        sarc.vthoAmount -= vthoInheritance;
        sarc.b3trAmount -= b3trInheritance;
        sarc.obolAmount -= obolInheritance;

        // Update OBOL rewards for remaining locked tokens
        _updateObolRewards(user);

        // Update fee collection AFTER external calls
        totalInheritanceFeesCollected += feeAmount;

        // Setup grandfathering for inheritance recipient
        _setupGrandfathering(beneficiary.recipient, user, totalValue);

        // Emit events
        if (beneficiary.isMinor) {
            emit InheritanceClaimedForMinor(user, beneficiary.recipient, beneficiary.guardian, totalValue);
        } else {
            emit InheritanceClaimed(user, beneficiary.recipient, totalValue);
        }
        emit InheritanceFeeCollected(beneficiary.recipient, feeAmount, totalValue);
    }

    /**
     * @notice Claim inheritance for a contingent beneficiary
     * @param user Address of deceased user
     * @param beneficiaryIndex Index of primary beneficiary
     */
    function claimContingentInheritance(
        address user,
        uint256 beneficiaryIndex
    ) external nonReentrant {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        SarcophagusData storage sarc = sarcophagi[user];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (!sarc.isDeceased) revert DeathAlreadyVerified();
        if (beneficiaryIndex >= sarc.beneficiaries.length) revert InvalidBeneficiary();

        Beneficiary storage beneficiary = sarc.beneficiaries[beneficiaryIndex];
        
        // Verify the caller is the contingent beneficiary
        if (beneficiary.contingentBeneficiary != msg.sender) {
            revert InvalidBeneficiary();
        }
        
        // Check if primary beneficiary has already claimed
        if (claimed[user][beneficiary.recipient]) revert AlreadyClaimed();

        // Check survivorship period for contingent beneficiary
        if (beneficiary.survivorshipPeriod > 0) {
            uint256 requiredSurvivalTime = sarc.deathTimestamp + beneficiary.survivorshipPeriod;
            if (block.timestamp < requiredSurvivalTime) revert SurvivorshipPeriodNotMet();
        }

        // Calculate inheritance amounts
        (uint256 vetInheritance, uint256 vthoInheritance, uint256 b3trInheritance, uint256 obolInheritance, uint256 totalValue) = 
            _calculateInheritanceAmounts(sarc, beneficiary);

        // Calculate fees
        uint256 feeAmount = (totalValue * INHERITANCE_FEE_RATE) / BASIS_POINTS;

        // Mark primary beneficiary as claimed (to prevent double claiming)
        claimed[user][beneficiary.recipient] = true;

        // Transfer inheritance to contingent beneficiary
        _transferInheritance(beneficiary.contingentBeneficiary, vetInheritance, vthoInheritance, b3trInheritance, obolInheritance);

        // Update vault balances after inheritance transfer
        sarc.vetAmount -= vetInheritance;
        sarc.vthoAmount -= vthoInheritance;
        sarc.b3trAmount -= b3trInheritance;
        sarc.obolAmount -= obolInheritance;

        // Update OBOL rewards for remaining locked tokens
        _updateObolRewards(user);

        // Collect fees
        if (feeAmount > 0) {
            totalInheritanceFeesCollected += feeAmount;
            emit InheritanceFeeCollected(beneficiary.contingentBeneficiary, feeAmount, totalValue);
        }

        // Emit contingent inheritance event
        emit ContingentInheritanceClaimed(
            user, 
            beneficiary.recipient, 
            beneficiary.contingentBeneficiary, 
            totalValue
        );

        // Set up grandfathering for contingent inheritance recipients
        _setupGrandfathering(beneficiary.contingentBeneficiary, user, totalValue);
    }

    /**
     * @notice Designate charity for estate fallback
     * @param charityAddress Address of charity to receive estate if no valid beneficiaries
     */
    function designateCharity(address charityAddress) external {
        if (charityAddress == address(0)) revert InvalidAddress();
        
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();

        charityDesignations[msg.sender] = charityAddress;
    }

    /**
     * @notice Handle estate when no valid beneficiaries exist
     * @param user Address of deceased user
     */
    function handleEstateFallback(address user) external nonReentrant {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        SarcophagusData storage sarc = sarcophagi[user];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (!sarc.isDeceased) revert DeathAlreadyVerified();

        address charity = charityDesignations[user];
        if (charity == address(0)) revert CharityNotDesignated();

        // Check if all beneficiaries have claimed
        bool allClaimed = true;
        // Costly loop: iterates over all beneficiaries to check claims
        // This is expected and not a security risk due to small array size (max 5 beneficiaries)
        for (uint256 i = 0; i < sarc.beneficiaries.length; i++) {
            if (!claimed[user][sarc.beneficiaries[i].recipient]) {
                allClaimed = false;
                break;
            }
        }

        if (!allClaimed) revert NoValidBeneficiaries();

        // Calculate total estate value
        uint256 totalValue = sarc.vetAmount + sarc.vthoAmount + sarc.b3trAmount + sarc.obolAmount;

        // Transfer all assets to charity
        if (sarc.vetAmount > 0) {
            payable(charity).transfer(sarc.vetAmount);
        }
        if (sarc.vthoAmount > 0) {
            IERC20(vthoAddress).safeTransfer(charity, sarc.vthoAmount);
        }
        if (sarc.b3trAmount > 0) {
            IERC20(b3trAddress).safeTransfer(charity, sarc.b3trAmount);
        }
        if (sarc.obolAmount > 0) {
            IERC20(obolAddress).safeTransfer(charity, sarc.obolAmount);
        }

        // Clear vault
        sarc.vetAmount = 0;
        sarc.vthoAmount = 0;
        sarc.b3trAmount = 0;
        sarc.obolAmount = 0;

        // Update OBOL rewards (will be 0 since vault is empty)
        _updateObolRewards(user);

        emit CharityDonation(user, charity, totalValue);
    }

    /**
     * @notice Set survivorship period for an existing beneficiary
     * @param beneficiaryIndex Index of beneficiary to update
     * @param survivorshipPeriod Days beneficiary must survive user
     */
    function setSurvivorshipPeriod(
        uint256 beneficiaryIndex,
        uint256 survivorshipPeriod
    ) external {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();
        if (beneficiaryIndex >= sarc.beneficiaries.length) revert InvalidBeneficiary();
        if (survivorshipPeriod > MAX_SURVIVORSHIP_PERIOD) revert InvalidSurvivorshipPeriod();

        sarc.beneficiaries[beneficiaryIndex].survivorshipPeriod = survivorshipPeriod;
        
        emit SurvivorshipPeriodSet(
            msg.sender,
            beneficiaryIndex,
            sarc.beneficiaries[beneficiaryIndex].recipient,
            survivorshipPeriod
        );
    }

    /**
     * @notice Check if beneficiary meets survivorship requirements
     * @param sarc Sarcophagus data
     * @param beneficiary Beneficiary data
     * @return meetsRequirements Whether beneficiary meets survivorship requirements
     */
    function _checkSurvivorshipRequirements(
        SarcophagusData storage sarc,
        Beneficiary storage beneficiary
    ) internal view returns (bool meetsRequirements) {
        if (beneficiary.survivorshipPeriod == 0) {
            return true; // No survivorship requirement
        }
        
        uint256 requiredSurvivalTime = sarc.deathTimestamp + beneficiary.survivorshipPeriod;
        return block.timestamp >= requiredSurvivalTime;
    }

    /**
     * @notice Count valid beneficiaries and calculate total percentage
     * @param sarc Sarcophagus data
     * @return validCount Number of valid beneficiaries
     * @return totalValidPercentage Total percentage of valid beneficiaries
     */
    function _countValidBeneficiaries(
        SarcophagusData storage sarc
    ) internal view returns (uint256 validCount, uint256 totalValidPercentage) {
        for (uint256 i = 0; i < sarc.beneficiaries.length; i++) {
            Beneficiary storage beneficiary = sarc.beneficiaries[i];
            
            if (_checkSurvivorshipRequirements(sarc, beneficiary)) {
                validCount++;
                totalValidPercentage += beneficiary.percentage;
            }
        }
    }

    /**
     * @notice Populate valid beneficiaries array
     * @param sarc Sarcophagus data
     * @param validBeneficiaries Array to populate
     */
    function _populateValidBeneficiaries(
        SarcophagusData storage sarc,
        uint256[] memory validBeneficiaries
    ) internal view {
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < sarc.beneficiaries.length; i++) {
            Beneficiary storage beneficiary = sarc.beneficiaries[i];
            
            if (_checkSurvivorshipRequirements(sarc, beneficiary)) {
                validBeneficiaries[currentIndex] = i;
                currentIndex++;
            }
        }
    }

    /**
     * @notice Get valid beneficiaries for inheritance (meeting survivorship requirements)
     * @param user Address of the vault owner
     * @return validBeneficiaries Array of valid beneficiary indices
     * @return totalValidPercentage Total percentage of valid beneficiaries
     */
    function getValidBeneficiaries(
        address user
    ) external view returns (uint256[] memory validBeneficiaries, uint256 totalValidPercentage) {
        SarcophagusData storage sarc = sarcophagi[user];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (!sarc.isDeceased) revert DeathAlreadyVerified();

        // Count valid beneficiaries
        uint256 validCount;
        (validCount, totalValidPercentage) = _countValidBeneficiaries(sarc);

        if (validCount == 0) revert NoValidBeneficiaries();

        // Populate array
        validBeneficiaries = new uint256[](validCount);
        _populateValidBeneficiaries(sarc, validBeneficiaries);

        return (validBeneficiaries, totalValidPercentage);
    }

    /**
     * @notice Calculate withdrawal amounts based on percentage
     * @param sarc Sarcophagus data
     * @param percentage Percentage to withdraw (basis points)
     * @return vetWithdrawal VET withdrawal amount
     * @return vthoWithdrawal VTHO withdrawal amount
     * @return b3trWithdrawal B3TR withdrawal amount
     * @return obolWithdrawal OBOL withdrawal amount
     * @return totalWithdrawal Total withdrawal amount
     */
    function _calculateWithdrawalAmounts(
        SarcophagusData storage sarc,
        uint256 percentage
    ) internal view returns (
        uint256 vetWithdrawal,
        uint256 vthoWithdrawal,
        uint256 b3trWithdrawal,
        uint256 obolWithdrawal,
        uint256 totalWithdrawal
    ) {
        vetWithdrawal = (sarc.vetAmount * percentage) / BASIS_POINTS;
        vthoWithdrawal = (sarc.vthoAmount * percentage) / BASIS_POINTS;
        b3trWithdrawal = (sarc.b3trAmount * percentage) / BASIS_POINTS;
        obolWithdrawal = (sarc.obolAmount * percentage) / BASIS_POINTS;
        totalWithdrawal = vetWithdrawal + vthoWithdrawal + b3trWithdrawal + obolWithdrawal;
    }

    /**
     * @notice Update vault balances after withdrawal
     * @param sarc Sarcophagus data
     * @param vetWithdrawal VET withdrawal amount
     * @param vthoWithdrawal VTHO withdrawal amount
     * @param b3trWithdrawal B3TR withdrawal amount
     * @param obolWithdrawal OBOL withdrawal amount
     * @param user Address of the user
     */
    function _updateVaultBalances(
        SarcophagusData storage sarc,
        uint256 vetWithdrawal,
        uint256 vthoWithdrawal,
        uint256 b3trWithdrawal,
        uint256 obolWithdrawal,
        address user
    ) internal {
        sarc.vetAmount -= vetWithdrawal;
        sarc.vthoAmount -= vthoWithdrawal;
        sarc.b3trAmount -= b3trWithdrawal;
        sarc.obolAmount -= obolWithdrawal;
        
        // Update OBOL rewards for remaining locked tokens
        _updateObolRewards(user);
    }

    /**
     * @notice Withdraw partial funds after 15 years with penalty
     * @param percentage Percentage of funds to withdraw (max 30%)
     */
    function withdrawPartial(
        uint256 percentage
    ) external nonReentrant {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();
        
        // Check time requirements
        if (block.timestamp < sarc.createdAt + PARTIAL_WITHDRAWAL_PERIOD) {
            revert WithdrawalPeriodNotMet();
        }
        
        // Validate percentage (max 30%)
        if (percentage == 0 || percentage > 3000) revert InvalidWithdrawalPercentage();
        
        // Calculate withdrawal amounts
        (uint256 vetWithdrawal, uint256 vthoWithdrawal, uint256 b3trWithdrawal, uint256 obolWithdrawal, uint256 totalWithdrawal) = 
            _calculateWithdrawalAmounts(sarc, percentage);
        
        // Calculate penalty
        uint256 penaltyAmount = (totalWithdrawal * PARTIAL_WITHDRAWAL_PENALTY) / BASIS_POINTS;
        
        // Update vault balances
        _updateVaultBalances(sarc, vetWithdrawal, vthoWithdrawal, b3trWithdrawal, obolWithdrawal, msg.sender);
        
        // Transfer funds
        _transferInheritance(msg.sender, vetWithdrawal, vthoWithdrawal, b3trWithdrawal, obolWithdrawal);
        
        // Collect penalty
        if (penaltyAmount > 0) {
            totalInheritanceFeesCollected += penaltyAmount;
            emit WithdrawalPenaltyCollected(msg.sender, penaltyAmount, totalWithdrawal);
        }
        
        uint256 netWithdrawal = totalWithdrawal - penaltyAmount;
        emit PartialWithdrawal(msg.sender, totalWithdrawal, penaltyAmount, netWithdrawal);
    }

    /**
     * @notice Withdraw all funds after 15 years with penalty
     */
    function withdrawAll() external nonReentrant {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();
        
        // Check time requirements
        if (block.timestamp < sarc.createdAt + PARTIAL_WITHDRAWAL_PERIOD) {
            revert WithdrawalPeriodNotMet();
        }
        
        // Calculate withdrawal amounts (100%)
        (uint256 vetWithdrawal, uint256 vthoWithdrawal, uint256 b3trWithdrawal, uint256 obolWithdrawal, uint256 totalWithdrawal) = 
            _calculateWithdrawalAmounts(sarc, BASIS_POINTS);
        
        // Calculate penalty
        uint256 penaltyAmount = (totalWithdrawal * FULL_WITHDRAWAL_PENALTY) / BASIS_POINTS;
        
        // Clear vault balances
        sarc.vetAmount = 0;
        sarc.vthoAmount = 0;
        sarc.b3trAmount = 0;
        sarc.obolAmount = 0;
        
        // Transfer funds
        _transferInheritance(msg.sender, vetWithdrawal, vthoWithdrawal, b3trWithdrawal, obolWithdrawal);
        
        // Collect penalty
        if (penaltyAmount > 0) {
            totalInheritanceFeesCollected += penaltyAmount;
            emit WithdrawalPenaltyCollected(msg.sender, penaltyAmount, totalWithdrawal);
        }
        
        // Update OBOL rewards (will be 0 since vault is empty)
        _updateObolRewards(msg.sender);
        
        uint256 netWithdrawal = totalWithdrawal - penaltyAmount;
        emit FullWithdrawal(msg.sender, totalWithdrawal, penaltyAmount, netWithdrawal);
    }

    /**
     * @notice Emergency withdrawal after 7 years with 90% penalty
     * @param emergencyReason Reason for emergency withdrawal
     */
    function emergencyWithdraw(
        string calldata emergencyReason
    ) external nonReentrant {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        SarcophagusData storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathAlreadyVerified();
        
        // Check time requirements (minimum 7 years)
        if (block.timestamp < sarc.createdAt + WITHDRAWAL_LOCK_PERIOD) {
            revert EmergencyWithdrawalTooEarly();
        }
        
        // Calculate withdrawal amounts (100%)
        uint256 vetWithdrawal = sarc.vetAmount;
        uint256 vthoWithdrawal = sarc.vthoAmount;
        uint256 b3trWithdrawal = sarc.b3trAmount;
        uint256 obolWithdrawal = sarc.obolAmount;
        
        // Calculate penalty (90%)
        uint256 totalWithdrawal = vetWithdrawal + vthoWithdrawal + b3trWithdrawal + obolWithdrawal;
        uint256 penaltyAmount = (totalWithdrawal * EMERGENCY_WITHDRAWAL_PENALTY) / BASIS_POINTS;
        uint256 netWithdrawal = totalWithdrawal - penaltyAmount;
        
        // Clear vault balances
        sarc.vetAmount = 0;
        sarc.vthoAmount = 0;
        sarc.b3trAmount = 0;
        sarc.obolAmount = 0;
        
        // Transfer funds
        if (vetWithdrawal > 0) {
            payable(msg.sender).transfer(vetWithdrawal);
        }
        if (vthoWithdrawal > 0) {
            IERC20(vthoAddress).safeTransfer(msg.sender, vthoWithdrawal);
        }
        if (b3trWithdrawal > 0) {
            IERC20(b3trAddress).safeTransfer(msg.sender, b3trWithdrawal);
        }
        if (obolWithdrawal > 0) {
            IERC20(obolAddress).safeTransfer(msg.sender, obolWithdrawal);
        }
        
        // Collect penalty
        if (penaltyAmount > 0) {
            totalInheritanceFeesCollected += penaltyAmount;
            emit WithdrawalPenaltyCollected(msg.sender, penaltyAmount, totalWithdrawal);
        }
        
        // Update OBOL rewards (will be 0 since vault is empty)
        _updateObolRewards(msg.sender);
        
        emit EmergencyWithdrawal(msg.sender, totalWithdrawal, penaltyAmount, netWithdrawal, emergencyReason);
    }

    /**
     * @notice Get withdrawal eligibility information for a user
     * @param user Address of the user
     * @return canWithdrawPartial Whether partial withdrawal is available
     * @return canWithdrawAll Whether full withdrawal is available
     * @return canEmergencyWithdraw Whether emergency withdrawal is available
     * @return timeUntilPartialWithdrawal Time until partial withdrawal is available
     * @return timeUntilFullWithdrawal Time until full withdrawal is available
     * @return timeUntilEmergencyWithdrawal Time until emergency withdrawal is available
     */
    function getWithdrawalEligibility(
        address user
    ) external view returns (
        bool canWithdrawPartial,
        bool canWithdrawAll,
        bool canEmergencyWithdraw,
        uint256 timeUntilPartialWithdrawal,
        uint256 timeUntilFullWithdrawal,
        uint256 timeUntilEmergencyWithdrawal
    ) {
        SarcophagusData storage sarc = sarcophagi[user];
        if (sarc.createdAt == 0) return (false, false, false, 0, 0, 0);
        if (sarc.isDeceased) return (false, false, false, 0, 0, 0);
        
        uint256 currentTime = block.timestamp;
        uint256 partialDeadline = sarc.createdAt + PARTIAL_WITHDRAWAL_PERIOD;
        uint256 emergencyDeadline = sarc.createdAt + WITHDRAWAL_LOCK_PERIOD;
        
        canWithdrawPartial = currentTime >= partialDeadline;
        canWithdrawAll = currentTime >= partialDeadline;
        canEmergencyWithdraw = currentTime >= emergencyDeadline;
        
        timeUntilPartialWithdrawal = currentTime >= partialDeadline ? 0 : partialDeadline - currentTime;
        timeUntilFullWithdrawal = currentTime >= partialDeadline ? 0 : partialDeadline - currentTime;
        timeUntilEmergencyWithdrawal = currentTime >= emergencyDeadline ? 0 : emergencyDeadline - currentTime;
    }

    /**
     * @notice Get the list of beneficiaries for a user
     * @param user Address of the vault owner
     * @return beneficiaries Array of Beneficiary structs
     */
    function getBeneficiaries(address user) external view returns (Beneficiary[] memory beneficiaries) {
        return sarcophagi[user].beneficiaries;
    }

    /**
     * @notice Get locked NFTs for a user
     * @param user Address of the vault owner
     * @param nftContract Address of the NFT contract
     * @return tokenIds Array of locked token IDs
     */
    function getLockedNFTs(address user, address nftContract) external view returns (uint256[] memory tokenIds) {
        return sarcophagi[user].lockedNFTs[nftContract];
    }

    /**
     * @notice Check if an NFT is locked in a user's vault
     * @param user Address of the vault owner
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to check
     * @return isLocked Whether the NFT is locked
     */
    function isNFTLocked(address user, address nftContract, uint256 tokenId) external view returns (bool isLocked) {
        return sarcophagi[user].isNFTLocked[nftContract][tokenId];
    }

    /**
     * @notice Get total NFT value for a user
     * @param user Address of the vault owner
     * @return totalValue Total VET-equivalent value of locked NFTs
     */
    function getTotalNFTValue(address user) external view returns (uint256 totalValue) {
        return sarcophagi[user].totalNFTValue;
    }

    /**
     * @notice Get NFT beneficiary assignment
     * @param user Address of the vault owner
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID
     * @return beneficiary Address of the beneficiary assigned to this NFT
     */
    function getNFTBeneficiary(address user, address nftContract, uint256 tokenId) external view returns (address beneficiary) {
        return sarcophagi[user].nftBeneficiaries[nftContract][tokenId];
    }

    /**
     * @notice Check if NFT collection is whitelisted and get its max value
     * @param nftContract Address of the NFT contract
     * @return isWhitelisted Whether the collection is whitelisted
     * @return maxValue Maximum VET-equivalent value per NFT (0 if not whitelisted)
     */
    function getNFTCollectionInfo(address nftContract) external view returns (bool isWhitelisted, uint256 maxValue) {
        isWhitelisted = allowedNFTCollections[nftContract];
        maxValue = maxNFTValue[nftContract];
        if (maxValue == 0 && isWhitelisted) {
            maxValue = globalMaxNFTValue;
        }
    }

    /**
     * @notice Calculate total VET-equivalent value of all locked tokens for OBOL rewards
     * @param sarc Sarcophagus data
     * @return totalValue Total VET-equivalent value
     */
    function _calculateTotalLockedValue(SarcophagusData storage sarc) internal view returns (uint256 totalValue) {
        // VET is 1:1
        totalValue = sarc.vetAmount;
        
        // VTHO: Convert to VET equivalent (assuming 1 VTHO = 0.0001 VET for rewards)
        // This rate can be adjusted based on market conditions
        totalValue += sarc.vthoAmount / 10000; // 1 VTHO = 0.0001 VET
        
        // B3TR: Convert to VET equivalent (assuming 1 B3TR = 0.001 VET for rewards)
        // This rate can be adjusted based on market conditions
        totalValue += sarc.b3trAmount / 1000; // 1 B3TR = 0.001 VET
        
        // OBOL: Convert to VET equivalent (assuming 1 OBOL = 0.01 VET for rewards)
        // This rate can be adjusted based on market conditions
        totalValue += sarc.obolAmount / 100; // 1 OBOL = 0.01 VET
        
        // NFTs: Add their VET-equivalent value
        totalValue += sarc.totalNFTValue;
        
        return totalValue;
    }

    /**
     * @notice Update OBOL rewards for user's locked tokens
     * @param user Address of the user
     */
    function _updateObolRewards(address user) internal {
        SarcophagusData storage sarc = sarcophagi[user];
        if (sarc.createdAt > 0) {
            uint256 totalLockedValue = _calculateTotalLockedValue(sarc);
            obol.updateUserStake(user, totalLockedValue);
        }
    }

    /**
     * @notice Handle incoming NFT transfers
     * @return bytes4 Magic value indicating successful receipt
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /**
     * @notice Transfer NFTs assigned to a specific beneficiary
     * @param user Address of deceased user
     * @param beneficiary Address of beneficiary claiming NFTs
     */
    function _transferNFTsToBeneficiary(address user, address beneficiary) internal {
        SarcophagusData storage sarc = sarcophagi[user];
        for (uint256 i = 0; i < sarc.nftContracts.length; i++) {
            address nftContract = sarc.nftContracts[i];
            uint256[] storage tokenIds = sarc.lockedNFTs[nftContract];
            uint256 j = 0;
            while (j < tokenIds.length) {
                uint256 tokenId = tokenIds[j];
                if (sarc.nftBeneficiaries[nftContract][tokenId] == beneficiary && sarc.isNFTLocked[nftContract][tokenId]) {
                    // Transfer NFT
                    IERC721(nftContract).safeTransferFrom(address(this), beneficiary, tokenId);
                    // Remove from storage
                    sarc.isNFTLocked[nftContract][tokenId] = false;
                    sarc.nftBeneficiaries[nftContract][tokenId] = address(0);
                    // Remove from array (swap and pop)
                    tokenIds[j] = tokenIds[tokenIds.length - 1];
                    tokenIds.pop();
                    // Do not increment j, as we swapped in a new tokenId
                } else {
                    j++;
                }
            }
        }
        emit NFTsTransferredToBeneficiary(user, beneficiary);
    }
} 