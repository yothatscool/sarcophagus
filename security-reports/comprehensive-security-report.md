# 🔒 Comprehensive Security Analysis Report
## Vereavement Protocol Smart Contracts

**Analysis Date:** 6/28/2025
**Analysis Time:** 8:46:27 AM

---

## 📊 Executive Summary

### Overall Security Score: 6/10

### Key Findings:
- **Total Issues Found:** 0
- **Critical Issues:** 0
- **High Priority Issues:** 0
- **Medium Priority Issues:** 0
- **Low Priority Issues:** 0

---

## 🛠️ Tool Results

### 1. Slither Static Analysis
**Status:** failed
**Error:** Command failed: py -m slither . --hardhat-ignore-compile --detect all --json security-reports/slither-detailed.json

MultiSigWallet.emergencyWithdraw(address,address,uint256) (contracts/MultiSigWallet.sol#364-377) sends eth to arbitrary user
	Dangerous calls:
	- (success,None) = to.call{value: amount}() (contracts/MultiSigWallet.sol#370)
Sarcophagus._transferInheritance(address,uint256,uint256,uint256,uint256,uint256) (contracts/Sarcophagus.sol#1004-1037) sends eth to arbitrary user
	Dangerous calls:
	- address(beneficiary).transfer(vetInheritance) (contracts/Sarcophagus.sol#1013)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#functions-that-send-ether-to-arbitrary-destinations

Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#204-275) has bitwise-xor operator ^ instead of the exponentiation operator **: 
	 - inverse = (3 * denominator) ^ 2 (node_modules/@openzeppelin/contracts/utils/math/Math.sol#257)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#incorrect-exponentiation

B3TRRewards.hasClaimedInheritance (contracts/B3TRRewards.sol#62) is never initialized. It is used in:
	- B3TRRewards.mintCarbonOffsetReward(address,uint256,uint256) (contracts/B3TRRewards.sol#179-200)
	- B3TRRewards.mintLegacyBonus(address,uint256,uint256) (contracts/B3TRRewards.sol#208-229)
B3TRRewards.totalRewardsDistributed (contracts/B3TRRewards.sol#73) is never initialized. It is used in:
	- B3TRRewards.autoAdjustRates() (contracts/B3TRRewards.sol#388-405)
	- B3TRRewards.getFundingStatus() (contracts/B3TRRewards.sol#414-426)
	- B3TRRewards.hasSufficientFunding(uint256) (contracts/B3TRRewards.sol#433-436)
	- B3TRRewards.getTokenomics() (contracts/B3TRRewards.sol#457-473)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#uninitialized-state-variables

Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#204-275) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#242)
	- inverse = (3 * denominator) ^ 2 (node_modules/@openzeppelin/contracts/utils/math/Math.sol#257)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#204-275) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#242)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#261)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#204-275) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#242)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#262)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#204-275) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#242)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#263)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#204-275) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#242)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#264)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#204-275) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#242)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#265)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#204-275) performs a multiplication on the result of a division:
	- denominator = denominator / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#242)
	- inverse *= 2 - denominator * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#266)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#204-275) performs a multiplication on the result of a division:
	- low = low / twos (node_modules/@openzeppelin/contracts/utils/math/Math.sol#245)
	- result = low * inverse (node_modules/@openzeppelin/contracts/utils/math/Math.sol#272)
Math.invMod(uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#315-361) performs a multiplication on the result of a division:
	- quotient = gcd / remainder (node_modules/@openzeppelin/contracts/utils/math/Math.sol#337)
	- (gcd,remainder) = (remainder,gcd - remainder * quotient) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#339-346)
B3TRRewards.calculateCarbonOffset(uint256,uint256,bool) (contracts/B3TRRewards.sol#116-139) performs a multiplication on the result of a division:
	- carbonOffset = (yearsEarly * carbonOffsetRate * inheritanceValue) / 10000 (contracts/B3TRRewards.sol#130)
	- carbonOffset = (carbonOffset * GRANDFATHERING_MULTIPLIER) / 100 (contracts/B3TRRewards.sol#135)
OBOL.calculateTimeDecay(uint256,uint256) (contracts/OBOL.sol#191-215) performs a multiplication on the result of a division:
	- yearsSinceDecay = (timeElapsed - RATE_DECAY_START) / 31536000 (contracts/OBOL.sol#200)
	- decayMultiplier = 100 - (yearsSinceDecay * RATE_DECAY_RATE) (contracts/OBOL.sol#205)
OBOL.calculateWeightedRate(address) (contracts/OBOL.sol#223-261) performs a multiplication on the result of a division:
	- yearsStaked = totalStakingTime / 31536000 (contracts/OBOL.sol#232)
	- weight += yearsStaked * WEIGHT_TIME_MULTIPLIER (contracts/OBOL.sol#233)
OBOL.calculateWeightedRate(address) (contracts/OBOL.sol#223-261) performs a multiplication on the result of a division:
	- stakeInThousands = stake.lockedValue / 1000e18 (contracts/OBOL.sol#237)
	- weight += stakeInThousands * WEIGHT_AMOUNT_MULTIPLIER (contracts/OBOL.sol#239)
OBOL._calculatePendingRewards(address) (contracts/OBOL.sol#268-296) performs a multiplication on the result of a division:
	- daysElapsed = timeElapsed / 86400 (contracts/OBOL.sol#280)
	- pendingRewards = (stake.lockedValue * weightedRate * daysElapsed) / 1e18 (contracts/OBOL.sol#281)
OBOL.getPendingRewards(address) (contracts/OBOL.sol#303-330) performs a multiplication on the result of a division:
	- daysElapsed = timeElapsed / 86400 (contracts/OBOL.sol#315)
	- pendingRewards = (stake.lockedValue * weightedRate * daysElapsed) / 1e18 (contracts/OBOL.sol#316)
Sarcophagus.claimInheritance(address,uint256) (contracts/Sarcophagus.sol#1099-1173) performs a multiplication on the result of a division:
	- inheritanceAmount = (totalValue * beneficiary.percentage) / BASIS_POINTS (contracts/Sarcophagus.sol#1136)
	- feeAmount = (inheritanceAmount * INHERITANCE_FEE_RATE) / BASIS_POINTS (contracts/Sarcophagus.sol#1146)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#divide-before-multiply

Reentrancy in Sarcophagus._transferNFTsToBeneficiary(address,address) (contracts/Sarcophagus.sol#1785-1814):
	External calls:
	- IERC721(nftContract).safeTransferFrom(address(this),beneficiary,tokenId) (contracts/Sarcophagus.sol#1801)
	State variables written after the call(s):
	- sarc.isNFTLocked[nftContract][tokenId] = false (contracts/Sarcophagus.sol#1797)
	Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172) can be used in cross function reentrancies:
	- Sarcophagus.createSarcophagus(address[],uint256[],address[],uint256[],address[],uint256[]) (contracts/Sarcophagus.sol#423-477)
	- Sarcophagus.designateCharity(address) (contracts/Sarcophagus.sol#1244-1252)
	- Sarcophagus.getBeneficiaries(address) (contracts/Sarcophagus.sol#1669-1671)
	- Sarcophagus.getLockedNFTs(address,address) (contracts/Sarcophagus.sol#1679-1681)
	- Sarcophagus.getNFTBeneficiary(address,address,uint256) (contracts/Sarcophagus.sol#1710-1712)
	- Sarcophagus.getTotalNFTValue(address) (contracts/Sarcophagus.sol#1699-1701)
	- Sarcophagus.getValidBeneficiaries(address) (contracts/Sarcophagus.sol#1408-1426)
	- Sarcophagus.getWithdrawalEligibility(address) (contracts/Sarcophagus.sol#1637-1662)
	- Sarcophagus.isNFTLocked(address,address,uint256) (contracts/Sarcophagus.sol#1690-1692)
	- Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172)
	- Sarcophagus.setContingentBeneficiary(uint256,address) (contracts/Sarcophagus.sol#484-502)
	- Sarcophagus.setSurvivorshipPeriod(uint256,uint256) (contracts/Sarcophagus.sol#1323-1342)
	- Sarcophagus.updateNFTBeneficiary(address,uint256,address) (contracts/Sarcophagus.sol#663-690)
	- Sarcophagus.verifyDeath(address,uint256,uint256) (contracts/Sarcophagus.sol#946-963)
	- sarc.nftBeneficiaries[nftContract][tokenId] = address(0) (contracts/Sarcophagus.sol#1798)
	Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172) can be used in cross function reentrancies:
	- Sarcophagus.createSarcophagus(address[],uint256[],address[],uint256[],address[],uint256[]) (contracts/Sarcophagus.sol#423-477)
	- Sarcophagus.designateCharity(address) (contracts/Sarcophagus.sol#1244-1252)
	- Sarcophagus.getBeneficiaries(address) (contracts/Sarcophagus.sol#1669-1671)
	- Sarcophagus.getLockedNFTs(address,address) (contracts/Sarcophagus.sol#1679-1681)
	- Sarcophagus.getNFTBeneficiary(address,address,uint256) (contracts/Sarcophagus.sol#1710-1712)
	- Sarcophagus.getTotalNFTValue(address) (contracts/Sarcophagus.sol#1699-1701)
	- Sarcophagus.getValidBeneficiaries(address) (contracts/Sarcophagus.sol#1408-1426)
	- Sarcophagus.getWithdrawalEligibility(address) (contracts/Sarcophagus.sol#1637-1662)
	- Sarcophagus.isNFTLocked(address,address,uint256) (contracts/Sarcophagus.sol#1690-1692)
	- Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172)
	- Sarcophagus.setContingentBeneficiary(uint256,address) (contracts/Sarcophagus.sol#484-502)
	- Sarcophagus.setSurvivorshipPeriod(uint256,uint256) (contracts/Sarcophagus.sol#1323-1342)
	- Sarcophagus.updateNFTBeneficiary(address,uint256,address) (contracts/Sarcophagus.sol#663-690)
	- Sarcophagus.verifyDeath(address,uint256,uint256) (contracts/Sarcophagus.sol#946-963)
Reentrancy in Sarcophagus.lockNFT(address,uint256,uint256,address) (contracts/Sarcophagus.sol#559-619):
	External calls:
	- IERC721(nftContract).safeTransferFrom(msg.sender,address(this),tokenId) (contracts/Sarcophagus.sol#595)
	State variables written after the call(s):
	- sarc.lockedNFTs[nftContract].push(tokenId) (contracts/Sarcophagus.sol#598)
	Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172) can be used in cross function reentrancies:
	- Sarcophagus.createSarcophagus(address[],uint256[],address[],uint256[],address[],uint256[]) (contracts/Sarcophagus.sol#423-477)
	- Sarcophagus.designateCharity(address) (contracts/Sarcophagus.sol#1244-1252)
	- Sarcophagus.getBeneficiaries(address) (contracts/Sarcophagus.sol#1669-1671)
	- Sarcophagus.getLockedNFTs(address,address) (contracts/Sarcophagus.sol#1679-1681)
	- Sarcophagus.getNFTBeneficiary(address,address,uint256) (contracts/Sarcophagus.sol#1710-1712)
	- Sarcophagus.getTotalNFTValue(address) (contracts/Sarcophagus.sol#1699-1701)
	- Sarcophagus.getValidBeneficiaries(address) (contracts/Sarcophagus.sol#1408-1426)
	- Sarcophagus.getWithdrawalEligibility(address) (contracts/Sarcophagus.sol#1637-1662)
	- Sarcophagus.isNFTLocked(address,address,uint256) (contracts/Sarcophagus.sol#1690-1692)
	- Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172)
	- Sarcophagus.setContingentBeneficiary(uint256,address) (contracts/Sarcophagus.sol#484-502)
	- Sarcophagus.setSurvivorshipPeriod(uint256,uint256) (contracts/Sarcophagus.sol#1323-1342)
	- Sarcophagus.updateNFTBeneficiary(address,uint256,address) (contracts/Sarcophagus.sol#663-690)
	- Sarcophagus.verifyDeath(address,uint256,uint256) (contracts/Sarcophagus.sol#946-963)
	- sarc.isNFTLocked[nftContract][tokenId] = true (contracts/Sarcophagus.sol#599)
	Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172) can be used in cross function reentrancies:
	- Sarcophagus.createSarcophagus(address[],uint256[],address[],uint256[],address[],uint256[]) (contracts/Sarcophagus.sol#423-477)
	- Sarcophagus.designateCharity(address) (contracts/Sarcophagus.sol#1244-1252)
	- Sarcophagus.getBeneficiaries(address) (contracts/Sarcophagus.sol#1669-1671)
	- Sarcophagus.getLockedNFTs(address,address) (contracts/Sarcophagus.sol#1679-1681)
	- Sarcophagus.getNFTBeneficiary(address,address,uint256) (contracts/Sarcophagus.sol#1710-1712)
	- Sarcophagus.getTotalNFTValue(address) (contracts/Sarcophagus.sol#1699-1701)
	- Sarcophagus.getValidBeneficiaries(address) (contracts/Sarcophagus.sol#1408-1426)
	- Sarcophagus.getWithdrawalEligibility(address) (contracts/Sarcophagus.sol#1637-1662)
	- Sarcophagus.isNFTLocked(address,address,uint256) (contracts/Sarcophagus.sol#1690-1692)
	- Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172)
	- Sarcophagus.setContingentBeneficiary(uint256,address) (contracts/Sarcophagus.sol#484-502)
	- Sarcophagus.setSurvivorshipPeriod(uint256,uint256) (contracts/Sarcophagus.sol#1323-1342)
	- Sarcophagus.updateNFTBeneficiary(address,uint256,address) (contracts/Sarcophagus.sol#663-690)
	- Sarcophagus.verifyDeath(address,uint256,uint256) (contracts/Sarcophagus.sol#946-963)
	- sarc.nftBeneficiaries[nftContract][tokenId] = beneficiary (contracts/Sarcophagus.sol#600)
	Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172) can be used in cross function reentrancies:
	- Sarcophagus.createSarcophagus(address[],uint256[],address[],uint256[],address[],uint256[]) (contracts/Sarcophagus.sol#423-477)
	- Sarcophagus.designateCharity(address) (contracts/Sarcophagus.sol#1244-1252)
	- Sarcophagus.getBeneficiaries(address) (contracts/Sarcophagus.sol#1669-1671)
	- Sarcophagus.getLockedNFTs(address,address) (contracts/Sarcophagus.sol#1679-1681)
	- Sarcophagus.getNFTBeneficiary(address,address,uint256) (contracts/Sarcophagus.sol#1710-1712)
	- Sarcophagus.getTotalNFTValue(address) (contracts/Sarcophagus.sol#1699-1701)
	- Sarcophagus.getValidBeneficiaries(address) (contracts/Sarcophagus.sol#1408-1426)
	- Sarcophagus.getWithdrawalEligibility(address) (contracts/Sarcophagus.sol#1637-1662)
	- Sarcophagus.isNFTLocked(address,address,uint256) (contracts/Sarcophagus.sol#1690-1692)
	- Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172)
	- Sarcophagus.setContingentBeneficiary(uint256,address) (contracts/Sarcophagus.sol#484-502)
	- Sarcophagus.setSurvivorshipPeriod(uint256,uint256) (contracts/Sarcophagus.sol#1323-1342)
	- Sarcophagus.updateNFTBeneficiary(address,uint256,address) (contracts/Sarcophagus.sol#663-690)
	- Sarcophagus.verifyDeath(address,uint256,uint256) (contracts/Sarcophagus.sol#946-963)
	- sarc.totalNFTValue += nftValue (contracts/Sarcophagus.sol#601)
	Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172) can be used in cross function reentrancies:
	- Sarcophagus.createSarcophagus(address[],uint256[],address[],uint256[],address[],uint256[]) (contracts/Sarcophagus.sol#423-477)
	- Sarcophagus.designateCharity(address) (contracts/Sarcophagus.sol#1244-1252)
	- Sarcophagus.getBeneficiaries(address) (contracts/Sarcophagus.sol#1669-1671)
	- Sarcophagus.getLockedNFTs(address,address) (contracts/Sarcophagus.sol#1679-1681)
	- Sarcophagus.getNFTBeneficiary(address,address,uint256) (contracts/Sarcophagus.sol#1710-1712)
	- Sarcophagus.getTotalNFTValue(address) (contracts/Sarcophagus.sol#1699-1701)
	- Sarcophagus.getValidBeneficiaries(address) (contracts/Sarcophagus.sol#1408-1426)
	- Sarcophagus.getWithdrawalEligibility(address) (contracts/Sarcophagus.sol#1637-1662)
	- Sarcophagus.isNFTLocked(address,address,uint256) (contracts/Sarcophagus.sol#1690-1692)
	- Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172)
	- Sarcophagus.setContingentBeneficiary(uint256,address) (contracts/Sarcophagus.sol#484-502)
	- Sarcophagus.setSurvivorshipPeriod(uint256,uint256) (contracts/Sarcophagus.sol#1323-1342)
	- Sarcophagus.updateNFTBeneficiary(address,uint256,address) (contracts/Sarcophagus.sol#663-690)
	- Sarcophagus.verifyDeath(address,uint256,uint256) (contracts/Sarcophagus.sol#946-963)
	- sarc.nftContracts.push(nftContract) (contracts/Sarcophagus.sol#612)
	Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172) can be used in cross function reentrancies:
	- Sarcophagus.createSarcophagus(address[],uint256[],address[],uint256[],address[],uint256[]) (contracts/Sarcophagus.sol#423-477)
	- Sarcophagus.designateCharity(address) (contracts/Sarcophagus.sol#1244-1252)
	- Sarcophagus.getBeneficiaries(address) (contracts/Sarcophagus.sol#1669-1671)
	- Sarcophagus.getLockedNFTs(address,address) (contracts/Sarcophagus.sol#1679-1681)
	- Sarcophagus.getNFTBeneficiary(address,address,uint256) (contracts/Sarcophagus.sol#1710-1712)
	- Sarcophagus.getTotalNFTValue(address) (contracts/Sarcophagus.sol#1699-1701)
	- Sarcophagus.getValidBeneficiaries(address) (contracts/Sarcophagus.sol#1408-1426)
	- Sarcophagus.getWithdrawalEligibility(address) (contracts/Sarcophagus.sol#1637-1662)
	- Sarcophagus.isNFTLocked(address,address,uint256) (contracts/Sarcophagus.sol#1690-1692)
	- Sarcophagus.sarcophagi (contracts/Sarcophagus.sol#172)
	- Sarcophagus.setContingentBeneficiary(uint256,address) (contracts/Sarcophagus.sol#484-502)
	- Sarcophagus.setSurvivorshipPeriod(uint256,uint256) (contracts/Sarcophagus.sol#1323-1342)
	- Sarcophagus.updateNFTBeneficiary(address,uint256,address) (contracts/Sarcophagus.sol#663-690)
	- Sarcophagus.verifyDeath(address,uint256,uint256) (contracts/Sarcophagus.sol#946-963)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities-1

Sarcophagus.createSarcophagus(address[],uint256[],address[],uint256[],address[],uint256[]) (contracts/Sarcophagus.sol#423-477) ignores return value by (isVerified,None,None) = deathVerifier.getUserVerification(msg.sender) (contracts/Sarcophagus.sol#435)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#unused-return

MockNFT.constructor(string,string).name (contracts/mocks/MockNFT.sol#10) shadows:
	- ERC721.name() (node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#74-76) (function)
	- IERC721Metadata.name() (node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol#16) (function)
MockNFT.constructor(string,string).symbol (contracts/mocks/MockNFT.sol#10) shadows:
	- ERC721.symbol() (node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#81-83) (function)
	- IERC721Metadata.symbol() (node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol#21) (function)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#local-variable-shadowing

Sarcophagus._transferNFTsToBeneficiary(address,address) (contracts/Sarcophagus.sol#1785-1814) has external calls inside a loop: IERC721(nftContract).safeTransferFrom(address(this),beneficiary,tokenId) (contracts/Sarcophagus.sol#1801)
	Calls stack containing the loop:
		Sarcophagus.claimInheritance(address,uint256)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation/#calls-inside-a-loop

Reentrancy in Sarcophagus.claimContingentInheritance(address,uint256) (contracts/Sarcophagus.sol#1180-1238):
	External calls:
	- _updateObolRewards(user) (contracts/Sarcophagus.sol#1227)
		- obol.updateUserStake(user,totalLockedValue) (contracts/Sarcophagus.sol#1763)
	External calls sending eth:
	- _transferInheritance(beneficiary.contingentBeneficiary,vetInheritance,vthoInheritance,b3trInheritance,obolInheritance,gloInheritance) (contracts/Sarcophagus.sol#1226)
		- address(beneficiary).transfer(vetInheritance) (contracts/Sarcophagus.sol#1013)
	State variables written after the call(s):
	- _setupGrandfathering(beneficiary.contingentBeneficiary,user,totalValue) (contracts/Sarcophagus.sol#1228)
		- inheritanceRecipients[beneficiary] = InheritanceRecipient({originalVaultOwner:user,inheritanceAmount:totalValue,claimTimestamp:block.timestamp,grandfatheringDeadline:block.timestamp + GRANDFATHERING_DEADLINE,hasCreatedNewVault:false,originalObolRate:obol.getDailyRewardRate(user)}) (contracts/Sarcophagus.sol#1084-1091)
Reentrancy in Sarcophagus.claimInheritance(address,uint256) (contracts/Sarcophagus.sol#1099-1173):
	External calls:
	- _transferNFTsToBeneficiary(user,beneficiary.recipient) (contracts/Sarcophagus.sol#1162)
		- IERC721(nftContract).safeTransferFrom(address(this),beneficiary,tokenId) (contracts/Sarcophagus.sol#1801)
	- _updateObolRewards(user) (contracts/Sarcophagus.sol#1163)
		- obol.updateUserStake(user,totalLockedValue) (contracts/Sarcophagus.sol#1763)
	External calls sending eth:
	- _transferInheritance(beneficiary.recipient,vetInheritance,vthoInheritance,b3trInheritance,obolInheritance,gloInheritance) (contracts/Sarcophagus.sol#1161)
		- address(beneficiary).transfer(vetInheritance) (contracts/Sarcophagus.sol#1013)
	State variables written after the call(s):
	- _setupGrandfathering(beneficiary.recipient,user,totalValue) (contracts/Sarcophagus.sol#1164)
		- inheritanceRecipients[beneficiary] = InheritanceRecipient({originalVaultOwner:user,inheritanceAmount:totalValue,claimTimestamp:block.timestamp,grandfatheringDeadline:block.timestamp + GRANDFATHERING_DEADLINE,hasCreatedNewVault:false,originalObolRate:obol.getDailyRewardRate(user)}) (contracts/Sarcophagus.sol#1084-1091)
Reentrancy in Sarcophagus.withdrawPartial(uint256) (contracts/Sarcophagus.sol#1485-1522):
	External calls:
	- _updateVaultBalances(sarc,vetWithdrawal,vthoWithdrawal,b3trWithdrawal,obolWithdrawal,msg.sender) (contracts/Sarcophagus.sol#1509)
		- obol.updateUserStake(user,totalLockedValue) (contracts/Sarcophagus.sol#1763)
	External calls sending eth:
	- _transferInheritance(msg.sender,vetWithdrawal,vthoWithdrawal,b3trWithdrawal,obolWithdrawal,0) (contracts/Sarcophagus.sol#1512)
		- address(beneficiary).transfer(vetInheritance) (contracts/Sarcophagus.sol#1013)
	State variables written after the call(s):
	- totalInheritanceFeesCollected += penaltyAmount (contracts/Sarcophagus.sol#1516)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities-2

B3TRRewards.mintCarbonOffsetReward(address,uint256,uint256) (contracts/B3TRRewards.sol#179-200) uses timestamp for comparisons
	Dangerous comparisons:
	- hasGrandfathering = gf.applied && block.timestamp <= gf.deadline (contracts/B3TRRewards.sol#189)
B3TRRewards.mintLegacyBonus(address,uint256,uint256) (contracts/B3TRRewards.sol#208-229) uses timestamp for comparisons
	Dangerous comparisons:
	- hasGrandfathering = gf.applied && block.timestamp <= gf.deadline (contracts/B3TRRewards.sol#218)
DeathVerifier.slashOracle(address,uint256,string) (contracts/DeathVerifier.sol#169-184) uses timestamp for comparisons
	Dangerous comparisons:
	- reputation.reputationScore < 20 (contracts/DeathVerifier.sol#179)
DeathVerifier.requestDeathVerification(address,uint256,uint256,uint256,string) (contracts/DeathVerifier.sol#194-256) uses timestamp for comparisons
	Dangerous comparisons:
	- deathTimestamp > block.timestamp (contracts/DeathVerifier.sol#206)
	- deathTimestamp < block.timestamp - VERIFICATION_EXPIRY (contracts/DeathVerifier.sol#207)
	- verification.confirmations >= MIN_CONFIRMATIONS && totalAuthorizedOracles >= MIN_ORACLES (contracts/DeathVerifier.sol#234)
DeathVerifier.verifyDeath(address,uint256,uint256,uint256,string) (contracts/DeathVerifier.sol#446-486) uses timestamp for comparisons
	Dangerous comparisons:
	- deathTimestamp > block.timestamp (contracts/DeathVerifier.sol#457)
	- deathTimestamp < block.timestamp - VERIFICATION_EXPIRY (contracts/DeathVerifier.sol#458)
MultiSigWallet.revokeConfirmation(uint256) (contracts/MultiSigWallet.sol#166-179) uses timestamp for comparisons
	Dangerous comparisons:
	- require(bool,string)(transaction.isConfirmed[msg.sender],MultiSig: transaction not confirmed) (contracts/MultiSigWallet.sol#173)
MultiSigWallet.executeTransaction(uint256) (contracts/MultiSigWallet.sol#185-202) uses timestamp for comparisons
	Dangerous comparisons:
	- require(bool,string)(transaction.confirmations >= requiredWeight,MultiSig: insufficient confirmations) (contracts/MultiSigWallet.sol#194)
OBOL.claimContinuousRewards(address) (contracts/OBOL.sol#149-183) uses timestamp for comparisons
	Dangerous comparisons:
	- pendingRewards <= 0 (contracts/OBOL.sol#157)
	- dailyRewardsMinted[currentDay] + pendingRewards > DAILY_REWARD_CAP (contracts/OBOL.sol#161)
	- totalMintedRewards + pendingRewards > REWARD_SUPPLY (contracts/OBOL.sol#166)
	- pendingRewards > 0 (contracts/OBOL.sol#178)
OBOL.calculateTimeDecay(uint256,uint256) (contracts/OBOL.sol#191-215) uses timestamp for comparisons
	Dangerous comparisons:
	- timeElapsed < RATE_DECAY_START (contracts/OBOL.sol#194)
	- decayMultiplier < MIN_RATE_MULTIPLIER (contracts/OBOL.sol#208)
OBOL.calculateWeightedRate(address) (contracts/OBOL.sol#223-261) uses timestamp for comparisons
	Dangerous comparisons:
	- weight > MAX_WEIGHT_MULTIPLIER (contracts/OBOL.sol#243)
OBOL._calculatePendingRewards(address) (contracts/OBOL.sol#268-296) uses timestamp for comparisons
	Dangerous comparisons:
	- timeElapsed <= 0 (contracts/OBOL.sol#273)
	- totalUnclaimed > MAX_UNCLAIMED_REWARDS (contracts/OBOL.sol#287)
OBOL.getPendingRewards(address) (contracts/OBOL.sol#303-330) uses timestamp for comparisons
	Dangerous comparisons:
	- timeElapsed <= 0 (contracts/OBOL.sol#308)
	- totalUnclaimed > MAX_UNCLAIMED_REWARDS (contracts/OBOL.sol#322)
OBOL.lockInVault(address,uint256) (contracts/OBOL.sol#375-382) uses timestamp for comparisons
	Dangerous comparisons:
	- balanceOf(msg.sender) < amount (contracts/OBOL.sol#376)
OBOL.claimVesting(address) (contracts/OBOL.sol#388-406) uses timestamp for comparisons
	Dangerous comparisons:
	- block.timestamp < vestingStartTime + VESTING_CLIFF (contracts/OBOL.sol#393)
	- vestedAmount <= 0 (contracts/OBOL.sol#398)
OBOL.getVestedAmount() (contracts/OBOL.sol#411-422) uses timestamp for comparisons
	Dangerous comparisons:
	- block.timestamp < vestingStartTime + VESTING_CLIFF (contracts/OBOL.sol#412)
	- block.timestamp >= vestingEndTime (contracts/OBOL.sol#416)
OBOL.getUserStake(address) (contracts/OBOL.sol#428-450) uses timestamp for comparisons
	Dangerous comparisons:
	- longTerm = totalStakingTime >= BONUS_THRESHOLD (contracts/OBOL.sol#439)
OBOL.getDailyRewardRate(address) (contracts/OBOL.sol#457-463) uses timestamp for comparisons
	Dangerous comparisons:
	- longTerm = totalStakingTime >= BONUS_THRESHOLD (contracts/OBOL.sol#460)
OBOL.getVestingProgress() (contracts/OBOL.sol#475-481) uses timestamp for comparisons
	Dangerous comparisons:
	- block.timestamp < vestingStartTime (contracts/OBOL.sol#476)
	- block.timestamp >= vestingEndTime (contracts/OBOL.sol#477)
OBOL.calculateReward(uint256) (contracts/OBOL.sol#570-577) uses timestamp for comparisons
	Dangerous comparisons:
	- totalMintedRewards + bonusAmount > REWARD_SUPPLY (contracts/OBOL.sol#573)
Sarcophagus.createSarcophagus(address[],uint256[],address[],uint256[],address[],uint256[]) (contracts/Sarcophagus.sol#423-477) uses timestamp for comparisons
	Dangerous comparisons:
	- sarcophagi[msg.sender].createdAt != 0 (contracts/Sarcophagus.sol#432)
Sarcophagus.verifyDeath(address,uint256,uint256) (contracts/Sarcophagus.sol#946-963) uses timestamp for comparisons
	Dangerous comparisons:
	- deathTimestamp == 0 || deathTimestamp > block.timestamp (contracts/Sarcophagus.sol#955)
Sarcophagus.claimContingentInheritance(address,uint256) (contracts/Sarcophagus.sol#1180-1238) uses timestamp for comparisons
	Dangerous comparisons:
	- block.timestamp < requiredSurvivalTime (contracts/Sarcophagus.sol#1203)
Sarcophagus._checkSurvivorshipRequirements(Sarcophagus.SarcophagusData,Sarcophagus.Beneficiary) (contracts/Sarcophagus.sol#1350-1360) uses timestamp for comparisons
	Dangerous comparisons:
	- block.timestamp >= requiredSurvivalTime (contracts/Sarcophagus.sol#1359)
Sarcophagus.withdrawPartial(uint256) (contracts/Sarcophagus.sol#1485-1522) uses timestamp for comparisons
	Dangerous comparisons:
	- block.timestamp < sarc.createdAt + PARTIAL_WITHDRAWAL_PERIOD (contracts/Sarcophagus.sol#1494)
Sarcophagus.withdrawAll() (contracts/Sarcophagus.sol#1527-1565) uses timestamp for comparisons
	Dangerous comparisons:
	- block.timestamp < sarc.createdAt + PARTIAL_WITHDRAWAL_PERIOD (contracts/Sarcophagus.sol#1534)
Sarcophagus.emergencyWithdraw(string) (contracts/Sarcophagus.sol#1571-1625) uses timestamp for comparisons
	Dangerous comparisons:
	- block.timestamp < sarc.createdAt + WITHDRAWAL_LOCK_PERIOD (contracts/Sarcophagus.sol#1580)
Sarcophagus.getWithdrawalEligibility(address) (contracts/Sarcophagus.sol#1637-1662) uses timestamp for comparisons
	Dangerous comparisons:
	- canWithdrawPartial = currentTime >= partialDeadline (contracts/Sarcophagus.sol#1655)
	- canWithdrawAll = currentTime >= partialDeadline (contracts/Sarcophagus.sol#1656)
	- canEmergencyWithdraw = currentTime >= emergencyDeadline (contracts/Sarcophagus.sol#1657)
	- currentTime >= partialDeadline (contracts/Sarcophagus.sol#1659)
	- currentTime >= partialDeadline (contracts/Sarcophagus.sol#1660)
	- currentTime >= emergencyDeadline (contracts/Sarcophagus.sol#1661)
MockPriceOracle.getPrice(address) (contracts/mocks/MockPriceOracle.sol#80-84) uses timestamp for comparisons
	Dangerous comparisons:
	- valid = (block.timestamp - timestamp) <= MAX_PRICE_AGE (contracts/mocks/MockPriceOracle.sol#83)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#block-timestamp

SafeERC20._callOptionalReturn(IERC20,bytes) (node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#173-191) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#176-186)
SafeERC20._callOptionalReturnBool(IERC20,bytes) (node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#201-211) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#205-209)
ERC721Utils.checkOnERC721Received(address,address,address,uint256,bytes) (node_modules/@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol#25-49) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol#43-45)
Panic.panic(uint256) (node_modules/@openzeppelin/contracts/utils/Panic.sol#50-56) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/Panic.sol#51-55)
Strings.toString(uint256) (node_modules/@openzeppelin/contracts/utils/Strings.sol#45-63) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/Strings.sol#50-52)
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/Strings.sol#55-57)
Strings.toChecksumHexString(address) (node_modules/@openzeppelin/contracts/utils/Strings.sol#111-129) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/Strings.sol#116-118)
Strings.escapeJSON(string) (node_modules/@openzeppelin/contracts/utils/Strings.sol#446-476) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/Strings.sol#470-473)
Strings._unsafeReadBytesOffset(bytes,uint256) (node_modules/@openzeppelin/contracts/utils/Strings.sol#484-489) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/Strings.sol#486-488)
Math.add512(uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#25-30) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#26-29)
Math.mul512(uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#37-46) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#41-45)
Math.tryMul(uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#73-84) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#76-80)
Math.tryDiv(uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#89-97) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#92-95)
Math.tryMod(uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#102-110) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#105-108)
Math.mulDiv(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#204-275) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#227-234)
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#240-249)
Math.tryModExp(uint256,uint256,uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#409-433) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#411-432)
Math.tryModExp(bytes,bytes,bytes) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#449-471) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#461-470)
Math.log2(uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#612-651) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/Math.sol#648-650)
SafeCast.toUint(bool) (node_modules/@openzeppelin/contracts/utils/math/SafeCast.sol#1157-1161) uses assembly
	- INLINE ASM (node_modules/@openzeppelin/contracts/utils/math/SafeCast.sol#1158-1160)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#assembly-usage

3 different versions of Solidity are used:
	- Version constraint ^0.8.20 is used by:
		-^0.8.20 (node_modules/@openzeppelin/contracts/access/AccessControl.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/access/IAccessControl.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/access/Ownable.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/interfaces/IERC1363.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/interfaces/IERC165.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/interfaces/IERC20.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/interfaces/draft-IERC6093.sol#3)
		-^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/utils/Context.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/utils/Panic.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/utils/Pausable.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/utils/ReentrancyGuard.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/utils/Strings.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/utils/math/Math.sol#4)
		-^0.8.20 (node_modules/@openzeppelin/contracts/utils/math/SafeCast.sol#5)
		-^0.8.20 (node_modules/@openzeppelin/contracts/utils/math/SignedMath.sol#4)
	- Version constraint ^0.8.24 is used by:
		-^0.8.24 (contracts/B3TRRewards.sol#2)
		-^0.8.24 (contracts/DeathVerifier.sol#2)
		-^0.8.24 (contracts/MultiSigWallet.sol#2)
		-^0.8.24 (contracts/OBOL.sol#2)
		-^0.8.24 (contracts/Sarcophagus.sol#2)
		-^0.8.24 (contracts/interfaces/IDeathVerifier.sol#2)
		-^0.8.24 (contracts/interfaces/IOBOL.sol#2)
		-^0.8.24 (contracts/interfaces/IVIP180.sol#2)
		-^0.8.24 (contracts/interfaces/IVNSResolver.sol#2)
		-^0.8.24 (contracts/interfaces/IVTHOManager.sol#2)
		-^0.8.24 (contracts/mocks/MockB3TR.sol#2)
		-^0.8.24 (contracts/mocks/MockGLO.sol#2)
		-^0.8.24 (contracts/mocks/MockNFT.sol#2)
		-^0.8.24 (contracts/mocks/MockToken.sol#2)
		-^0.8.24 (contracts/mocks/MockVIP180.sol#2)
		-^0.8.24 (contracts/mocks/MockVNSResolver.sol#2)
		-^0.8.24 (contracts/mocks/MockVTHO.sol#2)
		-^0.8.24 (contracts/mocks/MockVTHOManager.sol#2)
	- Version constraint ^0.8.19 is used by:
		-^0.8.19 (contracts/interfaces/IPriceOracle.sol#2)
		-^0.8.19 (contracts/mocks/MockDeathVerifier.sol#2)
		-^0.8.19 (contracts/mocks/MockPriceOracle.sol#2)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#different-pragma-directives-are-used

MultiSigWallet.constructor(address[],uint256[],uint256) (contracts/MultiSigWallet.sol#78-111) has costly operations inside a loop:
	- totalWeight += weights[i] (contracts/MultiSigWallet.sol#100)
MultiSigWallet.removeSigner(address) (contracts/MultiSigWallet.sol#233-254) has costly operations inside a loop:
	- signerAddresses.pop() (contracts/MultiSigWallet.sol#246)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#costly-operations-inside-a-loop

Sarcophagus.lockNFT(address,uint256,uint256,address) (contracts/Sarcophagus.sol#559-619) has a high cyclomatic complexity (17).
Sarcophagus.handleEstateFallback(address) (contracts/Sarcophagus.sol#1258-1316) has a high cyclomatic complexity (12).
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#cyclomatic-complexity

Sarcophagus._distributeNFTs(address,address,uint256) (contracts/Sarcophagus.sol#1045-1071) is never used and should be removed
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#dead-code

Version constraint ^0.8.20 contains known severe issues (https://solidity.readthedocs.io/en/latest/bugs.html)
	- VerbatimInvalidDeduplication
	- FullInlinerNonExpressionSplitArgumentEvaluationOrder
	- MissingSideEffectsOnSelectorAccess.
It is used by:
	- ^0.8.20 (node_modules/@openzeppelin/contracts/access/AccessControl.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/access/IAccessControl.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/access/Ownable.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/interfaces/IERC1363.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/interfaces/IERC165.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/interfaces/IERC20.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/interfaces/draft-IERC6093.sol#3)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/utils/Context.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/utils/Panic.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/utils/Pausable.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/utils/ReentrancyGuard.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/utils/Strings.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/utils/math/Math.sol#4)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/utils/math/SafeCast.sol#5)
	- ^0.8.20 (node_modules/@openzeppelin/contracts/utils/math/SignedMath.sol#4)
Version constraint ^0.8.19 contains known severe issues (https://solidity.readthedocs.io/en/latest/bugs.html)
	- VerbatimInvalidDeduplication
	- FullInlinerNonExpressionSplitArgumentEvaluationOrder
	- MissingSideEffectsOnSelectorAccess.
It is used by:
	- ^0.8.19 (contracts/interfaces/IPriceOracle.sol#2)
	- ^0.8.19 (contracts/mocks/MockDeathVerifier.sol#2)
	- ^0.8.19 (contracts/mocks/MockPriceOracle.sol#2)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#incorrect-versions-of-solidity

Low level call in MultiSigWallet.executeTransaction(uint256) (contracts/MultiSigWallet.sol#185-202):
	- (success,_returnData) = transaction.target.call{value: transaction.value}(transaction.data) (contracts/MultiSigWallet.sol#198)
Low level call in MultiSigWallet.emergencyWithdraw(address,address,uint256) (contracts/MultiSigWallet.sol#364-377):
	- (success,None) = to.call{value: amount}() (contracts/MultiSigWallet.sol#370)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#low-level-calls

Sarcophagus (contracts/Sarcophagus.sol#19-1828) should inherit from IERC721Receiver (node_modules/@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol#11-28)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#missing-inheritance

Reentrancy in Sarcophagus._transferInheritance(address,uint256,uint256,uint256,uint256,uint256) (contracts/Sarcophagus.sol#1004-1037):
	External calls:
	- address(beneficiary).transfer(vetInheritance) (contracts/Sarcophagus.sol#1013)
	Event emitted after the call(s):
	- ObolWithdrawalFeeCollected(beneficiary,obolFee,obolInheritance) (contracts/Sarcophagus.sol#1032)
Reentrancy in Sarcophagus.claimContingentInheritance(address,uint256) (contracts/Sarcophagus.sol#1180-1238):
	External calls:
	- _transferInheritance(beneficiary.contingentBeneficiary,vetInheritance,vthoInheritance,b3trInheritance,obolInheritance,gloInheritance) (contracts/Sarcophagus.sol#1226)
		- address(beneficiary).transfer(vetInheritance) (contracts/Sarcophagus.sol#1013)
	State variables written after the call(s):
	- _setupGrandfathering(beneficiary.contingentBeneficiary,user,totalValue) (contracts/Sarcophagus.sol#1228)
		- inheritanceRecipients[beneficiary] = InheritanceRecipient({originalVaultOwner:user,inheritanceAmount:totalValue,claimTimestamp:block.timestamp,grandfatheringDeadline:block.timestamp + GRANDFATHERING_DEADLINE,hasCreatedNewVault:false,originalObolRate:obol.getDailyRewardRate(user)}) (contracts/Sarcophagus.sol#1084-1091)
	Event emitted after the call(s):
	- ContingentInheritanceClaimed(user,beneficiary.recipient,beneficiary.contingentBeneficiary,totalValue) (contracts/Sarcophagus.sol#1232-1237)
	- InheritanceFeeCollected(beneficiary.contingentBeneficiary,feeAmount,totalValue) (contracts/Sarcophagus.sol#1231)
Reentrancy in Sarcophagus.claimInheritance(address,uint256) (contracts/Sarcophagus.sol#1099-1173):
	External calls:
	- _transferInheritance(beneficiary.recipient,vetInheritance,vthoInheritance,b3trInheritance,obolInheritance,gloInheritance) (contracts/Sarcophagus.sol#1161)
		- address(beneficiary).transfer(vetInheritance) (contracts/Sarcophagus.sol#1013)
	State variables written after the call(s):
	- _setupGrandfathering(beneficiary.recipient,user,totalValue) (contracts/Sarcophagus.sol#1164)
		- inheritanceRecipients[beneficiary] = InheritanceRecipient({originalVaultOwner:user,inheritanceAmount:totalValue,claimTimestamp:block.timestamp,grandfatheringDeadline:block.timestamp + GRANDFATHERING_DEADLINE,hasCreatedNewVault:false,originalObolRate:obol.getDailyRewardRate(user)}) (contracts/Sarcophagus.sol#1084-1091)
	- _transferNFTsToBeneficiary(user,beneficiary.recipient) (contracts/Sarcophagus.sol#1162)
		- sarc.isNFTLocked[nftContract][tokenId] = false (contracts/Sarcophagus.sol#1797)
		- sarc.nftBeneficiaries[nftContract][tokenId] = address(0) (contracts/Sarcophagus.sol#1798)
	Event emitted after the call(s):
	- InheritanceClaimed(user,beneficiary.recipient,totalValue) (contracts/Sarcophagus.sol#1170)
	- InheritanceClaimedForMinor(user,beneficiary.recipient,beneficiary.guardian,totalValue) (contracts/Sarcophagus.sol#1168)
	- InheritanceFeeCollected(beneficiary.recipient,feeAmount,totalValue) (contracts/Sarcophagus.sol#1172)
	- NFTsTransferredToBeneficiary(user,beneficiary) (contracts/Sarcophagus.sol#1813)
		- _transferNFTsToBeneficiary(user,beneficiary.recipient) (contracts/Sarcophagus.sol#1162)
Reentrancy in Sarcophagus.emergencyWithdraw(string) (contracts/Sarcophagus.sol#1571-1625):
	External calls:
	- address(msg.sender).transfer(vetWithdrawal) (contracts/Sarcophagus.sol#1603)
	State variables written after the call(s):
	- totalInheritanceFeesCollected += penaltyAmount (contracts/Sarcophagus.sol#1617)
	Event emitted after the call(s):
	- EmergencyWithdrawal(msg.sender,totalWithdrawal,penaltyAmount,netWithdrawal,emergencyReason) (contracts/Sarcophagus.sol#1624)
	- WithdrawalPenaltyCollected(msg.sender,penaltyAmount,totalWithdrawal) (contracts/Sarcophagus.sol#1618)
Reentrancy in Sarcophagus.handleEstateFallback(address) (contracts/Sarcophagus.sol#1258-1316):
	External calls:
	- address(charity).transfer(vetAmount) (contracts/Sarcophagus.sol#1300)
	Event emitted after the call(s):
	- CharityDonation(user,charity,totalValue) (contracts/Sarcophagus.sol#1315)
Reentrancy in Sarcophagus.withdrawAll() (contracts/Sarcophagus.sol#1527-1565):
	External calls:
	- _transferInheritance(msg.sender,vetWithdrawal,vthoWithdrawal,b3trWithdrawal,obolWithdrawal,0) (contracts/Sarcophagus.sol#1552)
		- address(beneficiary).transfer(vetInheritance) (contracts/Sarcophagus.sol#1013)
	State variables written after the call(s):
	- totalInheritanceFeesCollected += penaltyAmount (contracts/Sarcophagus.sol#1556)
	Event emitted after the call(s):
	- FullWithdrawal(msg.sender,totalWithdrawal,penaltyAmount,netWithdrawal) (contracts/Sarcophagus.sol#1564)
	- WithdrawalPenaltyCollected(msg.sender,penaltyAmount,totalWithdrawal) (contracts/Sarcophagus.sol#1557)
Reentrancy in Sarcophagus.withdrawPartial(uint256) (contracts/Sarcophagus.sol#1485-1522):
	External calls:
	- _transferInheritance(msg.sender,vetWithdrawal,vthoWithdrawal,b3trWithdrawal,obolWithdrawal,0) (contracts/Sarcophagus.sol#1512)
		- address(beneficiary).transfer(vetInheritance) (contracts/Sarcophagus.sol#1013)
	State variables written after the call(s):
	- totalInheritanceFeesCollected += penaltyAmount (contracts/Sarcophagus.sol#1516)
	Event emitted after the call(s):
	- PartialWithdrawal(msg.sender,totalWithdrawal,penaltyAmount,netWithdrawal) (contracts/Sarcophagus.sol#1521)
	- WithdrawalPenaltyCollected(msg.sender,penaltyAmount,totalWithdrawal) (contracts/Sarcophagus.sol#1517)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities-4

Math.log2(uint256) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#612-651) uses literals with too many digits:
	- r = r | byte(uint256,uint256)(x >> r,0x0000010102020202030303030303030300000000000000000000000000000000) (node_modules/@openzeppelin/contracts/utils/math/Math.sol#649)
MockGLO.constructor() (contracts/mocks/MockGLO.sol#7-9) uses literals with too many digits:
	- _mint(msg.sender,1000000 * 10 ** decimals()) (contracts/mocks/MockGLO.sol#8)
MockPriceOracle.slitherConstructorConstantVariables() (contracts/mocks/MockPriceOracle.sol#6-105) uses literals with too many digits:
	- VTHO = address(0x0000000000000000456E65726779) (contracts/mocks/MockPriceOracle.sol#13)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#too-many-digits

MockNFT._tokenIdCounter (contracts/mocks/MockNFT.sol#8) is never used in MockNFT (contracts/mocks/MockNFT.sol#7-21)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#unused-state-variable

B3TRRewards.totalRewardsDistributed (contracts/B3TRRewards.sol#73) should be constant 
MockNFT._tokenIdCounter (contracts/mocks/MockNFT.sol#8) should be constant 
Sarcophagus.totalObolFeesCollected (contracts/Sarcophagus.sol#110) should be constant 
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#state-variables-that-could-be-declared-constant

Sarcophagus.circuitBreakerActive (contracts/Sarcophagus.sol#105) should be immutable 
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#state-variables-that-could-be-declared-immutable
. analyzed (48 contracts with 100 detectors), 102 result(s) found
INFO:Slither:security-reports/slither-detailed.json exists already, the overwrite is prevented


### 2. Compilation Status
**Status:** success
✅ All contracts compile successfully

### 3. Security Test Suite
**Status:** failed
**Test Failures:**  ·------------------------|--------------------------------|--------------------------------·
 |  Solc version: 0.8.24  ·  Optimizer enabled: true       ·  Runs: 200                     │
 ·························|································|·································
 |  Contract Name         ·  Deployed size (KiB) (change)  ·  Initcode size (KiB) (change)  │
 ·························|································|·································
 |  B3TRRewards           ·                 6.258 (0.000)  ·                 7.275 (0.000)  │
 ·························|································|·································
 |  DeathVerifier         ·                 7.855 (0.000)  ·                 8.681 (0.000)  │
 ·························|································|·································
 |  MockDeathVerifier     ·                 0.406 (0.000)  ·                 0.434 (0.000)  │
 ·························|································|·································
 |  MultiSigWallet        ·                 8.105 (0.000)  ·                10.063 (0.000)  │
 ·························|································|·································
 |  OBOL                  ·                 8.919 (0.000)  ·                10.522 (0.000)  │
 ·························|································|·································
 |  Sarcophagus           ·                22.036 (0.000)  ·                23.084 (0.000)  │
 ·------------------------|--------------------------------|--------------------------------·


  🔒 Security Audit - Hybrid OBOL System
    🚨 Access Control Vulnerabilities
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
mockB3TR address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
mockGLO address: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
OBOL address: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
DeathVerifier address: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
Sarcophagus address: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
      ✔ Should prevent unauthorized role grants
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1
mockB3TR address: 0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE
mockGLO address: 0x68B1D87F95878fE05B998F19b66F4baba5De1aed
OBOL address: 0x3Aa5ebB10DC797CAC828524e59A333d0A371443c
DeathVerifier address: 0xc6e7DF5E7b4f2A278906862b61205850344D4e7d
Sarcophagus address: 0x59b670e9fA9D0A427751Af201D676719a970857b
      ✔ Should prevent unauthorized reward minting
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB
mockB3TR address: 0x9E545E3C0baAB3E08CdfD552C960A1050f373042
mockGLO address: 0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9
OBOL address: 0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8
DeathVerifier address: 0x851356ae760d987E095750cCeb3bC6014560891C
Sarcophagus address: 0xf5059a5D33d5853360D16C683c16e67980206f36
      ✔ Should prevent unauthorized stake updates
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x809d550fca64d94Bd9F66E60752A544199cfAC3D
mockB3TR address: 0x4c5859f0F772848b2D91F1D83E2Fe57935348029
mockGLO address: 0x1291Be112d480055DaFd8a610b7d1e203891C274
OBOL address: 0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154
DeathVerifier address: 0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575
Sarcophagus address: 0xCD8a1C3ba11CF5ECfa6267617243239504a98d90
      1) Should prevent unauthorized death verification
    💰 Economic Attacks
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f
mockB3TR address: 0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d
mockGLO address: 0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6
OBOL address: 0x04C89607413713Ec9775E14b954286519d836FEf
DeathVerifier address: 0x4C4a2f8c81640e47606d3fd77B353E87Ba015584
Sarcophagus address: 0x21dF544947ba3E8b3c32561399E88B52Dc8b2823
      ✔ Should prevent rapid deposit attacks (39ms)
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25
mockB3TR address: 0xD84379CEae14AA33C123Af12424A37803F885889
mockGLO address: 0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5
OBOL address: 0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d
DeathVerifier address: 0x46b142DD1E924FAb83eCc3c08e4D46E82f005e0E
Sarcophagus address: 0xC9a43158891282A2B1475592D5719c001986Aaec
      2) Should prevent time manipulation attacks
    🔄 Reentrancy Attacks
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x720472c8ce72c2A2D711333e064ABD3E6BbEAdd3
mockB3TR address: 0xe8D2A1E88c91DCd5433208d4152Cc4F399a7e91d
mockGLO address: 0x5067457698Fd6Fa1C6964e416b3f42713513B3dD
OBOL address: 0x18E317A7D70d8fBf8e6E893616b52390EbBdb629
DeathVerifier address: 0x4b6aB5F819A515382B0dEB6935D793817bB4af28
Sarcophagus address: 0xCace1b78160AE76398F486c8a18044da0d66d86D
      3) Should prevent reentrancy in reward claiming
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x3347B4d90ebe72BeFb30444C9966B2B990aE9FcB
mockB3TR address: 0x3155755b79aA083bd953911C92705B7aA82a18F9
mockGLO address: 0x5bf5b11053e734690269C6B9D438F8C9d48F528A
OBOL address: 0xffa7CA1AEEEbBc30C874d32C7e22F052BbEa0429
DeathVerifier address: 0x3aAde2dCD2Df6a8cAc689EE797591b2913658659
Sarcophagus address: 0xab16A69A5a8c12C732e0DEFF4BE56A70bb64c926
      ✔ Should prevent reentrancy in token locking
    📊 Precision and Overflow Attacks
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xd6e1afe5cA8D00A2EFC01B89997abE2De47fdfAf
mockB3TR address: 0x99dBE4AEa58E518C50a1c04aE9b48C9F6354612f
mockGLO address: 0x6F6f570F45833E249e27022648a26F4076F48f78
OBOL address: 0xCA8c8688914e0F7096c920146cd0Ad85cD7Ae8b9
DeathVerifier address: 0xB0f05d25e41FbC2b52013099ED9616f1206Ae21B
Sarcophagus address: 0x5FeaeBfB4439F3516c74939A9D04e95AFE82C4ae
      4) Should handle decimal precision correctly
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xa6e99A4ED7498b3cdDCBB61a6A607a4925Faa1B7
mockB3TR address: 0x5302E909d1e93e30F05B5D6Eea766363D14F9892
mockGLO address: 0x0ed64d01D0B4B655E410EF1441dD677B695639E7
OBOL address: 0x4bf010f1b9beDA5450a8dD702ED602A104ff65EE
DeathVerifier address: 0x40a42Baf86Fc821f972Ad2aC878729063CeEF403
Sarcophagus address: 0x96F3Ce39Ad2BfDCf92C0F6E2C2CAbF83874660Fc
      5) Should prevent integer overflow in reward calculations
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x74Cf9087AD26D541930BaC724B7ab21bA8F00a27
mockB3TR address: 0xefAB0Beb0A557E452b398035eA964948c750b2Fd
mockGLO address: 0xaca81583840B1bf2dDF6CDe824ada250C1936B4D
OBOL address: 0x70bDA08DBe07363968e9EE53d899dFE48560605B
DeathVerifier address: 0x26B862f640357268Bd2d9E95bc81553a2Aa81D7E
Sarcophagus address: 0xA56F946D6398Dd7d9D4D9B337Cf9E0F68982ca5B
      6) Should handle extreme reward calculations without overflow
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x5133BBdfCCa3Eb4F739D599ee4eC45cBCD0E16c5
mockB3TR address: 0x71089Ba41e478702e1904692385Be3972B2cBf9e
mockGLO address: 0x8F4ec854Dd12F1fe79500a1f53D0cbB30f9b6134
OBOL address: 0xC66AB83418C20A65C3f8e83B3d11c8C3a6097b6F
DeathVerifier address: 0xeF31027350Be2c7439C1b0BE022d49421488b72C
Sarcophagus address: 0x12Bcb546bC60fF39F1Adfc7cE4605d5Bd6a6A876
      7) Should handle decimal precision in small amounts
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xe039608E695D21aB11675EBBA00261A0e750526c
mockB3TR address: 0x071586BA1b380B00B793Cc336fe01106B0BFbE6D
mockGLO address: 0xe70f935c32dA4dB13e7876795f1e175465e6458e
OBOL address: 0x3C15538ED063e688c8DF3d571Cb7a0062d2fB18D
DeathVerifier address: 0xccf1769D8713099172642EB55DDFFC0c5A444FE9
Sarcophagus address: 0x3904b8f5b0F49cD206b7d5AABeE5D1F37eE15D8d
      8) Should prevent integer overflow in beneficiary calculations
    🎯 Logic Vulnerabilities
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x51C65cd0Cdb1A8A8b79dfc2eE965B1bA0bb8fc89
mockB3TR address: 0x8fC8CFB7f7362E44E472c690A6e025B80E406458
mockGLO address: 0xC7143d5bA86553C06f5730c8dC9f8187a621A8D4
OBOL address: 0x359570B3a0437805D0a71457D61AD26a28cAC9A2
DeathVerifier address: 0xc9952Fc93Fa9bE383ccB39008c786b9f94eAc95d
Sarcophagus address: 0xDde063eBe8E85D666AD99f731B4Dbf8C98F29708
      9) Should prevent double inheritance claims
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x8D81A3DCd17030cD5F23Ac7370e4Efb10D2b3cA4
mockB3TR address: 0xcC4c41415fc68B2fBf70102742A83cDe435e0Ca7
mockGLO address: 0xa722bdA6968F50778B973Ae2701e90200C564B49
OBOL address: 0xc7cDb7A2E5dDa1B7A0E792Fe1ef08ED20A6F56D4
DeathVerifier address: 0x967AB65ef14c58bD4DcfFeaAA1ADb40a022140E5
Sarcophagus address: 0xe1708FA6bb2844D5384613ef0846F9Bc1e8eC55E
      ✔ Should prevent claiming before death verification (38ms)
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x193521C8934bCF3473453AF4321911E7A89E0E12
mockB3TR address: 0x9Fcca440F19c62CDF7f973eB6DDF218B15d4C71D
mockGLO address: 0x01E21d7B8c39dc4C764c19b308Bd8b14B1ba139E
OBOL address: 0x3C1Cb427D20F15563aDa8C249E71db76d7183B6c
DeathVerifier address: 0x1343248Cbd4e291C6979e70a138f4c774e902561
Sarcophagus address: 0x22a9B82A6c3D2BFB68F324B2e8367f346Dd6f32a
      10) Should prevent non-beneficiary claims
    🔐 Pause Functionality
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x9fD16eA9E31233279975D99D5e8Fc91dd214c7Da
mockB3TR address: 0xCBBe2A5c3A22BE749D5DDF24e9534f98951983e2
mockGLO address: 0x987e855776C03A4682639eEb14e65b3089EE6310
OBOL address: 0xb932C8342106776E73E39D695F3FFC3A9624eCE0
DeathVerifier address: 0xE8F7d98bE6722d42F29b50500B0E318EF2be4fc8
Sarcophagus address: 0xe38b6847E611e942E6c80eD89aE867F522402e80
      11) Should allow admin to pause contracts
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xf5c4a909455C00B99A90d93b48736F3196DB5621
mockB3TR address: 0xFD2Cf3b56a73c75A7535fFe44EBABe7723c64719
mockGLO address: 0xB22C255250d74B0ADD1bfB936676D2a299BF48Bd
OBOL address: 0x666D0c3da3dBc946D5128D06115bb4eed4595580
DeathVerifier address: 0x742489F22807ebB4C36ca6cD95c3e1C044B7B6c8
Sarcophagus address: 0x1D8D70AD07C8E7E442AD78E4AC0A16f958Eba7F0
      12) Should prevent operations when paused
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xA21DDc1f17dF41589BC6A5209292AED2dF61Cc94
mockB3TR address: 0x2A590C461Db46bca129E8dBe5C3998A8fF402e76
mockGLO address: 0x158d291D8b47F056751cfF47d1eEcd19FDF9B6f8
OBOL address: 0x2F54D1563963fC04770E85AF819c89Dc807f6a06
DeathVerifier address: 0xF342E904702b1D021F03f519D6D9614916b03f37
Sarcophagus address: 0x9849832a1d8274aaeDb1112ad9686413461e7101
      13) Should prevent non-admin from pausing
    📈 Reward Supply Management
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x262e2b50219620226C5fB5956432A88fffd94Ba7
mockB3TR address: 0x10e38eE9dd4C549b61400Fc19347D00eD3edAfC4
mockGLO address: 0xd753c12650c280383Ce873Cc3a898F6f53973d16
OBOL address: 0xd710a67624Ad831683C86a48291c597adE30F787
DeathVerifier address: 0xd30bF3219A0416602bE8D482E0396eF332b0494E
Sarcophagus address: 0x06b3244b086cecC40F1e5A826f736Ded68068a0F
      ✔ Should not exceed total reward supply
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x4DAf17c8142A483B2E2348f56ae0F2cFDAe22ceE
mockB3TR address: 0x1D13fF25b10C9a6741DFdce229073bed652197c7
mockGLO address: 0x24d41dbc3d60d0784f8a937c59FBDe51440D5140
OBOL address: 0xC976c932092ECcD8f328FfD85066C0c05ED54044
DeathVerifier address: 0x618fB9dbd2BD6eb968B4c1af36af6CB0b45310Ec
Sarcophagus address: 0xa779C1D17bC5230c07afdC51376CAC1cb3Dd5314
      ✔ Should handle reward supply exhaustion gracefully
    🕐 Time-based Vulnerabilities
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x707531c9999AaeF9232C8FEfBA31FBa4cB78d84a
mockB3TR address: 0x2538a10b7fFb1B78c890c870FC152b10be121f04
mockGLO address: 0x24432a08869578aAf4d1eadA12e1e78f171b1a2b
OBOL address: 0xdB05A386810c809aD5a77422eb189D36c7f24402
DeathVerifier address: 0xbf2ad38fd09F37f50f723E35dd84EEa1C282c5C9
Sarcophagus address: 0xF66CfDf074D2FFD6A4037be3A669Ed04380Aef2B
      14) Should handle timestamp manipulation
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x2BB8B93F585B43b06F3d523bf30C203d3B6d4BD4
mockB3TR address: 0xB7ca895F81F20e05A5eb11B05Cbaab3DAe5e23cd
mockGLO address: 0xd0EC100F1252a53322051a95CF05c32f0C174354
OBOL address: 0x2d13826359803522cCe7a4Cfa2c1b582303DD0B4
DeathVerifier address: 0xCa57C1d3c2c35E667745448Fef8407dd25487ff8
Sarcophagus address: 0xc3023a2c9f7B92d1dd19F488AF6Ee107a78Df9DB
      ✔ Should handle negative time differences
    🎭 Front-running Protection
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x01cf58e264d7578D4C67022c58A24CbC4C4a304E
mockB3TR address: 0xd038A2EE73b64F30d65802Ad188F27921656f28F
mockGLO address: 0x666432Ccb747B2220875cE185f487Ed53677faC9
OBOL address: 0xeC1BB74f5799811c0c1Bff94Ef76Fb40abccbE4a
DeathVerifier address: 0xF6a8aD553b265405526030c2102fda2bDcdDC177
Sarcophagus address: 0x09120eAED8e4cD86D85a616680151DAA653880F2
      15) Should prevent front-running in reward claiming
    🔍 Input Validation
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xe14058B1c3def306e2cb37535647A04De03Db092
mockB3TR address: 0x74ef2B06A1D2035C33244A4a263FF00B84504865
mockGLO address: 0xF5b81Fe0B6F378f9E6A3fb6A6cD1921FCeA11799
OBOL address: 0x67baFF31318638F497f4c4894Cd73918563942c8
DeathVerifier address: 0x6533158b042775e2FdFeF3cA1a782EFDbB8EB9b1
Sarcophagus address: 0x73C68f1f41e4890D06Ba3e71b9E9DfA555f1fb46
      ✔ Should validate user addresses
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x532802f2F9E0e3EE9d5Ba70C35E1F43C0498772D
mockB3TR address: 0xdB012DD3E3345e2f8D23c0F3cbCb2D94f430Be8C
mockGLO address: 0xd977422c9eE9B646f64A4C4389a6C98ad356d8C4
OBOL address: 0x1eB5C49630E08e95Ba7f139BcF4B9BA171C9a8C7
DeathVerifier address: 0x6e0a5725dD4071e46356bD974E13F35DbF9ef367
Sarcophagus address: 0xA9d0Fb5837f9c42c874e16da96094b14Af0e2784
      ✔ Should validate deposit amounts
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x5A569Ad19272Afa97103fD4DbadF33B2FcbaA175
mockB3TR address: 0x696358bBb1a743052E0E87BeD78AAd9d18f0e1F4
mockGLO address: 0x7036124464A2d2447516309169322c8498ac51e3
OBOL address: 0xeE1eb820BeeCED56657bA74fa8D70748D7A6756C
DeathVerifier address: 0x5c932424AcBfab036969b3B9D94bA9eCbae7565D
Sarcophagus address: 0x3949c97925e5Aa13e34ddb18EAbf0B70ABB0C7d4
      ✔ Should validate age in verification
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x0c03eCB91Cb50835e560a7D52190EB1a5ffba797
mockB3TR address: 0x1c39BA375faB6a9f6E0c01B9F49d488e101C2011
mockGLO address: 0xb04CB6c52E73CF3e2753776030CE85a36549c9C2
OBOL address: 0xc0c5618f0F3Fa66b496F2940f373DC366d765BAe
DeathVerifier address: 0xa195ACcEB1945163160CD5703Ed43E4f78176a54
Sarcophagus address: 0x6212cb549De37c25071cF506aB7E115D140D9e42
      16) Should prevent DoS attacks with many beneficiaries
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x687bB6c57915aa2529EfC7D2a26668855e022fAE
mockB3TR address: 0x49149a233de6E4cD6835971506F47EE5862289c1
mockGLO address: 0xAe2563b4315469bF6bdD41A6ea26157dE57Ed94e
OBOL address: 0x30426D33a78afdb8788597D5BFaBdADc3Be95698
DeathVerifier address: 0x85495222Fd7069B987Ca38C2142732EbBFb7175D
Sarcophagus address: 0x3abBB0D6ad848d64c8956edC9Bf6f18aC22E1485
      ✔ Should prevent excessive deposit amounts
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xfB12F7170FF298CDed84C793dAb9aBBEcc01E798
mockB3TR address: 0xc1EeD9232A0A44c2463ACB83698c162966FBc78d
mockGLO address: 0xC220Ed128102d888af857d137a54b9B7573A41b2
OBOL address: 0xfaE849108F2A63Abe3BaB17E21Be077d07e7a9A2
DeathVerifier address: 0x12456Fa31e57F91B70629c1196337074c966492a
Sarcophagus address: 0xce830DA8667097BB491A70da268b76a081211814
      ✔ Should handle edge case age verification
    🔒 Advanced Reentrancy Protection
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x04f1A5b9BD82a5020C49975ceAd160E98d8B77Af
mockB3TR address: 0xde79380FBd39e08150adAA5C6c9dE3146f53029e
mockGLO address: 0xbFD3c8A956AFB7a9754C951D03C9aDdA7EC5d638
OBOL address: 0x38F6F2caE52217101D7CA2a5eC040014b4164E6C
DeathVerifier address: 0xc075BC0f734EFE6ceD866324fc2A9DBe1065CBB1
Sarcophagus address: 0x837a41023CF81234f89F956C94D676918b4791c1
      17) Should prevent reentrancy in inheritance claiming
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xd3b893cd083f07Fe371c1a87393576e7B01C52C6
mockB3TR address: 0x3BFbbf82657577668144921b96aAb72BC170646C
mockGLO address: 0x930b218f3e63eE452c13561057a8d5E61367d5b7
OBOL address: 0x721d8077771Ebf9B931733986d619aceea412a1C
DeathVerifier address: 0x38c76A767d45Fc390160449948aF80569E2C4217
Sarcophagus address: 0xDC57724Ea354ec925BaFfCA0cCf8A1248a8E5CF1
      18) Should prevent reentrancy in user verification
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x89ec9355b1Bcc964e576211c8B011BD709083f8d
mockB3TR address: 0x72662E4da74278430123cE51405c1e7A1B87C294
mockGLO address: 0x52bad4A8584909895C22bdEcf8DBF33314468Fb0
OBOL address: 0xed12bE400A07910E4d4E743E4ceE26ab1FC9a961
DeathVerifier address: 0x1B25157F05B25438441bF7CDe38A95A55ccf8E50
Sarcophagus address: 0xc775bF567D67018dfFac4E89a7Cf10f0EDd0Be93
      19) Should prevent reentrancy in sarcophagus creation
    💰 Advanced Economic Attacks
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x9f62EE65a8395824Ee0821eF2Dc4C947a23F0f25
mockB3TR address: 0x20BBE62B175134D21b10C157498b663F048672bA
mockGLO address: 0x3AeEBbEe7CE00B11cB202d6D0F38D696A3f4Ff8e
OBOL address: 0xB2ff9d5e60d68A52cea3cd041b32f1390A880365
DeathVerifier address: 0xa68E430060f74F9821D2dC9A9E2CE3aF7d842EBe
Sarcophagus address: 0x8B64968F69E669faCc86FA3484FD946f1bBE7c91
      20) Should prevent flash loan attacks on reward calculations
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xa8fcCF4D0e2f2c4451123fF2F9ddFc9be465Fa1d
mockB3TR address: 0xc3b99d27eF3B07C94Ee3cFD670281F0CF98A02f1
mockGLO address: 0x20F5f006a0184883068bBF58fb0c526A8EEa8BFD
OBOL address: 0x975cDd867aCB99f0195be09C269E2440aa1b1FA8
DeathVerifier address: 0xd6096fbEd8bCc461d06b0C468C8b1cF7d45dC92d
Sarcophagus address: 0x0aD6371dd7E9923d9968D63Eb8B9858c700abD9d
      21) Should prevent reward manipulation through multiple deposits
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x8b9d5A75328b5F3167b04B42AD00092E7d6c485c
mockB3TR address: 0x9BcA065E19b6d630032b53A8757fB093CbEAfC1d
mockGLO address: 0xd8A9159c111D0597AD1b475b8d7e5A217a1d1d05
OBOL address: 0xCdb63c58b907e76872474A0597C5252eDC97c883
DeathVerifier address: 0x15BB2cc3Ea43ab2658F7AaecEb78A9d3769BE3cb
Sarcophagus address: 0xa4d0806d597146df93796A38435ABB2a3cb96677
      22) Should prevent reward farming through rapid deposit/withdraw cycles
    🎯 Advanced Logic Vulnerabilities
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xaE2abbDE6c9829141675fA0A629a675badbb0d9F
mockB3TR address: 0x8B342f4Ddcc71Af65e4D2dA9CD00cc0E945cFD12
mockGLO address: 0xE2307e3710d108ceC7a4722a020a050681c835b3
OBOL address: 0xD28F3246f047Efd4059B24FA1fa587eD9fa3e77F
DeathVerifier address: 0x15F2ea83eB97ede71d84Bd04fFF29444f6b7cd52
Sarcophagus address: 0x0B32a3F8f5b7E5d315b9E52E640a49A89d89c820
      23) Should prevent inheritance claims after beneficiary removal
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xEC7cb8C3EBE77BA6d284F13296bb1372A8522c5F
mockB3TR address: 0x3C2BafebbB0c8c58f39A976e725cD20D611d01e9
mockGLO address: 0x5f246ADDCF057E0f778CD422e20e413be70f9a0c
OBOL address: 0xaD82Ecf79e232B0391C5479C7f632aA1EA701Ed1
DeathVerifier address: 0x4Dd5336F3C0D70893A7a86c6aEBe9B953E87c891
Sarcophagus address: 0x91A1EeE63f300B8f41AE6AF67eDEa2e2ed8c3f79
      24) Should prevent multiple death verifications
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x29023DE63D7075B4cC2CE30B55f050f9c67548d4
mockB3TR address: 0xCA87833e830652C2ab07E1e03eBa4F2c246D3b58
mockGLO address: 0x9Bb65b12162a51413272d10399282E730822Df44
OBOL address: 0x7A5EC257391817ef241ef8451642cC6b222d4f8C
DeathVerifier address: 0x90E75f390332356426B60FB440DF23f860F6A113
Sarcophagus address: 0x59c7D03d2E9893FB7bAa89dA50a9452e1e9B8b90
      25) Should prevent inheritance claims with invalid beneficiary percentages
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xBD2fe040D03EB1d1E5A151fbcc19A03333223019
mockB3TR address: 0xfb6dAB6200b8958C2655C3747708F82243d3F32E
mockGLO address: 0x798f111c92E38F102931F34D1e0ea7e671BDBE31
OBOL address: 0xabebE9a2D62Af9a89E86EB208b51321e748640C3
DeathVerifier address: 0xf42Ec71A4440F5e9871C643696DD6Dc9a38911F8
Sarcophagus address: 0xbc71F5687CFD36f64Ae6B4549186EE3A6eE259a4
      26) Should prevent inheritance claims with zero beneficiaries
    🔐 Advanced Access Control
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x3A906C603F080D96dc08f81CF2889dAB6FF299dE
mockB3TR address: 0x820638ecd57B55e51CE6EaD7D137962E7A201dD9
mockGLO address: 0x725314746e727f586E9FCA65AeD5dBe45aA71B99
OBOL address: 0x987Aa6E80e995d6A76C4d061eE324fc760Ea9F61
DeathVerifier address: 0x6B9C4119796C80Ced5a3884027985Fd31830555b
Sarcophagus address: 0xA8d14b3d9e2589CEA8644BB0f67EB90d21079f8B
      ✔ Should prevent role escalation attacks
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xA496E0071780CF57cd699cb1D5Ac0CdCD6cCD673
mockB3TR address: 0x4E76FbE44fa5Dae076a7f4f676250e7941421fbA
mockGLO address: 0x00B0517de6b2b09aBD3a7B69d66D85eFdb2c7d94
OBOL address: 0x49AeF2C4005Bf572665b09014A563B5b9E46Df21
DeathVerifier address: 0xa9efDEf197130B945462163a0B852019BA529a66
Sarcophagus address: 0x06786bCbc114bbfa670E30A1AC35dFd1310Be82f
      ✔ Should prevent unauthorized role revocations
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xAAF0F531b7947e8492f21862471d61d5305f7538
mockB3TR address: 0x2aA12f98795E7A65072950AfbA9d1E023D398241
mockGLO address: 0x81f4f47aa3bBd154171C877b4d70F6C9EeCAb216
OBOL address: 0x2ce1F0e20C1f69E9d9AEA83b25F0cEB69e2AA2b5
DeathVerifier address: 0xE5b6F5e695BA6E4aeD92B68c4CC8Df1160D69A81
Sarcophagus address: 0x9bE634797af98cB560DB23260b5f7C6e98AcCAcf
      27) Should prevent unauthorized oracle operations
    📊 Advanced Precision and Overflow Protection
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x221416CFa5A3CD92035E537ded1dD12d4d587c03
mockB3TR address: 0x0BbfcD7a557FFB8A70CB0948FF680F0E573bbFf2
mockGLO address: 0xa591098680B1e183C332Ea8e2612a2Cf2e6ABC17
OBOL address: 0xdABF214E5a833269c192D9d70efDdE174680628D
DeathVerifier address: 0x645D817611E0CDaF9cD43332c4E369B9E333471d
Sarcophagus address: 0x81F82957608f74441E085851cA5Cc091b23d17A2
      28) Should handle extreme reward calculations without overflow
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x0BFC626B583e93A5F793Bc2cAa195BDBB2ED9F20
mockB3TR address: 0x7A3A9876c08B3f001D10c6a8aF685699BC52e7c8
mockGLO address: 0x76d05F58D14c0838EC630C8140eDC5aB7CD159Dc
OBOL address: 0xe8c3F27D20472e4f3C546A3f73C04B54DD72871d
DeathVerifier address: 0xd2983525E903Ef198d5dD0777712EB66680463bc
Sarcophagus address: 0x36B81ebd01C31643BAF132240C8Bc6874B329c4C
      ✔ Should handle decimal precision in small amounts
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xE634d83f8E016B04e51F2516e6086b5f238675C7
mockB3TR address: 0x86c64cB21f88fA9E2c46b61c35889E75f08FDce1
mockGLO address: 0xfaA7b3a4b5c3f54a934a2e33D34C7bC099f96CCE
OBOL address: 0xA901DA770A472Caf6E6698261BB02ea58C5d3235
DeathVerifier address: 0x1966dc8ff30Bc4AeDEd27178642253b3cCC9AA3f
Sarcophagus address: 0x5f58879Fe3a4330B6D85c1015971Ea6e5175AeDD
      29) Should prevent integer overflow in beneficiary calculations
    🕐 Advanced Time-based Protection
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x226A19c076a3047a53e5430B14bcDB42dbccA159
mockB3TR address: 0xA5c9020ea95324a05B48491FB3e61Ba111E5dd95
mockGLO address: 0x093D305366218D6d09bA10448922F10814b031dd
OBOL address: 0x061FB3749C4eD5e3c2d28a284940093cfDFcBa20
DeathVerifier address: 0x9581c795DBcaf408E477F6f1908a41BE43093122
Sarcophagus address: 0x3CA5269B5c54d4C807Ca0dF7EeB2CB7a5327E77d
      30) Should handle leap year calculations correctly
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x810090f35DFA6B18b5EB59d298e2A2443a2811E2
mockB3TR address: 0x2B8F5e69C35c1Aff4CCc71458CA26c2F313c3ed3
mockGLO address: 0x9A8Ec3B44ee760b629e204900c86d67414a67e8f
OBOL address: 0xA899118f4BCCb62F8c6A37887a4F450D8a4E92E0
DeathVerifier address: 0xb60971942E4528A811D24826768Bc91ad1383D21
Sarcophagus address: 0xD185B4846E5fd5419fD4D077dc636084BEfC51C0
      31) Should handle time zone edge cases
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x6712008CCD96751d586FdBa0DEf5495E0E22D904
mockB3TR address: 0x8659DF1C638CDA8E475CD3C6481730C2b4f85873
mockGLO address: 0x1f9c84B161b2c7FFB540BC5354543108cCE37df1
OBOL address: 0x4D1338Fa46ca6060F1472b70599cc635Ad275EDa
DeathVerifier address: 0x87E8f332f34984728Da4c0A008a495A5Ec4E09a2
Sarcophagus address: 0x53E4DAFF2073f848DC3F7a8D7CC95b3607212A73
      32) Should prevent time manipulation through block timestamp
    🎭 Advanced Front-running Protection
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xAd3E631c01798f9aAE4692dabF791a62c226C5D4
mockB3TR address: 0x0Ac85d55ebFc7f7b0cF4c13bb3BD6Eaf3909d62d
mockGLO address: 0x4B901e2Db7C412D966689E8D3CF479294C456f1e
OBOL address: 0x8C08821f5f94b519c853486eB131667AA528A460
DeathVerifier address: 0xdcaa80371BDF9ff638851713f145Df074428Db19
Sarcophagus address: 0xcf23CE2ffa1DDd9Cc2b445aE6778c4DBD605a1A0
      33) Should prevent MEV attacks on inheritance claims
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x88B9Ad010A699Cc0c8C5C5EA8bAF90A0C375df1a
mockB3TR address: 0xf975A646FCa589Be9fc4E0C28ea426A75645fB1f
mockGLO address: 0xAaC7D4A36DAb95955ef3c641c23F1fA46416CF71
OBOL address: 0x6B5CF024365D5d5d0786673780CA7E3F07f85B63
DeathVerifier address: 0x594f79e85F6f041eb56cF6822FF4125ee316409E
Sarcophagus address: 0xfDb6669cF60C1dBfB0f72Ea50A6eC5e0FD6089E1
      ✔ Should prevent sandwich attacks on deposits
    🔍 Input Validation
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x1F585372F116E1055AF2bED81a808DDf9638dCCD
mockB3TR address: 0xACB5b53F9F193b99bcd8EF8544ddF4c398DE24a3
mockGLO address: 0x39826E09f8efb9df4C56Aeb9eEC0D2B8164d3B36
OBOL address: 0x6C3F7ed79b9D75486D0250946f7a20BDA74844Ba
DeathVerifier address: 0x90A3B384F62f43Ba07938EA43aEEc35c2aBfeCa2
Sarcophagus address: 0x43c5DF0c482c88Cef8005389F64c362eE720A5bC
      34) Should validate life expectancy calculations
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x3Aa338c8d5E6cefE95831cD0322b558677abA0f1
mockB3TR address: 0x6858dF5365ffCbe31b5FE68D9E6ebB81321F7F86
mockGLO address: 0x267fB71b280FB34B278CedE84180a9A9037C941b
OBOL address: 0x7E27bCbe2F0eDdA3E0AA12492950a6B8703b00FB
DeathVerifier address: 0x9015957A2210BB8B10e27d8BBEEF8d9498f123eF
Sarcophagus address: 0x7C4BDA48bd4C9ac4FbcC60deEb66bf80d35705f0
      ✔ Should prevent duplicate sarcophagus creation
    🚨 Advanced DoS Protection
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xDf66AB853Fc112Ec955531bd76E9079db30A0e27
mockB3TR address: 0x8797847c9d63D8Ed9C30B058F408d4257A33B76C
mockGLO address: 0xF816b7FfDa4a8aB6B68540D1993fCa98E462b3bc
OBOL address: 0xa9Ea7F91E63896d852c4FCA6124c974adC68Af3B
DeathVerifier address: 0xDB259fa7d7f9F68aE3ffC3c748516ba9567a7576
Sarcophagus address: 0x71d75C9A9e1a4fFa5a16556b51D6e630A4FA902A
      ✔ Should prevent storage exhaustion through repeated operations
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x5A61c51C6745b3F509f4a1BF54BFD04e04aF430a
mockB3TR address: 0x67832b9Fc47eb3CdBF7275b95a29740EC58193D2
mockGLO address: 0x832092FDF1D32A3A1b196270590fB0E25DF129FF
OBOL address: 0xe3e4631D734e4b3F900AfcC396440641Ed0df339
DeathVerifier address: 0x8729c0238b265BaCF6fE397E8309897BB5c40473
Sarcophagus address: 0xDf795df2e0ad240a82d773DA01a812B96345F9C5
      35) Should prevent event spam attacks
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x039d7496e432c6Aea4c24648a59318b3cbe09942
mockB3TR address: 0xbF97DEfeb6a387215E3e67DFb988c675c9bb1a29
mockGLO address: 0xaE7b7A1c6C4d859e19301ccAc2C6eD28A4C51288
OBOL address: 0xe9CD84fe4ddfB0f016e3264791923902906753Bd
DeathVerifier address: 0x7722f5d7964a04672761cdfdC7c17B7Ac8f197b7
Sarcophagus address: 0xeA2e668d430e5AA15babA2f5c5edfd4F9Ef6EB73
      ✔ Should prevent external call DoS through malicious contracts
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x74Ce26A2e4c1368C48A0157CE762944d282896Db
mockB3TR address: 0x7c77704007C9996Ee591C516f7319828BA49d91E
mockGLO address: 0x676F5F71DAE1C83Dc31775E4c61212bC9e799d9C
OBOL address: 0x081F08945fd17C5470f7bCee23FB57aB1099428E
DeathVerifier address: 0xf102f0173707c6726543d65fA38025Eb72026c37
Sarcophagus address: 0x5EdB3Ff1EA450d1FF6d614F24f5C760761F7f688
      36) Should prevent cross-function reentrancy DoS
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x7306a649B451AE08781108445425Bd4E8AcF1E00
mockB3TR address: 0xf4c5C29b14f0237131F7510A51684c8191f98E06
mockGLO address: 0x934A389CaBFB84cdB3f0260B2a4FD575b8B345A3
OBOL address: 0xc91B651f770ed996a223a16dA9CCD6f7Df56C987
DeathVerifier address: 0xB90AcF57C3BFE8e0E8215defc282B5F48b3edC74
Sarcophagus address: 0x787c6666213624D788522d516847978D7F348902
      37) Should prevent block gas limit attacks
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x757Fd23a0fDF9F9d2786f62f96f02Db4D096d10A
mockB3TR address: 0x7930AC7ddD1e35fD4b25230121A9C45923894e67
mockGLO address: 0x4a680B00eEacbcCA480eB9aB57161A7B08A8F0Ba
OBOL address: 0xEFdc56feF9E089b086DD0a335F2c8c8CcB7E3031
DeathVerifier address: 0x37e2156B0d78098F06F8075a18d7E3a09483048e
Sarcophagus address: 0xb26012b855Fc76A974261455B12190e41fC4C228
      38) Should prevent memory exhaustion through large data structures
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xB719422a0A484025c1A22a8dEEaFC67E81F43CfD
mockB3TR address: 0xA199e7ab96BF9DF52C52eb7BAb5572789a726d33
mockGLO address: 0xF978b011bcf604b201996FEb3E53eD3D52F0A90F
OBOL address: 0x8233369E29653b70E50E93d1276a50B8f2122a01
DeathVerifier address: 0x6B99600daD0a1998337357696827381D122825F3
Sarcophagus address: 0xBA6BfBa894B5cAF04c3462A5C8556fFBa4de6782
      39) Should prevent deep call stack attacks
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x1c2fb12ECCA5EDB9ac8dA583cAa865E7C893a7ef
mockB3TR address: 0x42E5a852Aa5cd4284227796Bc5d2461189A65b8a
mockGLO address: 0x1D3b68fBD686e06Fbda1cb6cAF0C8DA558FCC3A0
OBOL address: 0x8406DE314Ce609Ff8228193b2535f13527917803
DeathVerifier address: 0x7711d80d7B485d4ce1651284Dd9b8e19142F3748
Sarcophagus address: 0x874B971cBE686566FCc9437A12E5418301Cd60AA
      ✔ Should prevent batch operation DoS
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x7E6C94173C264aaE66Bf36ce047b0Aef585C2181
mockB3TR address: 0xFe44FF05D7C06E792D6eF4762B2441e82Bc602a5
mockGLO address: 0x07bf260a44CEADfad215cc8e20c5b0398D25b1FA
OBOL address: 0xDb2f554A333D189ed59eA36020a83F7d6De14328
DeathVerifier address: 0x94A44de106112A761B69dFBEB1ac6cfdD1B80304
Sarcophagus address: 0x47330D2fe6F75899597C14d615003Ef561B01B14
      ✔ Should prevent mapping iteration DoS
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x5e208FF7bf707D7f57bf305AB545CB398a55FfAF
mockB3TR address: 0x37D85d30aC1C7Bfa6a09e8096171e2977edb52cc
mockGLO address: 0x121f7e412A536D673DaB310F1448ce0e3843068a
OBOL address: 0x6d055A4babb2A0d1B3Abb32937DB437210be6161
DeathVerifier address: 0x6B76fDA6ceF1bc95F80A83cD7bc4D82AC3e021d1
Sarcophagus address: 0x76a5A3a1eC8AA32d7Fc7BD7D4Cd9c779a59Ef881
      ✔ Should prevent state corruption DoS
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x31C89d6188b169aDCC7f6002d9cBAB605B67fd6d
mockB3TR address: 0x656eef60fFA6c3b984E199d29443b885c51A6200
mockGLO address: 0x94a4d8C45FBaC4cCDD0afAebD0C006d97cfA8b6c
OBOL address: 0xd6A0A8E18934Bb04eb1787De1C7bD48013579935
DeathVerifier address: 0x263f307a067B559972302ED69A68f7a2FfBb7639
Sarcophagus address: 0x17b6BBD34266Ed4d6770D9Ed643Fc24eE1a1197B
      ✔ Should prevent resource exhaustion through repeated failures
    🔒 State Consistency Protection
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xee98C47e4D793945D8372AaF89636455D28fa8dd
mockB3TR address: 0x0956d3d8480cD0C4e35b168D843B70582b67a7Bc
mockGLO address: 0xf30D040c8FE6a3ee53355E9D3b7A07cea477b8D8
OBOL address: 0x3940C74711923bB4bdbA231c360baA7F032b5F0D
DeathVerifier address: 0x50e7B653e34E904F72aB6B3942D67763CD834040
Sarcophagus address: 0x9D8946A8A0c5a583Bf05bE83B981406182ac9d2f
      ✔ Should maintain consistent state after failed transactions
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x82C9d5501a2C46125A82cc82D0881FA27751EA3E
mockB3TR address: 0xCc66f9A3cA2670972938FAD91d0865c4a62DFB25
mockGLO address: 0x8999CaBc43E28202c5A2257f2a95A45b1F8A62BD
OBOL address: 0xe082678eCF749982e33Ea6839852a8cd989aEDE2
DeathVerifier address: 0x984f797d26d3da2E9b9f8Ae4eeFEACC60fCAA90C
Sarcophagus address: 0x1eC5DF6299467Fb19b4e425eb47DF46C8f245078
      ✔ Should maintain consistent state across multiple operations
    🧪 Advanced Security & Fuzzing
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xceC1F31c57f178D348006670f2327317DA01112a
mockB3TR address: 0xd7Db0384564b62543BE8E371e7337A3400F4CCEA
mockGLO address: 0x43F332A84f571626fAdDfA669d78187c18977879
OBOL address: 0x92A50F3B3E88C81310AD48cEB46e1F6C332C850e
DeathVerifier address: 0x7eb918Ff18Aa8F20e319d3479CB46833a58a32Cb
Sarcophagus address: 0x23De02D83eb0D192CDc5fd578C284A2b2722cafF
      40) Invariant: total inheritance never exceeds deposited amount
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xD9d572665156732D1B61f3Bc3cfb08A5c20b2b2E
mockB3TR address: 0xb7779646a29d3510076DFDd7e60C203fa7093a29
mockGLO address: 0xe47F0396CfCB8134A791246924171950f1a83053
OBOL address: 0x1166f2A847d178C157941255af69D3A5ca6188A4
DeathVerifier address: 0x0e1738e89609E64bfF795093ddCEC2Ab679edfD7
Sarcophagus address: 0xae44841b3634D5DEAba372f5Fb822582817ea556
      41) Should resist Sybil attacks (many accounts farming rewards)
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xB7b8FF73bc1b41feF618f43dfe063f42753470f1
mockB3TR address: 0x0eC877d699e6996dAf44d5DfeA08B4FAb96CdB9a
mockGLO address: 0xC0aBdd4dbc131B916AF8Fc448153F38aBe69E370
OBOL address: 0x18B458D6f2349b293C624693bEdcFfE15C49543e
DeathVerifier address: 0x38a264A473A182d988b0Ebe351Ef431cA5CCD3A7
Sarcophagus address: 0x52C7a9DDC1fE319a98Bd193b758Eaa4735738dDB
      42) Should prevent malicious oracle from verifying false deaths
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0xc12a6C5db256d292aab034c4E5c4f6BBe4c0afAC
mockB3TR address: 0xCFA293D910719f8C1ddDD0CA5dDd3D6Cbf681833
mockGLO address: 0x5564efCae4bbf9eBd388a4Bf56688E51913c84D4
OBOL address: 0x365FfAac541ad6A847603dc2C6e981B9A888C781
DeathVerifier address: 0xD9aE19157f695c140CC45891bdEC9B467e7c1910
Sarcophagus address: 0xADf3314735C35C27B0a98f7fF1ab78cCD70F6B78
      43) Should handle oracle downtime (no verifications for a period)
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x9Be48cB9Eb443E850316DD09cdF1c2E150b09245
mockB3TR address: 0x5244E221ab9A63aB5471dA1B6BFdC00F72f0eA74
mockGLO address: 0x2fe9Dfa9FaF3Ebcc293Df4832BCAd687999CD63E
OBOL address: 0x78F7ddBB09D77f08b8E6a3Df94E79fe606966d82
DeathVerifier address: 0xC0939333007bD49D9f454dc81B4429740A74E475
Sarcophagus address: 0x7Ab5ae9512284fcdE1eB550BE8f9854B4E425702
      44) Should handle simultaneous inheritance claims (race condition)
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x204d2E5c581506e939295DaF99079b590ace906e
mockB3TR address: 0x64Ed22277402f01f3AD382270B419b9F5e87F4c4
mockGLO address: 0x8C2399346beA56A5FC4a5830D6C7Ee34a7d8DE4b
OBOL address: 0xa571c8B59D51f87d76E55f496A71A27B950d29c8
DeathVerifier address: 0x087756051DFF01d59d7f51A88975D59a9230FD69
Sarcophagus address: 0xb334795bf50e4943d076Dfb38D8C1A50F9F5a101
      ✔ Should handle simultaneous deposits (race condition)
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x17975FB494576ae89D627F904Ec723B87c7C35c8
mockB3TR address: 0x1C9f974DF781C6EB3764F21Fe961ba38305213df
mockGLO address: 0xC138B397Be84Ec53E2654eEf1D0D63355E459791
OBOL address: 0xa513902CE47191a5D4b63deFBa4f337347C512BE
DeathVerifier address: 0x3fb8D607A42B3c4536a7ffB8786639BfBd5cd9c0
Sarcophagus address: 0x0740BFEeAEb3c8a7b8718A4F3B20618568cDF621
      ✔ Should not emit excessive events (log bloat)
owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
user2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
user3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
oracle: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
attacker: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
mockVTHO address: 0x8DA6b6Dd929deed2237eBE41e0AABF4862d0b93A
mockB3TR address: 0xaAdA8236e22D0877159De81BDE5441Ad0C103d42
mockGLO address: 0x3dCe73fF914a4F844159A4B2dD9170d9499a783e
OBOL address: 0x68F5621191A75aa1212dbC49d7A8512Af059fb7F
DeathVerifier address: 0x4D62B7e8aeAA2d6edAAdd7D533843520aB4304c2
Sarcophagus address: 0x9090EcAeBa8d113e49ad8Ca83Bf9FB516C723885
      45) Should handle block.timestamp and block.number edge cases


  29 passing (23s)
  45 failing

  1) 🔒 Security Audit - Hybrid OBOL System
       🚨 Access Control Vulnerabilities
         Should prevent unauthorized death verification:
     Error: no matching fragment (operation="fragment", info={ "args": [ "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1751118352, 80, 85, "ipfs://fake-death-certificate" ], "key": "verifyDeath" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.verifyDeath (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:128:39)

  2) 🔒 Security Audit - Hybrid OBOL System
       💰 Economic Attacks
         Should prevent time manipulation attacks:

      AssertionError: expected 0 to be above 0.
      + expected - actual


      at Context.<anonymous> (test\security-audit.test.js:171:39)

  3) 🔒 Security Audit - Hybrid OBOL System
       🔄 Reentrancy Attacks
         Should prevent reentrancy in reward claiming:
     AssertionError: Expected transaction NOT to be reverted
      at Context.<anonymous> (test\security-audit.test.js:189:7)

  4) 🔒 Security Audit - Hybrid OBOL System
       📊 Precision and Overflow Attacks
         Should handle decimal precision correctly:
     HardhatError: HH17: The input value cannot be normalized to a BigInt: Unsupported type undefined
      at normalizeToBigInt (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\hardhat\src\common\bigInt.ts:47:13)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\@nomicfoundation\hardhat-chai-matchers\src\internal\bigNumber.ts:171:41)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at doAsserterAsyncAndAddThen (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:289:22)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:255:20)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at Context.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\test\security-audit.test.js:237:31)

  5) 🔒 Security Audit - Hybrid OBOL System
       📊 Precision and Overflow Attacks
         Should prevent integer overflow in reward calculations:
     HardhatError: HH17: The input value cannot be normalized to a BigInt: Unsupported type undefined
      at normalizeToBigInt (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\hardhat\src\common\bigInt.ts:47:13)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\@nomicfoundation\hardhat-chai-matchers\src\internal\bigNumber.ts:171:41)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at doAsserterAsyncAndAddThen (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:289:22)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:255:20)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at Context.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\test\security-audit.test.js:257:31)

  6) 🔒 Security Audit - Hybrid OBOL System
       📊 Precision and Overflow Attacks
         Should handle extreme reward calculations without overflow:
     HardhatError: HH17: The input value cannot be normalized to a BigInt: Unsupported type undefined
      at normalizeToBigInt (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\hardhat\src\common\bigInt.ts:47:13)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\@nomicfoundation\hardhat-chai-matchers\src\internal\bigNumber.ts:171:41)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at doAsserterAsyncAndAddThen (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:289:22)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:255:20)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at Context.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\test\security-audit.test.js:273:31)

  7) 🔒 Security Audit - Hybrid OBOL System
       📊 Precision and Overflow Attacks
         Should handle decimal precision in small amounts:
     HardhatError: HH17: The input value cannot be normalized to a BigInt: Unsupported type undefined
      at normalizeToBigInt (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\hardhat\src\common\bigInt.ts:47:13)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\@nomicfoundation\hardhat-chai-matchers\src\internal\bigNumber.ts:171:41)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at doAsserterAsyncAndAddThen (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:289:22)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:255:20)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at Context.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\test\security-audit.test.js:289:33)

  8) 🔒 Security Audit - Hybrid OBOL System
       📊 Precision and Overflow Attacks
         Should prevent integer overflow in beneficiary calculations:
     Error: no matching fragment (operation="fragment", info={ "args": [ [ "0x91AA25C93442dF64602Df2c48a200fCf41DFCABd", "0x0b5D676732164400aAeE5C9013D7A0d73C9EEC46", "0xDF1e1E957485d97a25f13C2699A6577ADDa70a66", "0x718C56901F9E95C4d64B0baC6B58388827f6E443", "0xD56313866eaE2Ecdf8593568164A54AEA0D92721" ], [ 2000, 2000, 2000, 2000, 2000 ] ], "key": "createSarcophagus" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.createSarcophagus (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:307:36)

  9) 🔒 Security Audit - Hybrid OBOL System
       🎯 Logic Vulnerabilities
         Should prevent double inheritance claims:
     Error: no matching fragment (operation="fragment", info={ "args": [ "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1751118357, 80, 85, "ipfs://death-certificate" ], "key": "verifyDeath" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.verifyDeath (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:323:41)

  10) 🔒 Security Audit - Hybrid OBOL System
       🎯 Logic Vulnerabilities
         Should prevent non-beneficiary claims:
     Error: VM Exception while processing transaction: reverted with custom error 'AccessControlUnauthorizedAccount("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", "0x0ce23c3e399818cfee81a7ab0880f714e53d7672b08df0fa62f2843416e1ea09")'
    at Sarcophagus._checkRole (@openzeppelin/contracts/access/AccessControl.sol:96)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.verifyDeath (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:365:7)
  

  11) 🔒 Security Audit - Hybrid OBOL System
       🔐 Pause Functionality
         Should allow admin to pause contracts:
     Error: VM Exception while processing transaction: reverted with custom error 'ExpectedPause()'
    at OBOL._requirePaused (@openzeppelin/contracts/utils/Pausable.sol:85)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.unpause (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:377:7)
  

  12) 🔒 Security Audit - Hybrid OBOL System
       🔐 Pause Functionality
         Should prevent operations when paused:
     AssertionError: Expected transaction to be reverted with custom error 'EnforcedPause', but it didn't revert
      at Context.<anonymous> (test\security-audit.test.js:393:7)

  13) 🔒 Security Audit - Hybrid OBOL System
       🔐 Pause Functionality
         Should prevent non-admin from pausing:
     TypeError: sarcophagus.connect(...).pause is not a function
      at Context.<anonymous> (test\security-audit.test.js:404:39)

  14) 🔒 Security Audit - Hybrid OBOL System
       🕐 Time-based Vulnerabilities
         Should handle timestamp manipulation:
     Error: VM Exception while processing transaction: reverted with custom error 'NoRewardsToClaim()'
    at OBOL.claimContinuousRewards (contracts/OBOL.sol:157)
    at Sarcophagus.claimObolRewards (contracts/Sarcophagus.sol:547)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.claimObolRewards (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:438:7)
  

  15) 🔒 Security Audit - Hybrid OBOL System
       🎭 Front-running Protection
         Should prevent front-running in reward claiming:
     Error: VM Exception while processing transaction: reverted with custom error 'NoRewardsToClaim()'
    at OBOL.claimContinuousRewards (contracts/OBOL.sol:157)
    at Sarcophagus.claimObolRewards (contracts/Sarcophagus.sol:547)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.claimObolRewards (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:475:7)
  

  16) 🔒 Security Audit - Hybrid OBOL System
       🔍 Input Validation
         Should prevent DoS attacks with many beneficiaries:
     Error: no matching fragment (operation="fragment", info={ "args": [ [ "0x276173fb63D34Ea69Ba91CC8b6f1E566132ff197", "0x3D9A4b087b84059A1d55B18c7bB23A84B0d151C3", "0x829F7656c7a5b4BD7f5A71A20D457c23E2Ff1384", "0x319872c113e766B681E5811c3a05A91A45F655c9", "0x854c26a94C32062096D7c99864ED99AD2494A500", "0xF9a07FFCAef98B19f84CA75F460b92a06DcbdC20", "0x90e93ece54F2Dad6EE00cD5f3D3b12F709aAC8f3", "0xF1040A0AecbbFd7BbE713EDf258CeCF4b78d405B", "0x2be4971af86FcC22D42e2155C29cE9F05D9aA445", "0xA9fC12D385A139D9E6b40386A83C637B0605e415", "0x5A3773b29293B5143142abD420a411008C2b131b", "0xE35832fB78444AAF9a176257864909A140Bc87aF", "0x7B6A7C5bEe632ac2F5C4f119b7f898461e7d1BcD", "0x6397B731429d2be7c8b758070450D28a717CA4bc", "0xCbA7fE0195d947EFadFFABC73e0ADf45BbAD5357", "0xe7f44C5236F5A0089639D2f37dE40b1De0B72843", "0x88cCa688190eE47BEAEc67ec8Ba6073864574569", "0x32875Fe2d87091266f18cea6dda060a9c5928b9A", "0xf9B6B517bf16D912fD9eFca15e5a04BA0bC62B55", "0xd0Dd941E6c4EdC8AA8E141d19E6c0FAD0E50e58d", "0x542a3B3f995F5a1e08B7F982B927747A874764e5", "0xeaaC02C82b9Fc65648423974d54B77d4d91803B8", "0x03dbcf0639D2D7C7fC871D159FBE0f540242A6f9", "0xf1b17B01222AC8b947ef730b204D684AD7faB4ff", "0x2742E6d896bD0679dEbEc61128B33E4f6dD47Bb6", "0x41d299A34210834d827Fc4E01fD778752d61F8F9", "0xC2AE1459360f2e838f5dbD62546E3CF7433fCa23", "0x34Fed6C9c7F0d909131934B3F1bB809dCBB2c8B5", "0x499E825d19077f1683f415B17c54121415030294", "0x9c63bA010ce484b2679963cE203Aa6c63417709B", "0x7d17B842aa2dCA49c1708926d89c372E5398657F", "0x5CC96967F5d6542b3f28F8f14E73505765b66bec", "0xF3A656016A32959b861454c151de0505b9F49d49", "0xa17d875cFDAb46cc63086cd2365fFbdad5c03b92", "0xf6fF04cBaA850DbF6Cc505B49EeCb1B86868095d", "0xFf8F1724dfddF7E2BF6ccDE4336E8564924B1e3b", "0x7d2aF694e232e2B1a2A64B4d25E83FCB04Bb8AB7", "0x00DeFa5d4ACD916F1b7C99964292fe369992d798", "0xc3FBBCFFD5A7Fe5Ba88101a68cF92479Beb10F3B", "0x550A0696B840971A88703e5f5dcaB95aEc2CcA70", "0x702b4D56c333c27CBA2d1149F72BC39298492479", "0x3110dd677cB24079aeC4dAD3DE0245374f6b69dc", "0xc518768D453715353fe468820F79E31B324B1293", "0x156F5bc6b3be031B478dED7C1024D69cc94Efc83", "0x60195a15034ffe4138203c2fBa4209AA9BE56301", "0x843Ae746E06762e7f9efC7FC194b805054294545", "0x419E08615D9bEC980Eb121cE0Af3e7DC1716BA7A", "0x24D356CE6ADDd9E3D1351a22A680532Aec97AE76", "0xa8Dd251E40dFbe8C86dC360f7AD9f9A6D37dCfd1", "0x155de3a7c4379074C97F7e130F25c4c531b6B60e", "0x941e5fBC8B35f78D9D8E9f9057821895D1Ef7564", "0x0795Ba03bf0280824D38D3b03804F239d7Cc780e", "0x9F000A31970632f68b0A41C1bd88FB8a3c90e618", "0xd0875004e1612D1aaCc1F8ceD59a93e0FF95E5EC", "0xc380dAc6C0E39c28E8763b09bC187f4cFC27D2EC", "0x6AF6e15699AeE7A829fe4182415CfF5e97e8E237", "0x43037c797bCAC2a3940A1c7782394e5Bc0F931e5", "0x63D92fB0128Ba2D0a70f7964A6d926979Df230F1", "0x6cC681977e270d896ed2fD5eC7F68280909D7f2a", "0xC3D6ff573dE630ed483201D5bDD12B44Be1df3c2", "0x674F88605275982fdb25c89bd50C02DEa3Cab1F7", "0x46079Fb3f9136B674dcbF26B21Af073e6D5aADf7", "0x0f2954aA6dCe09Bea83944d11612Da31AFcA0d0B", "0xC3703417b57411454E3c2Ad9108518cB10a59aF2", "0xAdf4440d0B136bb7ea47659f3e161acdbfb894FF", "0x259235F3E444be27Eaf7Cae198e7D8276848A389", "0x03D4908bAC62a3dC068adFc2fA0BD142a27b3f70", "0x6e2E5E034E675Dcf147B04fbAD6560c3D8E9C29A", "0xbe8823388816A8b0136E20890382F73Cfe72ebB2", "0xb80887E2AB9730AD9921d89BD90Cd8dE3E13221d", "0xCb51352C45AFA99F8e524F9bA582C7C22F988501", "0xd2BaAEaAD5a51a5DDb994441CB8473b84D15F581", "0x9CcB49354488C39cc71886c1be792B857A1a3A38", "0x21092540da1494c22C1f512E4eA253729E6a402a", "0xf65B47464492E5E1F18c4Bd99aBc612780154c0e", "0x8F300bdA4881a5168832CEc3d255F906cEcBB2b2", "0x99B8127De15B0252a3700c4ecdA3E8B841085F3D", "0x2D2232518DcBD069d028ad1E65aeb424c85167CF", "0x6E675c8D554669119a8eE0caEa187cf27431760f", "0x88213d7F3CB5173C6b8D33FD7B1E4440BD961160", "0x79ae44cb042eA6f10150Ba6bb93d6BFe0F90c48c", "0x8F2eEA7e8fB3E7475EE6977394b319ea9F8EAB42", "0x00bfc0BaD8CF7B74d7b67e92fF47993EF1120096", "0xDA320C0a68aD533F27a184111e082f047e6F21F7", "0xAC3C6B9fC61487f8A62f4188dA5d279d203a443F", "0x37653193122E7BA37199e5990881F0f383916C10", "0xD4efaE08FD412530abD98Ec2A4EF85Ef5d41efD8", "0x0a2B5D56f4BE3397E52117905b50Bd370647d586", "0x7582A8b2eB357f5c648eBFA6769bdd6d0f0d5522", "0xc57FC5efEa651d5790ce7c84900B0A731503f06d", "0xd5Da20C0EC46891d48325D34189806AdCa3f1670", "0xa3254a676061463858653299756Bb89c9d75863d", "0xF6914aF27FBDFC70688187bA2a968890cF1785B8", "0x69B2136B9DdF4FDDe37cd1536D2222444006F126", "0xBC648194e45B07AC2bB8BFF3DBa067b7FF1D91c4", "0x53c02fFDA058f446D1d2DE4037Cd345755e32dF7", "0xe5BD2a797F273aE21802242b6143fbD896A4F87e", "0x36911509a59320566Ecbf8A78C90ab5d5dd2DD87", "0xE70E400fde5c2a97C9C275696319efDb9a24a64F", "0x44286504Bd5e09D460Ef635aAD8A9D8664401984" ], [ 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100 ] ], "key": "createSarcophagus" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.createSarcophagus (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:526:36)

  17) 🔒 Security Audit - Hybrid OBOL System
       🔒 Advanced Reentrancy Protection
         Should prevent reentrancy in inheritance claiming:
     Error: no matching fragment (operation="fragment", info={ "args": [ "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1751118363, 80, 85, "ipfs://death-certificate" ], "key": "verifyDeath" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.verifyDeath (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:577:41)

  18) 🔒 Security Audit - Hybrid OBOL System
       🔒 Advanced Reentrancy Protection
         Should prevent reentrancy in user verification:

      AssertionError: expected 0 to equal 30.
      + expected - actual

      -0
      +30
      
      at Context.<anonymous> (test\security-audit.test.js:599:35)

  19) 🔒 Security Audit - Hybrid OBOL System
       🔒 Advanced Reentrancy Protection
         Should prevent reentrancy in sarcophagus creation:
     TypeError: Cannot read properties of undefined (reading '0')
      at Context.<anonymous> (test\security-audit.test.js:610:43)

  20) 🔒 Security Audit - Hybrid OBOL System
       💰 Advanced Economic Attacks
         Should prevent flash loan attacks on reward calculations:
     Error: VM Exception while processing transaction: reverted with custom error 'NoRewardsToClaim()'
    at OBOL.claimContinuousRewards (contracts/OBOL.sol:157)
    at Sarcophagus.claimObolRewards (contracts/Sarcophagus.sol:547)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.claimObolRewards (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:629:7)
  

  21) 🔒 Security Audit - Hybrid OBOL System
       💰 Advanced Economic Attacks
         Should prevent reward manipulation through multiple deposits:
     HardhatError: HH17: The input value cannot be normalized to a BigInt: Unsupported type undefined
      at normalizeToBigInt (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\hardhat\src\common\bigInt.ts:47:13)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\@nomicfoundation\hardhat-chai-matchers\src\internal\bigNumber.ts:171:41)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at doAsserterAsyncAndAddThen (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:289:22)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:255:20)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at Context.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\test\security-audit.test.js:652:31)

  22) 🔒 Security Audit - Hybrid OBOL System
       💰 Advanced Economic Attacks
         Should prevent reward farming through rapid deposit/withdraw cycles:
     HardhatError: HH17: The input value cannot be normalized to a BigInt: Unsupported type undefined
      at normalizeToBigInt (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\hardhat\src\common\bigInt.ts:47:13)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\@nomicfoundation\hardhat-chai-matchers\src\internal\bigNumber.ts:171:41)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at doAsserterAsyncAndAddThen (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:289:22)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:255:20)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at Context.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\test\security-audit.test.js:667:31)

  23) 🔒 Security Audit - Hybrid OBOL System
       🎯 Advanced Logic Vulnerabilities
         Should prevent inheritance claims after beneficiary removal:
     HardhatError: HH17: The input value cannot be normalized to a BigInt: Unsupported type undefined
      at normalizeToBigInt (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\hardhat\src\common\bigInt.ts:47:13)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\@nomicfoundation\hardhat-chai-matchers\src\internal\bigNumber.ts:171:41)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at doAsserterAsyncAndAddThen (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:289:22)
      at Proxy.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\chai-as-promised\lib\chai-as-promised.js:255:20)
      at Proxy.overwritingMethodWrapper (file:///C:/Users/NickC_4denkwr/Desktop/Vereavement/vereavement-contracts/node_modules/chai/chai.js:1670:33)
      at Context.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\test\security-audit.test.js:684:31)

  24) 🔒 Security Audit - Hybrid OBOL System
       🎯 Advanced Logic Vulnerabilities
         Should prevent multiple death verifications:
     Error: VM Exception while processing transaction: reverted with custom error 'AccessControlUnauthorizedAccount("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", "0x0ce23c3e399818cfee81a7ab0880f714e53d7672b08df0fa62f2843416e1ea09")'
    at Sarcophagus._checkRole (@openzeppelin/contracts/access/AccessControl.sol:96)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.verifyDeath (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:697:7)
  

  25) 🔒 Security Audit - Hybrid OBOL System
       🎯 Advanced Logic Vulnerabilities
         Should prevent inheritance claims with invalid beneficiary percentages:
     AssertionError: Expected transaction to be reverted with custom error 'TotalPercentageNot100', but it reverted with custom error 'InvalidBeneficiaryCount'
      at Context.<anonymous> (test\security-audit.test.js:709:7)

  26) 🔒 Security Audit - Hybrid OBOL System
       🎯 Advanced Logic Vulnerabilities
         Should prevent inheritance claims with zero beneficiaries:
     Error: no matching fragment (operation="fragment", info={ "args": [ [  ], [  ] ], "key": "createSarcophagus" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.createSarcophagus (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:719:36)

  27) 🔒 Security Audit - Hybrid OBOL System
       🔐 Advanced Access Control
         Should prevent unauthorized oracle operations:
     Error: no matching fragment (operation="fragment", info={ "args": [ "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1751118365, 80, 85, "ipfs://fake-death-certificate" ], "key": "verifyDeath" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.verifyDeath (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:753:39)

  28) 🔒 Security Audit - Hybrid OBOL System
       📊 Advanced Precision and Overflow Protection
         Should handle extreme reward calculations without overflow:
     ProviderError: Sender doesn't have enough funds to send tx. The max upfront cost is: 100010000000000000000 and the sender's balance is: 9999815563000000000.
      at EdrProviderWrapper.request (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:368:19)
      at HardhatEthersSigner.sendTransaction (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
      at send (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\ethers\src.ts\contract\contract.ts:313:20)
      at Proxy.depositTokens (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\node_modules\ethers\src.ts\contract\contract.ts:352:16)
      at Context.<anonymous> (C:\Users\NickC_4denkwr\Desktop\Vereavement\vereavement-contracts\test\security-audit.test.js:779:7)

  29) 🔒 Security Audit - Hybrid OBOL System
       📊 Advanced Precision and Overflow Protection
         Should prevent integer overflow in beneficiary calculations:
     Error: no matching fragment (operation="fragment", info={ "args": [ [ "0xc8790B0C4848Ae090Be6aC2AD044e0b8F400077e", "0x6fAeFc912Bb649ea3F0f7572084881Bb66A4a7D6", "0x0A6c3682BE4393f4A98ED2f550fBebB359744520", "0xE3DF90b959dcAa85A250218F8Be44c0f0fbd2Bbc", "0x610e04ff48dc8a23723172F9E4321a3132f8A658" ], [ 2000, 2000, 2000, 2000, 2000 ] ], "key": "createSarcophagus" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.createSarcophagus (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:817:36)

  30) 🔒 Security Audit - Hybrid OBOL System
       🕐 Advanced Time-based Protection
         Should handle leap year calculations correctly:
     Error: VM Exception while processing transaction: reverted with custom error 'NoRewardsToClaim()'
    at OBOL.claimContinuousRewards (contracts/OBOL.sol:157)
    at Sarcophagus.claimObolRewards (contracts/Sarcophagus.sol:547)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.claimObolRewards (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:836:7)
  

  31) 🔒 Security Audit - Hybrid OBOL System
       🕐 Advanced Time-based Protection
         Should handle time zone edge cases:
     Error: VM Exception while processing transaction: reverted with custom error 'NoRewardsToClaim()'
    at OBOL.claimContinuousRewards (contracts/OBOL.sol:157)
    at Sarcophagus.claimObolRewards (contracts/Sarcophagus.sol:547)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.claimObolRewards (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:855:7)
  

  32) 🔒 Security Audit - Hybrid OBOL System
       🕐 Advanced Time-based Protection
         Should prevent time manipulation through block timestamp:
     Error: VM Exception while processing transaction: reverted with custom error 'NoRewardsToClaim()'
    at OBOL.claimContinuousRewards (contracts/OBOL.sol:157)
    at Sarcophagus.claimObolRewards (contracts/Sarcophagus.sol:547)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.claimObolRewards (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:875:7)
  

  33) 🔒 Security Audit - Hybrid OBOL System
       🎭 Advanced Front-running Protection
         Should prevent MEV attacks on inheritance claims:
     Error: no matching fragment (operation="fragment", info={ "args": [ "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1751118367, 80, 85, "ipfs://death-certificate" ], "key": "verifyDeath" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.verifyDeath (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:889:41)

  34) 🔒 Security Audit - Hybrid OBOL System
       🔍 Input Validation
         Should validate life expectancy calculations:
     Error: no matching fragment (operation="fragment", info={ "args": [ "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1751118368, 80, 75, "ipfs://death-certificate" ], "key": "verifyDeath" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.verifyDeath (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:927:37)

  35) 🔒 Security Audit - Hybrid OBOL System
       🚨 Advanced DoS Protection
         Should prevent event spam attacks:
     Error: VM Exception while processing transaction: reverted with custom error 'NoRewardsToClaim()'
    at OBOL.claimContinuousRewards (contracts/OBOL.sol:157)
    at Sarcophagus.claimObolRewards (contracts/Sarcophagus.sol:547)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.claimObolRewards (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:972:9)
  

  36) 🔒 Security Audit - Hybrid OBOL System
       🚨 Advanced DoS Protection
         Should prevent cross-function reentrancy DoS:
     AssertionError: Expected transaction NOT to be reverted
      at Context.<anonymous> (test\security-audit.test.js:1009:7)

  37) 🔒 Security Audit - Hybrid OBOL System
       🚨 Advanced DoS Protection
         Should prevent block gas limit attacks:
     Error: no matching fragment (operation="fragment", info={ "args": [ [ "0xf38B334f50D88e319dD3e992C55b8CB5459a3a21", "0x7D7021f58f13a941CFCDB7eaA2B01b405C841bE1", "0xD35ccC3a5b4dAa33AE97679aF397cD2E453f7c25" ], [ 3333, 3333, 3333 ] ], "key": "createSarcophagus" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.createSarcophagus (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:1035:36)

  38) 🔒 Security Audit - Hybrid OBOL System
       🚨 Advanced DoS Protection
         Should prevent memory exhaustion through large data structures:
     Error: no matching fragment (operation="fragment", info={ "args": [ [ "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "0x90F79bf6EB2c4f870365E785982E1f101E93b906" ], [ 5000, 5000 ] ], "key": "createSarcophagus" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.createSarcophagus (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:1048:36)

  39) 🔒 Security Audit - Hybrid OBOL System
       🚨 Advanced DoS Protection
         Should prevent deep call stack attacks:
     Error: no matching fragment (operation="fragment", info={ "args": [ "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1751118369, 80, 85, "ipfs://death-certificate" ], "key": "verifyDeath" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.verifyDeath (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:1060:41)

  40) 🔒 Security Audit - Hybrid OBOL System
       🧪 Advanced Security & Fuzzing
         Invariant: total inheritance never exceeds deposited amount:
     Error: VM Exception while processing transaction: reverted with custom error 'InvalidBeneficiaryCount()'
    at Sarcophagus._validateArrayLengths (contracts/Sarcophagus.sol:363)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.createSarcophagus (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:1174:7)
  

  41) 🔒 Security Audit - Hybrid OBOL System
       🧪 Advanced Security & Fuzzing
         Should resist Sybil attacks (many accounts farming rewards):
     TypeError: sarcophagus.connect(...).verifyUser is not a function
      at Context.<anonymous> (test\security-audit.test.js:1196:42)

  42) 🔒 Security Audit - Hybrid OBOL System
       🧪 Advanced Security & Fuzzing
         Should prevent malicious oracle from verifying false deaths:
     Error: no matching fragment (operation="fragment", info={ "args": [ "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1751118371, 80, 85, "ipfs://fake-death" ], "key": "verifyDeath" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.verifyDeath (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:1212:39)

  43) 🔒 Security Audit - Hybrid OBOL System
       🧪 Advanced Security & Fuzzing
         Should handle oracle downtime (no verifications for a period):
     Error: no matching fragment (operation="fragment", info={ "args": [ "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" ], "key": "claimInheritance" }, code=UNSUPPORTED_OPERATION, version=6.14.4)
      at makeError (node_modules\ethers\src.ts\utils\errors.ts:698:21)
      at assert (node_modules\ethers\src.ts\utils\errors.ts:719:25)
      at getFragment (node_modules\ethers\src.ts\contract\contract.ts:270:15)
      at Proxy.claimInheritance (node_modules\ethers\src.ts\contract\contract.ts:350:26)
      at Context.<anonymous> (test\security-audit.test.js:1224:36)

  44) 🔒 Security Audit - Hybrid OBOL System
       🧪 Advanced Security & Fuzzing
         Should handle simultaneous inheritance claims (race condition):
     Error: VM Exception while processing transaction: reverted with custom error 'InvalidBeneficiaryCount()'
    at Sarcophagus._validateArrayLengths (contracts/Sarcophagus.sol:363)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.createSarcophagus (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:1230:7)
  

  45) 🔒 Security Audit - Hybrid OBOL System
       🧪 Advanced Security & Fuzzing
         Should handle block.timestamp and block.number edge cases:
     Error: VM Exception while processing transaction: reverted with custom error 'NoRewardsToClaim()'
    at OBOL.claimContinuousRewards (contracts/OBOL.sol:157)
    at Sarcophagus.claimObolRewards (contracts/Sarcophagus.sol:547)
    at EdrProviderWrapper.request (node_modules\hardhat\src\internal\hardhat-network\provider\provider.ts:359:41)
    at HardhatEthersSigner.sendTransaction (node_modules\@nomicfoundation\hardhat-ethers\src\signers.ts:181:18)
    at send (node_modules\ethers\src.ts\contract\contract.ts:313:20)
    at Proxy.claimObolRewards (node_modules\ethers\src.ts\contract\contract.ts:352:16)
    at Context.<anonymous> (test\security-audit.test.js:1276:7)
  





### 4. Full Test Suite
**Status:** success
✅ All tests passing

### 5. Gas Analysis
**Status:** failed
**Analysis Errors:**  ·------------------------|--------------------------------|--------------------------------·
 |  Solc version: 0.8.24  ·  Optimizer enabled: true       ·  Runs: 200                     │
 ·························|································|·································
 |  Contract Name         ·  Deployed size (KiB) (change)  ·  Initcode size (KiB) (change)  │
 ·························|································|·································
 |  B3TRRewards           ·                 6.258 (0.000)  ·                 7.275 (0.000)  │
 ·························|································|·································
 |  DeathVerifier         ·                 7.855 (0.000)  ·                 8.681 (0.000)  │
 ·························|································|·································
 |  MockDeathVerifier     ·                 0.406 (0.000)  ·                 0.434 (0.000)  │
 ·························|································|·································
 |  MultiSigWallet        ·                 8.105 (0.000)  ·                10.063 (0.000)  │
 ·························|································|·································
 |  OBOL                  ·                 8.919 (0.000)  ·                10.522 (0.000)  │
 ·························|································|·································
 |  Sarcophagus           ·                22.036 (0.000)  ·                23.084 (0.000)  │
 ·------------------------|--------------------------------|--------------------------------·



---

## 📏 Contract Size Analysis



---

## ✅ Manual Review Checklist

### Access Control
- ✅ Role-based access control implemented
- ✅ Admin functions properly protected
- ✅ Emergency pause functionality
- ⚠️ Multi-signature requirements needed
- ⚠️ Role delegation mechanisms needed

### Reentrancy Protection
- ✅ ReentrancyGuard used in critical functions
- ⚠️ CEI pattern not consistently followed
- ⚠️ External calls before state updates found
- ⚠️ Pull over push pattern needed

### Economic Security
- ✅ Rate limiting implemented
- ✅ Cooldown periods in place
- ⚠️ Flash loan attack protection needed
- ⚠️ MEV protection mechanisms needed
- ⚠️ Economic attack simulations needed

### Oracle Security
- ✅ Oracle signature verification
- ⚠️ Oracle downtime handling needed
- ⚠️ Multiple oracle support needed
- ⚠️ Oracle manipulation protection needed

### Upgradeability
- ⚠️ Upgradeable pattern not implemented
- ⚠️ Proxy pattern needed
- ⚠️ Storage layout safety needed
- ⚠️ Upgrade governance needed

---

## 🎯 Recommendations

### Immediate Actions (1-2 weeks)
1. Fix all critical reentrancy vulnerabilities
2. Implement proper access controls
3. Add comprehensive error handling

### Short-term Actions (2-4 weeks)
1. Address high-priority security issues
2. Implement upgradeable pattern
3. Add economic attack protections

### Long-term Actions (1-3 months)
1. Conduct professional security audit
2. Implement formal verification
3. Establish bug bounty program

---

## 📁 Generated Reports

- **Slither Analysis:** `security-reports/slither-detailed.json`
- **Security Summary:** `security-reports/slither-analysis-summary.md`
- **Comprehensive Report:** `security-reports/comprehensive-security-report.md`

---

**Note:** This report is generated automatically. For detailed analysis, refer to individual tool outputs and conduct manual code review.
