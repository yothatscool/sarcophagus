// Contract addresses
export const CONTRACT_ADDRESSES = {
  VEREAVEMENT: process.env.NEXT_PUBLIC_VEREAVEMENT_ADDRESS || '0x...',
  RITUAL_ENGINE: process.env.NEXT_PUBLIC_RITUAL_ENGINE_ADDRESS || '0x...',
  TOKEN_MANAGER: process.env.NEXT_PUBLIC_TOKEN_MANAGER_ADDRESS || '0x...',
  AGE_VERIFICATION: process.env.NEXT_PUBLIC_AGE_VERIFICATION_ADDRESS || '0x...'
};

// Contract ABIs
export const VEREAVEMENT_ABI = [
  "function createRitualVault() external",
  "function recordCarbonOffset(uint256 amount, string calldata source, bytes32 proofHash) external",
  "function processSymbolicGrowth() external",
  "function getRitualValue(address user) external view returns (uint256)",
  "function getCarbonOffset(address user) external view returns (uint256)",
  "function getLongevityScore(address user) external view returns (uint256)",
  "function getMemorials(address user) external view returns (string[] memory)",
  "function completeRitual(string calldata ritualType) external",
  "function preserveMemorial(string calldata memorialHash) external",
  "function initialize() external",
  "function addBeneficiary(address beneficiary, uint256 percentage) external"
];

export const RITUAL_ENGINE_ABI = [
  "function recordCarbonOffset(uint256 amount, string calldata source, bytes32 proofHash) external",
  "function updateLongevityMetrics() external",
  "function processSymbolicGrowth() external",
  "function getRitualValue(address user) external view returns (uint256)",
  "function getLongevityScore(address user) external view returns (uint256)",
  "function getTotalCarbonOffset(address user) external view returns (uint256)",
  "function calculateLongevityScore(address user) external view returns (uint256)",
  "function batchRecordCarbonOffset(address[] calldata users, uint256[] calldata amounts, string[] calldata sources, bytes32[] calldata proofHashes) external",
  "function batchUpdateLongevityMetrics(address[] calldata users) external",
  "function batchProcessSymbolicGrowth(address[] calldata users) external returns (uint256[] memory values)",
  "function batchGetRitualStates(address[] calldata users) external view returns (uint256[] memory scores, uint256[] memory offsets, uint256[] memory values)"
];

export const TOKEN_MANAGER_ABI = [
  "function addToken(address tokenAddress) external",
  "function setTokenStatus(address tokenAddress, bool isEnabled) external",
  "function depositToken(address tokenAddress, uint256 amount) external",
  "function claimVTHO() external",
  "function updateB3TRToken(address newAddress) external",
  "function getTokenBalance(address user, address tokenAddress) external view returns (uint256)",
  "function getSupportedTokens(address user) external view returns (address[] memory)",
  "function getTokenStatus(address user, address tokenAddress) external view returns (bool isEnabled, bool isVthoEnabled, bool isB3trEnabled)",
  "function VTHO() external pure returns (address)",
  "function b3trToken() external view returns (address)"
];

export const AGE_VERIFICATION_ABI = [
  "function setAgeVerifier(address verifier, bool status) external",
  "function verifyAge(address person, uint256 birthYear, bytes calldata proof) external",
  "function checkAge(address person) external view returns (uint256 age)",
  "function getVerificationDetails(address person) external view returns (uint256 birthYear, uint256 verificationTimestamp, address verifier, bool isVerified)",
  "function isAuthorizedVerifier(address verifier) external view returns (bool)"
]; 