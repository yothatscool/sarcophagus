// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/VereavementStorage.sol";

/**
 * @title IVereavementRitual
 * @author yothatscool
 * @notice Interface for ritual mechanics in the Vereavement protocol
 */
interface IVereavementRitual {
    struct RitualState {
        uint256 totalValue;
        uint256 carbonOffset;
        uint256 longevityScore;
        uint256 lastGrowthTime;
        bool isActive;
        string[] memorials;
    }

    // Events
    event RitualVaultCreated(address indexed user, uint256 initialValue);
    event RitualVaultUpdated(address indexed user, uint256 newValue);
    event CarbonOffsetRecorded(address indexed user, uint256 amount, string source);
    event MemorialPreserved(address indexed user, string memorialHash);
    event LegacyRitualCompleted(address indexed user, string ritualType);
    event SymbolicGrowthProcessed(address indexed user, uint256 growth);

    /**
     * @notice Creates a new ritual vault for the caller
     */
    function createRitualVault() external;

    /**
     * @notice Records a carbon offset with oracle verification
     * @param amount Amount of carbon offset in metric tons
     * @param source Source of the carbon offset
     * @param oracleKey Oracle verification key
     * @param proof Proof data from oracle
     * @param signature Oracle signature
     */
    function recordCarbonOffset(
        uint256 amount,
        string calldata source,
        bytes32 oracleKey,
        bytes calldata proof,
        bytes calldata signature
    ) external;

    /**
     * @notice Preserves a memorial in the ritual vault
     * @param memorialHash IPFS hash of the memorial content
     */
    function preserveMemorial(string calldata memorialHash) external;

    /**
     * @notice Completes a ritual and updates the vault
     * @param ritualType Type of ritual being completed
     */
    function completeRitual(string calldata ritualType) external;

    /**
     * @notice Processes symbolic growth for the ritual
     */
    function processSymbolicGrowth() external;

    /**
     * @notice Gets the total ritual value for a user
     * @param user Address of the user
     * @return Total ritual value
     */
    function getRitualValue(address user) external view returns (uint256);

    /**
     * @notice Gets the total carbon offset for a user
     * @param user Address of the user
     * @return Total carbon offset in metric tons
     */
    function getCarbonOffset(address user) external view returns (uint256);

    /**
     * @notice Gets the longevity score for a user
     * @param user Address of the user
     * @return Longevity score
     */
    function getLongevityScore(address user) external view returns (uint256);

    /**
     * @notice Gets all memorials for a user
     * @param user Address of the user
     * @return Array of memorial IPFS hashes
     */
    function getMemorials(address user) external view returns (string[] memory);

    /**
     * @notice Checks if a ritual is active for a user
     * @param user Address of the user
     * @return True if the ritual is active, false otherwise
     */
    function isRitualActive(address user) external view returns (bool);

    /**
     * @notice Gets the ritual state for a user
     * @param user Address of the user
     * @return Ritual state
     */
    function getRitualState(address user) external view returns (VereavementStorage.RitualState memory);
} 