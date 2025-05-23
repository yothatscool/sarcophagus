// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IAgeVerification
 * @author yothatscool
 * @notice Interface for the AgeVerification contract
 */
interface IAgeVerification {
    /**
     * @notice Emitted when a person's age is verified
     * @param person Address of the person
     * @param birthYear Year of birth
     * @param verifier Address of the verifier
     */
    event AgeVerified(address indexed person, uint256 birthYear, address verifier);

    /**
     * @notice Emitted when a verifier's authorization status changes
     * @param verifier Address of the verifier
     * @param status New authorization status
     */
    event AgeVerifierAuthorized(address indexed verifier, bool status);

    /**
     * @notice Authorize or revoke an age verifier
     * @param verifier Address of the verifier
     * @param status Authorization status
     */
    function setAgeVerifier(address verifier, bool status) external;

    /**
     * @notice Verify age of a person
     * @param person Address of the person
     * @param birthYear Year of birth
     * @param proof Verification proof
     */
    function verifyAge(
        address person,
        uint256 birthYear,
        bytes calldata proof
    ) external;

    /**
     * @notice Check age of a person
     * @param person Address to check
     * @return age Current age in years
     */
    function checkAge(address person) external view returns (uint256 age);

    /**
     * @notice Get verification details for a person
     * @param person Address to check
     * @return birthYear Year of birth
     * @return verificationTimestamp When verification occurred
     * @return verifier Address that performed verification
     * @return isVerified Whether age is verified
     */
    function getVerificationDetails(address person) external view returns (
        uint256 birthYear,
        uint256 verificationTimestamp,
        address verifier,
        bool isVerified
    );

    /**
     * @notice Check if an address is an authorized verifier
     * @param verifier Address to check
     * @return bool Whether address is authorized
     */
    function isAuthorizedVerifier(address verifier) external view returns (bool);
} 