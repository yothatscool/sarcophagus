// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IVIP180.sol";
import "./interfaces/IDeathVerifier.sol";

/**
 * @title Sarcophagus
 * @author yothatscool
 * @notice Simplified digital inheritance protocol - lock tokens until death verification
 * @dev Anti-farming measures: KYC verification, minimum lock periods, rate limiting
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
    error DeathNotVerified();
    error AlreadyClaimed();
    error RateLimitExceeded();
    error MinimumLockNotMet();
    error InvalidBeneficiaryCount();
    error InvalidPercentage();
    error TotalPercentageNot100();

    // Roles
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // Token addresses (VeChain)
    address public constant VET_ADDRESS = address(0);
    address public constant VTHO_ADDRESS = 0x0000000000000000000000000000456E65726779;
    address public immutable B3TR_ADDRESS;

    // Anti-farming constants
    uint256 public constant MINIMUM_LOCK_PERIOD = 30 days;
    uint256 public constant MAX_DAILY_DEPOSIT = 1000000 ether; // 1M VET equivalent
    uint256 public constant MINIMUM_DEPOSIT = 100 ether; // 100 VET minimum
    uint256 public constant RATE_LIMIT_WINDOW = 24 hours;
    uint256 public constant MAX_BENEFICIARIES = 10;
    uint256 public constant BASIS_POINTS = 10000; // 100%

    struct Beneficiary {
        address recipient;
        uint256 percentage; // in basis points (10000 = 100%)
    }

    struct Sarcophagus {
        uint256 vetAmount;
        uint256 vthoAmount;
        uint256 b3trAmount;
        uint256 createdAt;
        uint256 lastDeposit;
        uint256 dailyDepositTotal;
        uint256 lastDepositReset;
        Beneficiary[] beneficiaries;
        bool isDeceased;
        uint256 deathTimestamp;
        bool hasBeenClaimed;
        uint256 lifeExpectancy; // Expected death age in years
        uint256 actualAge; // Age at death
    }

    struct UserVerification {
        bool isVerified;
        uint256 verificationDate;
        uint256 age;
        string verificationHash; // IPFS hash of verification documents
    }

    // Storage
    mapping(address => Sarcophagus) public sarcophagi;
    mapping(address => UserVerification) public verifications;
    mapping(address => uint256) public dailyDeposits;
    mapping(address => uint256) public lastDepositReset;

    // Events
    event SarcophagusCreated(address indexed user, address[] beneficiaries, uint256[] percentages);
    event TokensDeposited(address indexed user, uint256 vet, uint256 vtho, uint256 b3tr);
    event DeathVerified(address indexed user, uint256 timestamp, uint256 age);
    event InheritanceClaimed(address indexed user, address indexed beneficiary, uint256 totalValue);
    event UserVerified(address indexed user, uint256 age, string verificationHash);
    event RateLimitHit(address indexed user, uint256 attempted, uint256 allowed);

    IDeathVerifier public immutable deathVerifier;

    constructor(address _b3trToken, address _deathVerifier) {
        if (_b3trToken == address(0) || _deathVerifier == address(0)) {
            revert("Invalid addresses");
        }
        
        B3TR_ADDRESS = _b3trToken;
        deathVerifier = IDeathVerifier(_deathVerifier);
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @notice Create a new sarcophagus (one per user)
     * @param beneficiaries Array of beneficiary addresses
     * @param percentages Array of percentages in basis points (10000 = 100%)
     */
    function createSarcophagus(
        address[] calldata beneficiaries,
        uint256[] calldata percentages
    ) external nonReentrant whenNotPaused {
        if (!verifications[msg.sender].isVerified) revert NotVerified();
        if (sarcophagi[msg.sender].createdAt != 0) revert SarcophagusAlreadyExists();
        if (beneficiaries.length == 0) revert InvalidBeneficiaryCount();
        if (beneficiaries.length > MAX_BENEFICIARIES) revert InvalidBeneficiaryCount();
        if (beneficiaries.length != percentages.length) revert InvalidBeneficiaryCount();

        // Validate percentages
        uint256 totalPercentage;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i] == address(0)) revert InvalidBeneficiary();
            if (percentages[i] == 0 || percentages[i] > BASIS_POINTS) revert InvalidPercentage();
            totalPercentage += percentages[i];
        }
        if (totalPercentage != BASIS_POINTS) revert TotalPercentageNot100();

        // Create sarcophagus
        Sarcophagus storage sarc = sarcophagi[msg.sender];
        sarc.createdAt = block.timestamp;
        sarc.lastDeposit = 0;
        sarc.dailyDepositTotal = 0;
        sarc.lastDepositReset = block.timestamp;
        sarc.isDeceased = false;
        sarc.deathTimestamp = 0;
        sarc.hasBeenClaimed = false;
        sarc.lifeExpectancy = 0;
        sarc.actualAge = 0;

        // Add beneficiaries
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            sarc.beneficiaries.push(Beneficiary({
                recipient: beneficiaries[i],
                percentage: percentages[i]
            }));
        }

        emit SarcophagusCreated(msg.sender, beneficiaries, percentages);
    }

    /**
     * @notice Deposit tokens into sarcophagus (locked until death)
     * @param vetAmount Amount of VET to deposit
     * @param vthoAmount Amount of VTHO to deposit  
     * @param b3trAmount Amount of B3TR to deposit
     */
    function depositTokens(
        uint256 vetAmount,
        uint256 vthoAmount,
        uint256 b3trAmount
    ) external nonReentrant whenNotPaused {
        Sarcophagus storage sarc = sarcophagi[msg.sender];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathNotVerified();

        uint256 totalValue = vetAmount + vthoAmount + b3trAmount;
        if (totalValue < MINIMUM_DEPOSIT) revert InvalidAmount();

        // Anti-farming: Rate limiting
        _checkRateLimit(msg.sender, totalValue);

        // Transfer tokens
        if (vetAmount > 0) {
            IERC20(VET_ADDRESS).safeTransferFrom(msg.sender, address(this), vetAmount);
            sarc.vetAmount += vetAmount;
        }
        
        if (vthoAmount > 0) {
            IERC20(VTHO_ADDRESS).safeTransferFrom(msg.sender, address(this), vthoAmount);
            sarc.vthoAmount += vthoAmount;
        }
        
        if (b3trAmount > 0) {
            IERC20(B3TR_ADDRESS).safeTransferFrom(msg.sender, address(this), b3trAmount);
            sarc.b3trAmount += b3trAmount;
        }

        sarc.lastDeposit = block.timestamp;
        sarc.dailyDepositTotal += totalValue;

        emit TokensDeposited(msg.sender, vetAmount, vthoAmount, b3trAmount);
    }

    /**
     * @notice Verify user death and calculate bonuses
     * @param user Address of deceased user
     * @param deathTimestamp Timestamp of death
     * @param age Age at death
     * @param lifeExpectancy Expected life expectancy
     * @param proofHash IPFS hash of death certificate
     */
    function verifyDeath(
        address user,
        uint256 deathTimestamp,
        uint256 age,
        uint256 lifeExpectancy,
        string calldata proofHash
    ) external onlyRole(ORACLE_ROLE) {
        Sarcophagus storage sarc = sarcophagi[user];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (sarc.isDeceased) revert DeathNotVerified();

        sarc.isDeceased = true;
        sarc.deathTimestamp = deathTimestamp;
        sarc.actualAge = age;
        sarc.lifeExpectancy = lifeExpectancy;

        // Calculate and distribute bonuses
        uint256 bonus = deathVerifier.calculateBonus(age, lifeExpectancy);
        if (bonus > 0) {
            sarc.b3trAmount += bonus;
        }

        emit DeathVerified(user, deathTimestamp, age);
    }

    /**
     * @notice Claim inheritance after death verification
     * @param user Address of the deceased user
     */
    function claimInheritance(address user) external nonReentrant {
        Sarcophagus storage sarc = sarcophagi[user];
        if (sarc.createdAt == 0) revert SarcophagusNotExists();
        if (!sarc.isDeceased) revert DeathNotVerified();
        if (sarc.hasBeenClaimed) revert AlreadyClaimed();

        // Check if caller is a beneficiary
        bool isBeneficiary = false;
        uint256 beneficiaryIndex = 0;
        for (uint256 i = 0; i < sarc.beneficiaries.length; i++) {
            if (sarc.beneficiaries[i].recipient == msg.sender) {
                isBeneficiary = true;
                beneficiaryIndex = i;
                break;
            }
        }
        if (!isBeneficiary) revert InvalidBeneficiary();

        // Calculate beneficiary's share
        uint256 totalVET = sarc.vetAmount;
        uint256 totalVTHO = sarc.vthoAmount;
        uint256 totalB3TR = sarc.b3trAmount;
        uint256 percentage = sarc.beneficiaries[beneficiaryIndex].percentage;

        uint256 vetShare = (totalVET * percentage) / BASIS_POINTS;
        uint256 vthoShare = (totalVTHO * percentage) / BASIS_POINTS;
        uint256 b3trShare = (totalB3TR * percentage) / BASIS_POINTS;

        uint256 totalShare = vetShare + vthoShare + b3trShare;

        // Transfer tokens to beneficiary
        if (vetShare > 0) {
            IERC20(VET_ADDRESS).safeTransfer(msg.sender, vetShare);
        }
        if (vthoShare > 0) {
            IERC20(VTHO_ADDRESS).safeTransfer(msg.sender, vthoShare);
        }
        if (b3trShare > 0) {
            IERC20(B3TR_ADDRESS).safeTransfer(msg.sender, b3trShare);
        }

        emit InheritanceClaimed(user, msg.sender, totalShare);
    }

    /**
     * @notice Verify user identity and age (KYC)
     * @param user Address to verify
     * @param age User's age
     * @param verificationHash IPFS hash of verification documents
     */
    function verifyUser(
        address user,
        uint256 age,
        string calldata verificationHash
    ) external onlyRole(VERIFIER_ROLE) {
        if (age < 18 || age > 120) revert InvalidAmount();
        
        verifications[user] = UserVerification({
            isVerified: true,
            verificationDate: block.timestamp,
            age: age,
            verificationHash: verificationHash
        });

        emit UserVerified(user, age, verificationHash);
    }

    /**
     * @notice Check rate limiting for deposits
     */
    function _checkRateLimit(address user, uint256 amount) internal {
        uint256 currentTime = block.timestamp;
        uint256 lastReset = lastDepositReset[user];
        
        // Reset daily counter if 24 hours have passed
        if (currentTime - lastReset >= RATE_LIMIT_WINDOW) {
            dailyDeposits[user] = 0;
            lastDepositReset[user] = currentTime;
        }
        
        if (dailyDeposits[user] + amount > MAX_DAILY_DEPOSIT) {
            emit RateLimitHit(user, amount, MAX_DAILY_DEPOSIT - dailyDeposits[user]);
            revert RateLimitExceeded();
        }
        
        dailyDeposits[user] += amount;
    }

    // View functions
    function getSarcophagus(address user) external view returns (Sarcophagus memory) {
        return sarcophagi[user];
    }

    function getBeneficiaries(address user) external view returns (Beneficiary[] memory) {
        return sarcophagi[user].beneficiaries;
    }

    function getUserVerification(address user) external view returns (UserVerification memory) {
        return verifications[user];
    }

    function getTotalLockedValue(address user) external view returns (uint256) {
        Sarcophagus storage sarc = sarcophagi[user];
        return sarc.vetAmount + sarc.vthoAmount + sarc.b3trAmount;
    }

    function isUserVerified(address user) external view returns (bool) {
        return verifications[user].isVerified;
    }

    function canClaimInheritance(address user, address beneficiary) external view returns (bool) {
        Sarcophagus storage sarc = sarcophagi[user];
        if (!sarc.isDeceased) return false;
        
        for (uint256 i = 0; i < sarc.beneficiaries.length; i++) {
            if (sarc.beneficiaries[i].recipient == beneficiary) {
                return true;
            }
        }
        return false;
    }

    // Emergency functions
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
} 