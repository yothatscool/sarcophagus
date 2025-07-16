// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IOBOL.sol";

/**
 * @title OBOL Token - Hybrid Earning System
 * @author yothatscool
 * @notice Vault reward token with initial bonuses + continuous earning
 * @dev Hybrid tokenomics: 5% initial supply (vested), 95% minted as rewards
 */
contract OBOL is ERC20, AccessControl, Pausable, ReentrancyGuard, IOBOL {
    
    // Custom errors
    error InsufficientBalance();
    error InvalidAmount();
    error UnauthorizedMinter();
    error TransferPaused();
    error VestingNotStarted();
    error VestingAlreadyClaimed();
    error VestingNotReady();
    error NoRewardsToClaim();
    error InvalidUser();
    error DailyRewardCapExceeded();
    error TotalRewardSupplyExceeded();

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VAULT_ROLE = keccak256("VAULT_ROLE");
    
    // Token details
    uint256 public constant TOTAL_SUPPLY = 100_000_000 * 10**18; // 100 million OBOL
    uint256 public constant INITIAL_SUPPLY = 5_000_000 * 10**18; // 5 million OBOL (5%)
    uint256 public constant REWARD_SUPPLY = 95_000_000 * 10**18; // 95 million OBOL (95%)
    
    // SUSTAINABLE Hybrid earning rates
    uint256 public constant INITIAL_BONUS_RATE = 0.1 * 1e18; // 0.1 OBOL per 1 VET (10x reduction)
    uint256 public constant DAILY_REWARD_RATE = 1; // 0.01% daily = 3.65% APY (sustainable)
    uint256 public constant BONUS_REWARD_RATE = 15; // 0.015% daily = 5.475% APY (sustainable)
    uint256 public constant BONUS_THRESHOLD = 365 days; // 1 year for bonus
    
    // Time-based rate decay (reduces rates over time)
    uint256 public constant RATE_DECAY_START = 365 days; // Start decay after 1 year
    uint256 public constant RATE_DECAY_RATE = 10; // 10% reduction per year
    uint256 public constant MIN_RATE_MULTIPLIER = 20; // Minimum 20% of original rate
    
    // Supply protection
    uint256 public constant MAX_INITIAL_BONUS_PER_DEPOSIT = 100_000 * 10**18; // Max 100k OBOL per deposit
    uint256 public constant DAILY_REWARD_CAP = 1_000_000 * 10**18; // Max 1M OBOL per day
    uint256 public constant MAX_UNCLAIMED_REWARDS = 1500 * 10**18; // Max 1500 OBOL unclaimed rewards
    
    // Vesting details
    uint256 public constant VESTING_DURATION = 365 days; // 1 year
    uint256 public constant VESTING_CLIFF = 30 days; // 30 day cliff
    uint256 public immutable vestingStartTime;
    uint256 public immutable vestingEndTime;
    
    // Weighted average rate parameters
    uint256 public constant WEIGHT_BASE_STAKE = 100; // Base weight for staking
    uint256 public constant WEIGHT_TIME_MULTIPLIER = 50; // Additional weight per year
    uint256 public constant WEIGHT_AMOUNT_MULTIPLIER = 10; // Additional weight per 1000 VET
    uint256 public constant MAX_WEIGHT_MULTIPLIER = 300; // Maximum 3x weight multiplier
    uint256 public constant MIN_STAKE_FOR_WEIGHT = 100e18; // Minimum 100 VET for weight bonus
    
    // User staking data for continuous earning (defined in interface)
    // struct UserStake {
    //     uint256 lockedValue; // Total VET equivalent locked
    //     uint256 lastClaimTime; // Last time rewards were claimed
    //     uint256 startTime; // When user first started staking
    //     uint256 totalEarned; // Total OBOL earned by user
    //     uint256 pendingRewards; // Pending rewards to claim
    // }
    
    // Staking tracking
    mapping(address => UserStake) public userStakes;
    mapping(address => bool) public hasClaimedVesting;
    uint256 public totalMintedRewards;
    uint256 public totalLockedValue;
    
    // Daily reward tracking
    mapping(uint256 => uint256) public dailyRewardsMinted; // day => amount minted
    uint256 public constant lastRewardDay = 0; // Never modified, can be constant
    
    // Events
    event VaultRewardMinted(address indexed user, uint256 amount, uint256 depositValue);
    event VaultRewardClaimed(address indexed user, uint256 amount);
    event VaultRewardLocked(address indexed user, uint256 amount);
    event ContinuousRewardClaimed(address indexed user, uint256 amount, uint256 timeElapsed);
    event StakingStarted(address indexed user, uint256 lockedValue);
    event StakingUpdated(address indexed user, uint256 newLockedValue);
    event VestingClaimed(address indexed user, uint256 amount);
    event VestingStarted(uint256 startTime, uint256 endTime);

    constructor() ERC20("OBOL", "OBOL") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VAULT_ROLE, msg.sender);
        
        // Set vesting schedule
        vestingStartTime = block.timestamp;
        vestingEndTime = block.timestamp + VESTING_DURATION;
        
        // Mint initial supply to contract (will be claimed through vesting)
        _mint(address(this), INITIAL_SUPPLY);
        
        emit VestingStarted(vestingStartTime, vestingEndTime);
    }

    /**
     * @notice Start or update continuous earning for a user
     * @param user Address of the user
     * @param lockedValue New total locked value in VET equivalent
     */
    function updateUserStake(address user, uint256 lockedValue) external onlyRole(VAULT_ROLE) {
        if (user == address(0)) revert InvalidUser();
        
        UserStake storage stake = userStakes[user];
        
        // Calculate pending rewards before updating
        if (stake.lockedValue > 0) {
            _calculatePendingRewards(user);
        }
        
        // Update staking data
        if (stake.startTime == 0) {
            // First time staking
            stake.startTime = block.timestamp;
            emit StakingStarted(user, lockedValue);
        }
        
        uint256 oldValue = stake.lockedValue;
        stake.lockedValue = lockedValue;
        stake.lastClaimTime = block.timestamp;
        
        // Update global totals
        totalLockedValue = totalLockedValue - oldValue + lockedValue;
        
        if (oldValue != lockedValue) {
            emit StakingUpdated(user, lockedValue);
        }
    }

    /**
     * @notice Claim continuous rewards for a user
     * @param user Address of the user claiming rewards
     */
    function claimContinuousRewards(address user) external nonReentrant {
        if (user == address(0)) revert InvalidUser();
        
        UserStake storage stake = userStakes[user];
        if (stake.lockedValue == 0) revert NoRewardsToClaim();
        
        // Calculate pending rewards
        uint256 pendingRewards = _calculatePendingRewards(user);
        if (pendingRewards <= 0) revert NoRewardsToClaim();
        
        // Check daily cap
        uint256 currentDay = block.timestamp / 1 days;
        if (dailyRewardsMinted[currentDay] + pendingRewards > DAILY_REWARD_CAP) {
            revert DailyRewardCapExceeded();
        }
        
        // Check total supply cap
        if (totalMintedRewards + pendingRewards > REWARD_SUPPLY) {
            revert TotalRewardSupplyExceeded();
        }
        
        // Update tracking
        stake.lastClaimTime = block.timestamp;
        stake.totalEarned += pendingRewards;
        stake.pendingRewards = 0;
        totalMintedRewards += pendingRewards;
        dailyRewardsMinted[currentDay] += pendingRewards;
        
        // Mint rewards
        if (pendingRewards > 0) {
            _mint(user, pendingRewards);
        }
        
        emit ContinuousRewardClaimed(user, pendingRewards, block.timestamp - stake.lastClaimTime);
    }

    /**
     * @notice Calculate time-based rate decay (reduces rates over time)
     * @param baseRate Base reward rate
     * @param startTime When the protocol started
     * @return decayedRate Rate after applying time decay
     */
    function calculateTimeDecay(uint256 baseRate, uint256 startTime) public view returns (uint256 decayedRate) {
        uint256 timeElapsed = block.timestamp - startTime;
        
        if (timeElapsed < RATE_DECAY_START) {
            // No decay for first year
            return baseRate;
        }
        
        // Calculate years since decay started
        uint256 yearsSinceDecay = (timeElapsed - RATE_DECAY_START) / 365 days;
        
        // Apply compound decay: rate * (0.9 ^ years)
        // This reduces rate by 10% per year
        // Multiply first, then subtract to avoid precision loss
        uint256 decayMultiplier = 100 - (yearsSinceDecay * RATE_DECAY_RATE);
        
        // Ensure minimum rate (20% of original)
        if (decayMultiplier < MIN_RATE_MULTIPLIER) {
            decayMultiplier = MIN_RATE_MULTIPLIER;
        }
        
        // Multiply first, then divide to avoid precision loss
        decayedRate = (baseRate * decayMultiplier) / 100;
        return decayedRate;
    }

    /**
     * @notice Calculate weighted average reward rate for a user
     * @param user Address of the user
     * @return weightedRate Weighted average daily rate
     * @return weightMultiplier Current weight multiplier
     */
    function calculateWeightedRate(address user) public view returns (uint256 weightedRate, uint256 weightMultiplier) {
        UserStake storage stake = userStakes[user];
        if (stake.lockedValue == 0) return (0, 0);
        
        // Base weight
        uint256 weight = WEIGHT_BASE_STAKE;
        
        // Time-based weight (additional weight per year of staking)
        uint256 totalStakingTime = block.timestamp - stake.startTime;
        uint256 yearsStaked = totalStakingTime / 365 days;
        weight += yearsStaked * WEIGHT_TIME_MULTIPLIER;
        
        // Amount-based weight (additional weight per 1000 VET staked)
        // Divide first to get thousands, then multiply to avoid precision loss
        uint256 stakeInThousands = stake.lockedValue / 1000e18;
        if (stake.lockedValue >= MIN_STAKE_FOR_WEIGHT) {
            weight += stakeInThousands * WEIGHT_AMOUNT_MULTIPLIER;
        }
        
        // Cap weight multiplier
        if (weight > MAX_WEIGHT_MULTIPLIER) {
            weight = MAX_WEIGHT_MULTIPLIER;
        }
        
        // Calculate weighted rate: base_rate + (bonus_rate - base_rate) * (weight - base_weight) / (max_weight - base_weight)
        uint256 weightRange = MAX_WEIGHT_MULTIPLIER - WEIGHT_BASE_STAKE;
        uint256 weightBonus = weight - WEIGHT_BASE_STAKE;
        uint256 rateRange = BONUS_REWARD_RATE - DAILY_REWARD_RATE;
        
        // Multiply first, then divide to avoid precision loss
        weightedRate = DAILY_REWARD_RATE + (rateRange * weightBonus) / weightRange;
        
        // Apply time-based decay
        weightedRate = calculateTimeDecay(weightedRate, vestingStartTime);
        
        weightMultiplier = weight;
        
        return (weightedRate, weightMultiplier);
    }

    /**
     * @notice Calculate pending rewards for a user using weighted average rates
     * @param user Address of the user
     * @return pendingRewards Amount of pending rewards
     */
    function _calculatePendingRewards(address user) internal returns (uint256 pendingRewards) {
        UserStake storage stake = userStakes[user];
        if (stake.lockedValue == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - stake.lastClaimTime;
        if (timeElapsed <= 0) return 0;
        
        // Calculate weighted average rate
        (uint256 weightedRate,) = calculateWeightedRate(user);
        
        // Calculate rewards: (locked_value * weighted_rate * time_elapsed) / 1 day
        // Multiply first, then divide to avoid precision loss
        uint256 daysElapsed = timeElapsed / 1 days;
        pendingRewards = (stake.lockedValue * weightedRate * daysElapsed) / 1e18;
        
        // HARD CAP: Limit unclaimed rewards to MAX_UNCLAIMED_REWARDS
        uint256 currentPending = stake.pendingRewards;
        uint256 totalUnclaimed = currentPending + pendingRewards;
        
        if (totalUnclaimed > MAX_UNCLAIMED_REWARDS) {
            // Cap the new rewards to not exceed the maximum
            uint256 maxNewRewards = MAX_UNCLAIMED_REWARDS > currentPending ? 
                MAX_UNCLAIMED_REWARDS - currentPending : 0;
            pendingRewards = maxNewRewards;
        }
        
        stake.pendingRewards = currentPending + pendingRewards;
        return pendingRewards;
    }

    /**
     * @notice Get pending rewards for a user (view function) using weighted average rates
     * @param user Address of the user
     * @return pendingRewards Amount of pending rewards
     */
    function getPendingRewards(address user) external view returns (uint256 pendingRewards) {
        UserStake storage stake = userStakes[user];
        if (stake.lockedValue == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - stake.lastClaimTime;
        if (timeElapsed <= 0) return 0;
        
        // Calculate weighted average rate
        (uint256 weightedRate,) = calculateWeightedRate(user);
        
        // Calculate rewards: (locked_value * weighted_rate * time_elapsed) / 1 day
        // Multiply first, then divide to avoid precision loss
        uint256 daysElapsed = timeElapsed / 1 days;
        pendingRewards = (stake.lockedValue * weightedRate * daysElapsed) / 1e18;
        
        // HARD CAP: Limit unclaimed rewards to MAX_UNCLAIMED_REWARDS
        uint256 currentPending = stake.pendingRewards;
        uint256 totalUnclaimed = currentPending + pendingRewards;
        
        if (totalUnclaimed > MAX_UNCLAIMED_REWARDS) {
            // Cap the new rewards to not exceed the maximum
            uint256 maxNewRewards = MAX_UNCLAIMED_REWARDS > currentPending ? 
                MAX_UNCLAIMED_REWARDS - currentPending : 0;
            pendingRewards = maxNewRewards;
        }
        
        return pendingRewards;
    }

    /**
     * @notice Mint initial OBOL bonus for vault deposit (one-time reward)
     * @param user Address of the user making the deposit
     * @param depositValue Value of the deposit in VET equivalent
     */
    function mintInitialBonus(address user, uint256 depositValue) public onlyRole(VAULT_ROLE) {
        if (user == address(0)) revert InvalidUser();
        if (depositValue == 0) revert InvalidAmount();
        
        // Initial bonus: 0.1 OBOL per 1 VET (sustainable rate)
        uint256 bonusAmount = (depositValue * INITIAL_BONUS_RATE) / 1e18;
        
        // SUPPLY PROTECTION: Cap maximum bonus per deposit
        if (bonusAmount > MAX_INITIAL_BONUS_PER_DEPOSIT) {
            bonusAmount = MAX_INITIAL_BONUS_PER_DEPOSIT;
        }
        
        // Check if we haven't exceeded the reward supply
        if (totalMintedRewards + bonusAmount > REWARD_SUPPLY) {
            bonusAmount = REWARD_SUPPLY - totalMintedRewards;
        }
        
        if (bonusAmount > 0) {
            _mint(user, bonusAmount);
            totalMintedRewards += bonusAmount;
            emit VaultRewardMinted(user, bonusAmount, depositValue);
        }
    }

    /**
     * @notice Legacy function for backward compatibility
     * @param user Address of the user making the deposit
     * @param depositValue Value of the deposit in VET equivalent
     */
    function mintVaultReward(address user, uint256 depositValue) external onlyRole(VAULT_ROLE) {
        mintInitialBonus(user, depositValue);
    }

    /**
     * @notice Lock OBOL tokens in vault for inheritance
     * @param vaultAddress Address of the vault contract
     * @param amount Amount of OBOL to lock
     */
    function lockInVault(address vaultAddress, uint256 amount) external nonReentrant {
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();
        
        // Transfer tokens to vault
        _transfer(msg.sender, vaultAddress, amount);
        
        emit VaultRewardLocked(msg.sender, amount);
    }

    /**
     * @notice Claim vested tokens
     * @param user Address of the user claiming vesting
     */
    function claimVesting(address user) external nonReentrant {
        if (user == address(0)) revert InvalidUser();
        if (hasClaimedVesting[user]) revert VestingAlreadyClaimed();
        
        // Check if vesting cliff has passed
        if (block.timestamp < vestingStartTime + VESTING_CLIFF) {
            revert VestingNotReady();
        }
        
        uint256 vestedAmount = getVestedAmount();
        if (vestedAmount <= 0) revert VestingNotReady();
        
        hasClaimedVesting[user] = true;
        
        // Transfer vested tokens
        _transfer(address(this), user, vestedAmount);
        
        emit VestingClaimed(user, vestedAmount);
    }

    /**
     * @notice Get the amount of tokens that have vested
     */
    function getVestedAmount() public view returns (uint256) {
        if (block.timestamp < vestingStartTime + VESTING_CLIFF) {
            return 0; // No tokens vested before cliff
        }
        
        if (block.timestamp >= vestingEndTime) {
            return INITIAL_SUPPLY; // All tokens vested
        }
        
        uint256 timeElapsed = block.timestamp - vestingStartTime;
        return (INITIAL_SUPPLY * timeElapsed) / VESTING_DURATION;
    }

    /**
     * @notice Get user staking information with weighted rates
     * @param user Address of the user
     */
    function getUserStake(address user) external view returns (
        uint256 lockedValue,
        uint256 lastClaimTime,
        uint256 startTime,
        uint256 totalEarned,
        uint256 pendingRewards,
        uint256 dailyRewardRate,
        bool isLongTermHolder
    ) {
        UserStake storage stake = userStakes[user];
        uint256 totalStakingTime = block.timestamp - stake.startTime;
        bool longTerm = totalStakingTime >= BONUS_THRESHOLD;
        
        return (
            stake.lockedValue,
            stake.lastClaimTime,
            stake.startTime,
            stake.totalEarned,
            this.getPendingRewards(user),
            longTerm ? BONUS_REWARD_RATE : DAILY_REWARD_RATE,
            longTerm
        );
    }

    /**
     * @notice Get daily reward rate for a user (optimized for inheritance tracking)
     * @param user Address of the user
     * @return dailyRewardRate Daily reward rate for the user
     */
    function getDailyRewardRate(address user) external view returns (uint256 dailyRewardRate) {
        UserStake storage stake = userStakes[user];
        uint256 totalStakingTime = block.timestamp - stake.startTime;
        bool longTerm = totalStakingTime >= BONUS_THRESHOLD;
        
        return longTerm ? BONUS_REWARD_RATE : DAILY_REWARD_RATE;
    }

    /**
     * @notice Get remaining reward supply available for minting
     */
    function getRemainingRewardSupply() external view returns (uint256) {
        return REWARD_SUPPLY - totalMintedRewards;
    }

    /**
     * @notice Get vesting progress (0-100)
     */
    function getVestingProgress() external view returns (uint256) {
        if (block.timestamp < vestingStartTime) return 0;
        if (block.timestamp >= vestingEndTime) return 100;
        
        uint256 timeElapsed = block.timestamp - vestingStartTime;
        return (timeElapsed * 100) / VESTING_DURATION;
    }

    /**
     * @notice Get hybrid earning rates including weighted average system
     */
    function getEarningRates() external view returns (
        uint256 initialBonusRate,
        uint256 dailyRate,
        uint256 bonusRate,
        uint256 bonusThreshold,
        uint256 dailyAPY,
        uint256 bonusAPY,
        uint256 currentDecayedRate
    ) {
        // Calculate current decayed rate
        uint256 decayedDailyRate = calculateTimeDecay(DAILY_REWARD_RATE, vestingStartTime);
        
        return (
            INITIAL_BONUS_RATE,
            DAILY_REWARD_RATE,
            BONUS_REWARD_RATE,
            BONUS_THRESHOLD,
            DAILY_REWARD_RATE * 365, // Original Daily APY
            BONUS_REWARD_RATE * 365, // Original Bonus APY
            decayedDailyRate // Current decayed rate
        );
    }

    /**
     * @notice Override _update to check if transfers are paused
     */
    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }

    /**
     * @notice Pause all transfers (emergency only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause all transfers
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Grant vault role to a contract
     */
    function grantVaultRole(address vault) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VAULT_ROLE, vault);
    }

    /**
     * @notice Revoke vault role from a contract
     */
    function revokeVaultRole(address vault) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(VAULT_ROLE, vault);
    }

    /**
     * @notice Get tokenomics info
     */
    function getTokenomics() external pure returns (
        uint256 totalSupplyAmount,
        uint256 initialSupply,
        uint256 rewardSupply,
        uint256 initialBonusRate,
        uint256 dailyRewardRate,
        uint256 bonusRewardRate
    ) {
        return (
            TOTAL_SUPPLY,
            INITIAL_SUPPLY,
            REWARD_SUPPLY,
            INITIAL_BONUS_RATE,
            DAILY_REWARD_RATE,
            BONUS_REWARD_RATE
        );
    }

    /**
     * @notice Calculate the initial OBOL reward for a given deposit value
     * @param depositValue Value of the deposit in VET equivalent
     * @return bonusAmount Amount of OBOL to be rewarded
     */
    function calculateReward(uint256 depositValue) public view returns (uint256 bonusAmount) {
        if (depositValue == 0) return 0;
        bonusAmount = (depositValue * INITIAL_BONUS_RATE) / 1e18;
        if (totalMintedRewards + bonusAmount > REWARD_SUPPLY) {
            bonusAmount = REWARD_SUPPLY - totalMintedRewards;
        }
        return bonusAmount;
    }

    /**
     * @notice Check if user has reached the hard cap on unclaimed rewards
     * @param user Address of the user
     * @return hasReachedCap True if user has reached the 1500 OBOL unclaimed cap
     * @return currentUnclaimed Current amount of unclaimed rewards
     * @return maxAllowed Maximum allowed unclaimed rewards (1500 OBOL)
     */
    function hasReachedUnclaimedCap(address user) external view returns (
        bool hasReachedCap,
        uint256 currentUnclaimed,
        uint256 maxAllowed
    ) {
        UserStake storage stake = userStakes[user];
        currentUnclaimed = stake.pendingRewards + this.getPendingRewards(user);
        maxAllowed = MAX_UNCLAIMED_REWARDS;
        hasReachedCap = currentUnclaimed >= maxAllowed;
        
        return (hasReachedCap, currentUnclaimed, maxAllowed);
    }
} 