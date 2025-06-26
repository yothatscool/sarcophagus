// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title B3TR Rewards System
 * @author yothatscool
 * @notice Handles B3TR rewards for carbon offset and legacy bonuses
 * @dev Integrates with Vebetter DAO for sustainable tokenomics
 */
contract B3TRRewards is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // Custom errors
    error InsufficientBalance();
    error InvalidAmount();
    error UnauthorizedMinter();
    error TransferPaused();
    error NoRewardsToClaim();
    error InvalidUser();
    error GrandfatheringExpired();
    error AlreadyClaimed();
    error EmergencyModeNotActive();

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VAULT_ROLE = keccak256("VAULT_ROLE");
    bytes32 public constant VEBETTER_ROLE = keccak256("VEBETTER_ROLE");
    
    // Token addresses
    address public immutable b3trToken;
    address public immutable sarcophagusContract;
    
    // Reward rates (in basis points) - ADJUSTABLE based on DAO funding
    uint256 public carbonOffsetRate = 500; // 5% per year of carbon savings (adjustable)
    uint256 public legacyBonusBase = 300; // 3% base bonus for living to expectancy (adjustable)
    uint256 public legacyBonusPerYear = 50; // +0.5% per year beyond expectancy (adjustable)
    uint256 public constant GRANDFATHERING_MULTIPLIER = 150; // 1.5x rate for grandfathering
    
    // Simple carbon offset calculation parameters
    uint256 public constant MAX_CARBON_YEARS = 30; // Maximum 30 years for carbon offset calculation
    
    // Backup funding parameters
    uint256 public constant EMERGENCY_FUNDING_THRESHOLD = 1000e18; // 1000 B3TR minimum
    uint256 public constant COMMUNITY_FUNDING_MULTIPLIER = 120; // 1.2x for community funding
    uint256 public constant EMERGENCY_FUNDING_MULTIPLIER = 150; // 1.5x for emergency funding
    
    // Grandfathering tracking
    struct GrandfatheringData {
        uint256 originalObolRate;
        uint256 b3trRate;
        uint256 deadline;
        bool applied;
    }
    
    mapping(address => GrandfatheringData) public grandfatheringData;
    mapping(address => bool) public hasClaimedInheritance;
    
    // Funding tracking
    mapping(address => uint256) public communityFunding;
    mapping(address => uint256) public emergencyFunding;
    uint256 public totalCommunityFunding;
    uint256 public totalEmergencyFunding;
    bool public emergencyMode;
    
    // DAO funding tracking
    uint256 public totalDaoAllocation; // Total B3TR allocated by DAO
    uint256 public totalRewardsDistributed; // Total B3TR distributed as rewards
    uint256 public daoAllocationPeriod; // Current allocation period
    mapping(uint256 => uint256) public periodAllocations; // period => allocation amount
    
    // Rate adjustment parameters
    uint256 public constant MIN_RATE_MULTIPLIER = 20; // Minimum 20% of original rates
    uint256 public constant MAX_RATE_MULTIPLIER = 200; // Maximum 200% of original rates
    uint256 public immutable rateAdjustmentThreshold; // Adjust rates when 80% of allocation used
    
    // Events
    event CarbonOffsetRewardMinted(address indexed user, uint256 amount, uint256 inheritanceValue);
    event LegacyBonusMinted(address indexed user, uint256 amount, uint256 inheritanceValue);
    event GrandfatheringApplied(address indexed user, uint256 originalRate, uint256 newRate);
    event VebetterAllocationReceived(uint256 amount, string reason);
    event CommunityFundingReceived(address indexed contributor, uint256 amount);
    event EmergencyFundingReceived(address indexed contributor, uint256 amount);
    event EmergencyModeActivated();
    event EmergencyModeDeactivated();
    event RewardRatesAdjusted(uint256 newCarbonOffsetRate, uint256 newLegacyBonusBase, uint256 newLegacyBonusPerYear);
    event RatesAutoAdjusted(uint256 reductionFactor, uint256 usagePercentage);
    
    constructor(address _b3trToken, address _sarcophagusContract, uint256 _rateAdjustmentThreshold) {
        if (_b3trToken == address(0) || _sarcophagusContract == address(0)) {
            revert("Invalid addresses");
        }
        
        b3trToken = _b3trToken;
        sarcophagusContract = _sarcophagusContract;
        rateAdjustmentThreshold = _rateAdjustmentThreshold;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VAULT_ROLE, _sarcophagusContract);
        _grantRole(VEBETTER_ROLE, msg.sender);
    }

    /**
     * @notice Calculate carbon offset B3TR for early death
     * @param yearsEarly Years died before life expectancy
     * @param inheritanceValue Value of inheritance (for scaling)
     * @param hasGrandfathering Whether user has grandfathering applied
     * @return carbonOffset Amount of B3TR for carbon offset
     */
    function calculateCarbonOffset(
        uint256 yearsEarly,
        uint256 inheritanceValue,
        bool hasGrandfathering
    ) public view returns (uint256 carbonOffset) {
        if (yearsEarly == 0) return 0;
        
        // Cap years at maximum
        if (yearsEarly > MAX_CARBON_YEARS) {
            yearsEarly = MAX_CARBON_YEARS;
        }
        
        // Calculate base carbon offset: (years_early × rate × inheritance_value) / 10000
        // Multiply first, then divide to avoid precision loss
        carbonOffset = (yearsEarly * carbonOffsetRate * inheritanceValue) / 10000;
        
        // Apply grandfathering multiplier if applicable
        if (hasGrandfathering) {
            // Multiply first, then divide to avoid precision loss
            carbonOffset = (carbonOffset * GRANDFATHERING_MULTIPLIER) / 100;
        }
        
        return carbonOffset;
    }

    /**
     * @notice Calculate legacy bonus B3TR for living to/beyond life expectancy
     * @param yearsBeyond Years lived beyond life expectancy
     * @param inheritanceValue Value of inheritance
     * @param hasGrandfathering Whether user has grandfathering applied
     * @return legacyBonus Amount of B3TR for legacy bonus
     */
    function calculateLegacyBonus(
        uint256 yearsBeyond,
        uint256 inheritanceValue,
        bool hasGrandfathering
    ) public view returns (uint256 legacyBonus) {
        // Base legacy bonus for living to expectancy
        uint256 baseBonus = (inheritanceValue * legacyBonusBase) / 10000;
        
        // Additional bonus for years beyond expectancy (no cap!)
        uint256 additionalBonus = 0;
        if (yearsBeyond > 0) {
            // Calculate additional bonus: years_beyond × rate × inheritance_value
            additionalBonus = (yearsBeyond * legacyBonusPerYear * inheritanceValue) / 10000;
        }
        
        legacyBonus = baseBonus + additionalBonus;
        
        // Apply grandfathering multiplier if applicable
        if (hasGrandfathering) {
            legacyBonus = (legacyBonus * GRANDFATHERING_MULTIPLIER) / 100;
        }
        
        return legacyBonus;
    }

    /**
     * @notice Mint carbon offset B3TR rewards
     * @param user Address of the user
     * @param yearsEarly Years died before life expectancy
     * @param inheritanceValue Value of inheritance
     */
    function mintCarbonOffsetReward(
        address user,
        uint256 yearsEarly,
        uint256 inheritanceValue
    ) external onlyRole(VAULT_ROLE) nonReentrant {
        if (user == address(0)) revert InvalidUser();
        if (hasClaimedInheritance[user]) revert AlreadyClaimed();
        
        // Check grandfathering status
        GrandfatheringData storage gf = grandfatheringData[user];
        bool hasGrandfathering = gf.applied && block.timestamp <= gf.deadline;
        
        // Calculate carbon offset reward
        uint256 carbonOffset = calculateCarbonOffset(yearsEarly, inheritanceValue, hasGrandfathering);
        
        if (carbonOffset > 0) {
            // Mint B3TR tokens
            IERC20(b3trToken).safeTransfer(user, carbonOffset);
            
            emit CarbonOffsetRewardMinted(user, carbonOffset, inheritanceValue);
        }
    }

    /**
     * @notice Mint legacy bonus B3TR rewards
     * @param user Address of the user
     * @param yearsBeyond Years lived beyond life expectancy
     * @param inheritanceValue Value of inheritance
     */
    function mintLegacyBonus(
        address user,
        uint256 yearsBeyond,
        uint256 inheritanceValue
    ) external onlyRole(VAULT_ROLE) nonReentrant {
        if (user == address(0)) revert InvalidUser();
        if (hasClaimedInheritance[user]) revert AlreadyClaimed();
        
        // Check grandfathering status
        GrandfatheringData storage gf = grandfatheringData[user];
        bool hasGrandfathering = gf.applied && block.timestamp <= gf.deadline;
        
        // Calculate legacy bonus
        uint256 legacyBonus = calculateLegacyBonus(yearsBeyond, inheritanceValue, hasGrandfathering);
        
        if (legacyBonus > 0) {
            // Mint B3TR tokens
            IERC20(b3trToken).safeTransfer(user, legacyBonus);
            
            emit LegacyBonusMinted(user, legacyBonus, inheritanceValue);
        }
    }

    /**
     * @notice Apply grandfathering for inheritance recipient
     * @param user Address of the inheritance recipient
     * @param originalObolRate Original OBOL rate from deceased vault
     */
    function applyGrandfathering(address user, uint256 originalObolRate) external onlyRole(VAULT_ROLE) {
        if (user == address(0)) revert InvalidUser();
        
        GrandfatheringData storage gf = grandfatheringData[user];
        if (gf.applied) revert AlreadyClaimed();
        
        gf.originalObolRate = originalObolRate;
        gf.b3trRate = (originalObolRate * GRANDFATHERING_MULTIPLIER) / 100;
        gf.deadline = block.timestamp + 90 days; // 90 days to use grandfathering
        gf.applied = true;
        
        emit GrandfatheringApplied(user, originalObolRate, gf.b3trRate);
    }

    /**
     * @notice Receive B3TR allocation from Vebetter DAO
     * @param amount Amount of B3TR allocated
     * @param period Allocation period
     * @param reason Reason for allocation
     */
    function receiveDaoAllocation(
        uint256 amount, 
        uint256 period, 
        string calldata reason
    ) external onlyRole(VEBETTER_ROLE) {
        if (amount == 0) revert InvalidAmount();
        
        // Update allocation tracking
        totalDaoAllocation += amount;
        periodAllocations[period] += amount;
        daoAllocationPeriod = period;
        
        // Transfer B3TR from DAO
        IERC20(b3trToken).safeTransferFrom(msg.sender, address(this), amount);
        
        emit VebetterAllocationReceived(amount, reason);
    }

    /**
     * @notice Check grandfathering status for a user
     * @param user Address to check
     * @return applied Whether grandfathering is applied
     * @return deadline When grandfathering expires
     * @return originalRate Original OBOL rate
     * @return b3trRate Current B3TR rate
     */
    function getGrandfatheringStatus(address user) external view returns (
        bool applied,
        uint256 deadline,
        uint256 originalRate,
        uint256 b3trRate
    ) {
        GrandfatheringData storage gf = grandfatheringData[user];
        return (gf.applied, gf.deadline, gf.originalObolRate, gf.b3trRate);
    }

    /**
     * @notice Get B3TR reward parameters
     */
    function getRewardParameters() external view returns (
        uint256 carbonOffsetRateValue,
        uint256 legacyBonusBaseValue,
        uint256 legacyBonusPerYearValue,
        uint256 maxCarbonYears,
        uint256 grandfatheringMultiplier
    ) {
        return (
            carbonOffsetRate,
            legacyBonusBase,
            legacyBonusPerYear,
            MAX_CARBON_YEARS,
            GRANDFATHERING_MULTIPLIER
        );
    }

    /**
     * @notice Community funding for B3TR rewards (backup to Vebetter DAO)
     * @param amount Amount of B3TR to contribute
     */
    function contributeCommunityFunding(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        
        // Transfer B3TR from contributor
        IERC20(b3trToken).safeTransferFrom(msg.sender, address(this), amount);
        
        // Record contribution
        communityFunding[msg.sender] += amount;
        totalCommunityFunding += amount;
        
        emit CommunityFundingReceived(msg.sender, amount);
    }

    /**
     * @notice Emergency funding for B3TR rewards (when Vebetter DAO allocation fails)
     * @param amount Amount of B3TR to contribute
     */
    function contributeEmergencyFunding(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        if (!emergencyMode) revert EmergencyModeNotActive();
        
        // Transfer B3TR from contributor
        IERC20(b3trToken).safeTransferFrom(msg.sender, address(this), amount);
        
        // Record contribution
        emergencyFunding[msg.sender] += amount;
        totalEmergencyFunding += amount;
        
        emit EmergencyFundingReceived(msg.sender, amount);
    }

    /**
     * @notice Activate emergency mode when Vebetter DAO allocation fails
     */
    function activateEmergencyMode() external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyMode = true;
        emit EmergencyModeActivated();
    }

    /**
     * @notice Deactivate emergency mode when normal funding resumes
     */
    function deactivateEmergencyMode() external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyMode = false;
        emit EmergencyModeDeactivated();
    }

    /**
     * @notice Adjust reward rates based on available funding
     * @param newCarbonOffsetRate New carbon offset rate (basis points)
     * @param newLegacyBonusBase New legacy bonus base rate (basis points)
     * @param newLegacyBonusPerYear New legacy bonus per year rate (basis points)
     */
    function adjustRewardRates(
        uint256 newCarbonOffsetRate,
        uint256 newLegacyBonusBase,
        uint256 newLegacyBonusPerYear
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Validate rate ranges
        if (newCarbonOffsetRate < 50 || newCarbonOffsetRate > 2000) revert InvalidAmount(); // 0.5% to 20%
        if (newLegacyBonusBase < 50 || newLegacyBonusBase > 1000) revert InvalidAmount(); // 0.5% to 10%
        if (newLegacyBonusPerYear < 10 || newLegacyBonusPerYear > 200) revert InvalidAmount(); // 0.1% to 2%
        
        carbonOffsetRate = newCarbonOffsetRate;
        legacyBonusBase = newLegacyBonusBase;
        legacyBonusPerYear = newLegacyBonusPerYear;
        
        emit RewardRatesAdjusted(newCarbonOffsetRate, newLegacyBonusBase, newLegacyBonusPerYear);
    }

    /**
     * @notice Auto-adjust rates based on funding usage
     */
    function autoAdjustRates() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 usagePercentage = (totalRewardsDistributed * 100) / totalDaoAllocation;
        
        if (usagePercentage >= rateAdjustmentThreshold) {
            // Reduce rates when funding is running low
            uint256 reductionFactor = 100 - ((usagePercentage - rateAdjustmentThreshold) * 2); // Reduce by 2% per 1% over threshold
            
            if (reductionFactor < MIN_RATE_MULTIPLIER) {
                reductionFactor = MIN_RATE_MULTIPLIER;
            }
            
            carbonOffsetRate = (carbonOffsetRate * reductionFactor) / 100;
            legacyBonusBase = (legacyBonusBase * reductionFactor) / 100;
            legacyBonusPerYear = (legacyBonusPerYear * reductionFactor) / 100;
            
            emit RatesAutoAdjusted(reductionFactor, usagePercentage);
        }
    }

    /**
     * @notice Get current funding status
     * @return totalAllocated Total B3TR allocated by DAO
     * @return totalDistributed Total B3TR distributed as rewards
     * @return remainingFunding Remaining B3TR available
     * @return usagePercentage Percentage of allocation used
     */
    function getFundingStatus() external view returns (
        uint256 totalAllocated,
        uint256 totalDistributed,
        uint256 remainingFunding,
        uint256 usagePercentage
    ) {
        totalAllocated = totalDaoAllocation;
        totalDistributed = totalRewardsDistributed;
        remainingFunding = totalDaoAllocation - totalRewardsDistributed;
        usagePercentage = totalDaoAllocation > 0 ? (totalRewardsDistributed * 100) / totalDaoAllocation : 0;
        
        return (totalAllocated, totalDistributed, remainingFunding, usagePercentage);
    }

    /**
     * @notice Check if there's sufficient funding for a reward
     * @param rewardAmount Amount of B3TR needed for reward
     * @return hasFunding Whether sufficient funding is available
     */
    function hasSufficientFunding(uint256 rewardAmount) public view returns (bool hasFunding) {
        uint256 remainingFunding = totalDaoAllocation - totalRewardsDistributed;
        return remainingFunding >= rewardAmount;
    }

    // Emergency functions
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function emergencyWithdraw(address token, address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (to == address(0)) revert InvalidUser();
        if (amount == 0) revert InvalidAmount();
        
        IERC20(token).safeTransfer(to, amount);
    }

    /**
     * @notice Get tokenomics info
     */
    function getTokenomics() external view returns (
        uint256 carbonOffsetRateValue,
        uint256 legacyBonusBaseValue,
        uint256 legacyBonusPerYearValue,
        uint256 totalDaoAllocationValue,
        uint256 totalRewardsDistributedValue,
        uint256 remainingAllocation
    ) {
        return (
            carbonOffsetRate,
            legacyBonusBase,
            legacyBonusPerYear,
            totalDaoAllocation,
            totalRewardsDistributed,
            totalDaoAllocation - totalRewardsDistributed
        );
    }
}
