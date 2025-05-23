// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IMilestoneManager
 * @author yothatscool
 * @notice Interface for the MilestoneManager contract
 */
interface IMilestoneManager {
    /**
     * @notice Emitted when a milestone is added
     * @param user Address of the user
     * @param beneficiary Address of the beneficiary
     * @param description Description of the milestone
     */
    event MilestoneAdded(address indexed user, address indexed beneficiary, string description);

    /**
     * @notice Emitted when a milestone is achieved
     * @param user Address of the user
     * @param beneficiary Address of the beneficiary
     * @param milestoneIndex Index of the milestone
     * @param amount Amount associated with the milestone
     */
    event MilestoneAchieved(address indexed user, address indexed beneficiary, uint256 milestoneIndex, uint256 amount);

    /**
     * @notice Emitted when a milestone is verified
     * @param user Address of the user
     * @param beneficiary Address of the beneficiary
     * @param milestoneIndex Index of the milestone
     * @param verifier Address of the verifier
     */
    event MilestoneVerified(address indexed user, address indexed beneficiary, uint256 milestoneIndex, address verifier);

    /**
     * @notice Add a new milestone for a beneficiary
     * @param beneficiaryIndex Index of the beneficiary
     * @param amount Amount to be released upon milestone achievement
     * @param description Description of the milestone
     * @param oracleKey Key for oracle verification
     */
    function addMilestone(
        uint256 beneficiaryIndex,
        uint128 amount,
        string calldata description,
        bytes32 oracleKey
    ) external;

    /**
     * @notice Mark a milestone as achieved with oracle verification
     * @param user Address of the user
     * @param beneficiaryIndex Index of the beneficiary
     * @param milestoneIndex Index of the milestone
     * @param oracleKey Key for oracle verification
     * @param proof Verification proof
     * @param signature Oracle signature
     */
    function achieveMilestone(
        address user,
        uint256 beneficiaryIndex,
        uint256 milestoneIndex,
        bytes32 oracleKey,
        bytes calldata proof,
        bytes calldata signature
    ) external;

    /**
     * @notice Get milestones for a beneficiary
     * @param user Address of the user
     * @param beneficiary Address of the beneficiary
     * @return descriptions Milestone descriptions
     * @return amounts Milestone amounts
     * @return achievements Whether milestones are achieved
     * @return dates Achievement dates
     */
    function getMilestones(address user, address beneficiary) external view returns (
        string[] memory descriptions,
        uint256[] memory amounts,
        bool[] memory achievements,
        uint256[] memory dates
    );

    /**
     * @notice Get milestone details
     * @param user Address of the user
     * @param beneficiaryIndex Index of the beneficiary
     * @param milestoneIndex Index of the milestone
     * @return amount Milestone amount
     * @return achievementDate Achievement date
     * @return description Milestone description
     * @return isAchieved Whether milestone is achieved
     */
    function getMilestoneDetails(
        address user,
        uint256 beneficiaryIndex,
        uint256 milestoneIndex
    ) external view returns (
        uint256 amount,
        uint256 achievementDate,
        string memory description,
        bool isAchieved
    );

    /**
     * @notice Get the oracle role identifier
     * @return bytes32 The oracle role identifier
     */
    function ORACLE_ROLE() external pure returns (bytes32);
} 