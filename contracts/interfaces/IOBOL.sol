// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IOBOL
 * @notice Interface for the OBOL token contract with hybrid earning system
 */
interface IOBOL {
    // Struct for user staking data
    struct UserStake {
        uint256 lockedValue;
        uint256 lastClaimTime;
        uint256 startTime;
        uint256 totalEarned;
        uint256 pendingRewards;
    }

    /**
     * @notice Mint initial deposit bonus (one-time reward)
     * @param user Address of the user making the deposit
     * @param depositValue Value of the deposit in VET equivalent
     */
    function mintInitialBonus(address user, uint256 depositValue) external;
    
    /**
     * @notice Legacy function for backward compatibility
     * @param user Address of the user making the deposit
     * @param depositValue Value of the deposit in VET equivalent
     */
    function mintVaultReward(address user, uint256 depositValue) external;
    
    /**
     * @notice Start or update continuous earning for a user
     * @param user Address of the user
     * @param lockedValue New total locked value in VET equivalent
     */
    function updateUserStake(address user, uint256 lockedValue) external;
    
    /**
     * @notice Claim continuous rewards for a user
     * @param user Address of the user claiming rewards
     */
    function claimContinuousRewards(address user) external;
    
    /**
     * @notice Calculate pending rewards for a user
     * @param user Address of the user
     * @return pendingRewards Amount of pending rewards
     */
    function getPendingRewards(address user) external view returns (uint256);
    
    /**
     * @notice Lock OBOL tokens in vault
     * @param vaultAddress Address of the vault contract
     * @param amount Amount of OBOL to lock
     */
    function lockInVault(address vaultAddress, uint256 amount) external;
    
    /**
     * @notice Get user staking information
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
    );
    
    /**
     * @notice Get daily reward rate for a user (optimized for inheritance tracking)
     * @param user Address of the user
     * @return dailyRewardRate Daily reward rate for the user
     */
    function getDailyRewardRate(address user) external view returns (uint256 dailyRewardRate);
    
    /**
     * @notice Get remaining reward supply available for minting
     * @return Remaining reward supply
     */
    function getRemainingRewardSupply() external view returns (uint256);
    
    /**
     * @notice Get vesting progress (0-100)
     */
    function getVestingProgress() external view returns (uint256);
    
    /**
     * @notice Get hybrid earning rates
     */
    function getEarningRates() external view returns (
        uint256 initialBonusRate,
        uint256 dailyRate,
        uint256 bonusRate,
        uint256 bonusThreshold,
        uint256 dailyAPY,
        uint256 bonusAPY,
        uint256 currentDecayedRate
    );
    
    /**
     * @notice Get tokenomics info
     * @return totalSupply Total supply of OBOL
     * @return initialSupply Initial supply (vested)
     * @return rewardSupply Reward supply (minted as rewards)
     * @return initialBonusRate Initial bonus rate per VET
     * @return dailyRewardRate Daily reward rate
     * @return bonusRewardRate Bonus reward rate for long-term holders
     */
    function getTokenomics() external view returns (
        uint256 totalSupply,
        uint256 initialSupply,
        uint256 rewardSupply,
        uint256 initialBonusRate,
        uint256 dailyRewardRate,
        uint256 bonusRewardRate
    );
    
    /**
     * @notice Grant vault role to a contract
     * @param vault Address of the vault contract
     */
    function grantVaultRole(address vault) external;
    
    /**
     * @notice Revoke vault role from a contract
     * @param vault Address of the vault contract
     */
    function revokeVaultRole(address vault) external;
    
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
    );
} 