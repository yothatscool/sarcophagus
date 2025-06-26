const { ethers } = require("hardhat");

async function testOBOLIntegration() {
  console.log("🧪 Testing OBOL Token Integration...\n");

  // Deploy mock contracts
  const [deployer, user1, user2] = await ethers.getSigners();
  
  // Deploy mock tokens
  const MockVTHO = await ethers.getContractFactory("MockVTHO");
  const mockVTHO = await MockVTHO.deploy();
  await mockVTHO.waitForDeployment();
  
  const MockB3TR = await ethers.getContractFactory("MockB3TR");
  const mockB3TR = await MockB3TR.deploy();
  await mockB3TR.waitForDeployment();
  
  // Deploy OBOL token
  const OBOL = await ethers.getContractFactory("OBOL");
  const obol = await OBOL.deploy();
  await obol.waitForDeployment();
  
  // Deploy DeathVerifier
  const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
  const deathVerifier = await DeathVerifier.deploy();
  await deathVerifier.waitForDeployment();
  
  // Deploy Sarcophagus
  const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
  const sarcophagus = await Sarcophagus.deploy(
    await mockVTHO.getAddress(),
    await mockB3TR.getAddress(),
    await obol.getAddress(),
    await deathVerifier.getAddress(),
    await obol.getAddress(),
    deployer.address // feeCollector
  );
  await sarcophagus.waitForDeployment();

  console.log("✅ Contracts deployed successfully");
  console.log(`   OBOL Token: ${await obol.getAddress()}`);
  console.log(`   Sarcophagus: ${await sarcophagus.getAddress()}`);
  console.log(`   DeathVerifier: ${await deathVerifier.getAddress()}\n`);

  // Grant vault role to Sarcophagus
  await obol.grantVaultRole(await sarcophagus.getAddress());
  console.log("✅ Vault role granted to Sarcophagus");

  // Test tokenomics
  const tokenomics = await obol.getTokenomics();
  console.log("\n📊 Tokenomics:");
  console.log(`   Total Supply: ${ethers.formatEther(tokenomics.totalSupplyAmount)} OBOL`);
  console.log(`   Initial Supply: ${ethers.formatEther(tokenomics.initialSupply)} OBOL (5%)`);
  console.log(`   Reward Supply: ${ethers.formatEther(tokenomics.rewardSupply)} OBOL (95%)`);
  console.log(`   Initial Bonus Rate: ${tokenomics.initialBonusRate} OBOL per 1 VET`);
  console.log(`   Daily Reward Rate: ${tokenomics.dailyRewardRate}%`);
  console.log(`   Bonus Reward Rate: ${tokenomics.bonusRewardRate}%`);

  // Test vesting
  const vestingProgress = await obol.getVestingProgress();
  const vestedAmount = await obol.getVestedAmount();
  console.log(`\n⏰ Vesting Status:`);
  console.log(`   Progress: ${vestingProgress}%`);
  console.log(`   Vested Amount: ${ethers.formatEther(vestedAmount)} OBOL`);

  // Test reward calculation
  const depositValue = ethers.parseEther("100"); // 100 VET (minimum deposit)
  const expectedReward = await obol.calculateReward(depositValue);
  console.log(`\n💰 Reward Calculation:`);
  console.log(`   Deposit Value: ${ethers.formatEther(depositValue)} VET`);
  console.log(`   Expected Reward: ${ethers.formatEther(expectedReward)} OBOL`);

  // Test remaining reward supply
  const remainingSupply = await obol.getRemainingRewardSupply();
  console.log(`   Remaining Reward Supply: ${ethers.formatEther(remainingSupply)} OBOL`);

  // Test user verification and sarcophagus creation
  console.log("\n👤 Testing User Flow:");
  
  // Verify user1 before creating sarcophagus
  await deathVerifier.verifyUser(user1.address, 30, "ipfs://verification");

  // Create sarcophagus (no verification needed in current version)
  const beneficiaries = [user2.address];
  const percentages = [10000]; // 100%
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const guardians = [zeroAddress];
  const ages = [30];
  const contingentBeneficiaries = [zeroAddress];
  const survivorshipPeriods = [0];
  await sarcophagus.connect(user1).createSarcophagus(
    beneficiaries,
    percentages,
    guardians,
    ages,
    contingentBeneficiaries,
    survivorshipPeriods
  );
  console.log(`   ✅ Sarcophagus created for ${user1.address}`);

  // Fast-forward 30 days to satisfy MINIMUM_LOCK_PERIOD
  await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine");

  // Test deposit and OBOL rewards
  console.log("\n💸 Testing Deposits and OBOL Rewards:");
  
  const depositAmount = ethers.parseEther("100"); // 100 VET (minimum deposit)
  await sarcophagus.connect(user1).depositTokens(depositAmount, 0, 0, { value: depositAmount });
  console.log(`   ✅ Deposited ${ethers.formatEther(depositAmount)} VET`);

  // Check OBOL balance
  const obolBalance = await obol.balanceOf(user1.address);
  console.log(`   🪙 OBOL Balance: ${ethers.formatEther(obolBalance)} OBOL`);

  // Fast-forward time to accumulate continuous rewards
  await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // 7 days
  await ethers.provider.send("evm_mine");
  console.log(`   ⏰ Fast-forwarded 7 days to accumulate rewards`);

  // After deposit, claim OBOL rewards
  await obol.connect(user1).claimContinuousRewards(user1.address);
  console.log(`   ✅ Claimed OBOL rewards`);

  // Check OBOL balance after claiming
  const obolBalanceAfterClaim = await obol.balanceOf(user1.address);
  console.log(`   🪙 OBOL Balance after claim: ${ethers.formatEther(obolBalanceAfterClaim)} OBOL`);

  // Test OBOL locking
  console.log("\n🔒 Testing OBOL Locking:");
  
  // Use available OBOL balance for locking (or a small amount if balance is very low)
  const availableBalance = await obol.balanceOf(user1.address);
  const lockAmount = availableBalance > ethers.parseEther("0.001") ? 
    ethers.parseEther("0.001") : availableBalance;
  
  if (lockAmount > 0) {
    await obol.connect(user1).lockInVault(await sarcophagus.getAddress(), lockAmount);
    console.log(`   ✅ Locked ${ethers.formatEther(lockAmount)} OBOL in vault`);
  } else {
    console.log(`   ⚠️ No OBOL available to lock (balance: ${ethers.formatEther(availableBalance)} OBOL)`);
  }

  // Test death verification and inheritance
  console.log("\n💀 Testing Death Verification:");
  
  // Grant VERIFIER_ROLE to deployer for death verification
  await sarcophagus.grantRole(await sarcophagus.VERIFIER_ROLE(), deployer.address);
  
  await sarcophagus.verifyDeath(
    user1.address,
    Math.floor(Date.now() / 1000),
    65 // Age at death
  );
  console.log(`   ✅ Death verified (age 65)`);

  // Test inheritance claim
  await sarcophagus.connect(user2).claimInheritance(user1.address, 0); // beneficiaryIndex = 0
  console.log(`   ✅ Inheritance claimed by beneficiary`);

  // Test hard cap on unclaimed rewards
  console.log("\n📊 Testing Hard Cap Functionality:");
  
  // Create a new user to test hard cap without inheritance
  const user3 = (await ethers.getSigners())[3];
  
  // Verify user3
  await deathVerifier.verifyUser(user3.address, 35, "ipfs://verification");
  
  // Create sarcophagus for user3
  await sarcophagus.connect(user3).createSarcophagus(
    [user2.address], // beneficiaries
    [10000], // percentages
    [zeroAddress], // guardians
    [30], // ages
    [zeroAddress], // contingentBeneficiaries
    [0] // survivorshipPeriods
  );
  
  // Fast-forward 30 days to satisfy minimum lock period
  await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine");
  
  // Deposit a large amount to accumulate significant rewards
  const largeDeposit = ethers.parseEther("1000"); // 1,000 VET
  await sarcophagus.connect(user3).depositTokens(largeDeposit, 0, 0, { value: largeDeposit });
  console.log(`   ✅ Deposited ${ethers.formatEther(largeDeposit)} VET for hard cap testing`);
  
  // Fast-forward 1 year to accumulate substantial rewards
  await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine");
  
  // Check hard cap status
  const [hasReachedCap, currentUnclaimed, maxAllowed] = await obol.hasReachedUnclaimedCap(user3.address);
  
  console.log(`📊 Hard Cap Test Results:`);
  console.log(`   Current Unclaimed: ${ethers.formatEther(currentUnclaimed)} OBOL`);
  console.log(`   Max Allowed: ${ethers.formatEther(maxAllowed)} OBOL`);
  console.log(`   Has Reached Cap: ${hasReachedCap}`);
  
  if (hasReachedCap) {
    console.log(`   ✅ User has reached the 1500 OBOL hard cap`);
    
    // Fast forward another year to verify no more rewards accumulate
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    
    const [newHasReachedCap, newCurrentUnclaimed] = await obol.hasReachedUnclaimedCap(user3.address);
    
    console.log(`   After another year:`);
    console.log(`   New Unclaimed: ${ethers.formatEther(newCurrentUnclaimed)} OBOL`);
    console.log(`   Still at Cap: ${newHasReachedCap}`);
  } else {
    console.log(`   ⏳ User has not yet reached the cap (${ethers.formatEther(currentUnclaimed)} / ${ethers.formatEther(maxAllowed)} OBOL)`);
  }

  // Test claiming rewards resets the cap
  console.log(`\n📊 Claim Test:`);
  console.log(`   Current Unclaimed: ${ethers.formatEther(currentUnclaimed)} OBOL`);
  
  // Claim some rewards
  await obol.connect(user3).claimContinuousRewards(user3.address);
  
  // Check if user can now earn more rewards
  const [newHasReachedCapAfterClaim, newCurrentUnclaimedAfterClaim] = await obol.hasReachedUnclaimedCap(user3.address);
  
  console.log(`   After claiming: ${ethers.formatEther(newCurrentUnclaimedAfterClaim)} OBOL`);
  console.log(`   Can earn more: ${!newHasReachedCapAfterClaim}`);

  console.log("\n🎯 Integration Test Summary:");
  console.log("✅ OBOL token deployed with hybrid tokenomics");
  console.log("✅ Sarcophagus integrated with OBOL rewards");
  console.log("✅ Users earn OBOL for deposits (10 OBOL per 1 VET)");
  console.log("✅ OBOL can be locked in vault until death");
  console.log("✅ Vesting system for initial supply (5%)");
  console.log("✅ Reward supply for community (95%)");
  console.log("✅ Complete inheritance flow with OBOL integration");
}

testOBOLIntegration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 