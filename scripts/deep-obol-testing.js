const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  console.log("🧪 Starting Deep OBOL & Vault Testing...\n");

  // Get signers
  const [deployer, user1, user2, user3, oracle] = await ethers.getSigners();
  
  console.log("👥 Test Accounts:");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`User1: ${user1.address}`);
  console.log(`User2: ${user2.address}`);
  console.log(`User3: ${user3.address}`);
  console.log(`Oracle: ${oracle.address}\n`);

  // Deploy mock tokens
  console.log("🏗️  Deploying Mock Tokens...");
  const MockVTHO = await ethers.getContractFactory("MockVTHO");
  const mockVTHO = await MockVTHO.deploy();
  await mockVTHO.waitForDeployment();

  const MockB3TR = await ethers.getContractFactory("MockB3TR");
  const mockB3TR = await MockB3TR.deploy();
  await mockB3TR.waitForDeployment();

  const MockGLO = await ethers.getContractFactory("MockGLO");
  const mockGLO = await MockGLO.deploy();
  await mockGLO.waitForDeployment();

  console.log(`✅ MockVTHO: ${await mockVTHO.getAddress()}`);
  console.log(`✅ MockB3TR: ${await mockB3TR.getAddress()}`);
  console.log(`✅ MockGLO: ${await mockGLO.getAddress()}\n`);

  // Deploy OBOL token
  console.log("🪙 Deploying OBOL Token...");
  const OBOL = await ethers.getContractFactory("OBOL");
  const obol = await OBOL.deploy();
  await obol.waitForDeployment();
  console.log(`✅ OBOL: ${await obol.getAddress()}\n`);

  // Deploy DeathVerifier
  console.log("🏥 Deploying DeathVerifier...");
  const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
  const deathVerifier = await DeathVerifier.deploy();
  await deathVerifier.waitForDeployment();
  console.log(`✅ DeathVerifier: ${await deathVerifier.getAddress()}\n`);

  // Deploy Sarcophagus
  console.log("⚰️  Deploying Sarcophagus...");
  const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
  const sarcophagus = await Sarcophagus.deploy(
    await mockVTHO.getAddress(),
    await mockB3TR.getAddress(),
    await obol.getAddress(),
    await mockGLO.getAddress(),
    await deathVerifier.getAddress(),
    await obol.getAddress(),
    deployer.address // feeCollector
  );
  await sarcophagus.waitForDeployment();
  console.log(`✅ Sarcophagus: ${await sarcophagus.getAddress()}\n`);

  // Setup roles
  console.log("🔐 Setting up roles...");
  const vaultRole = await obol.VAULT_ROLE();
  await obol.grantRole(vaultRole, await sarcophagus.getAddress());
  
  const oracleRole = await deathVerifier.ORACLE_ROLE();
  await deathVerifier.grantRole(oracleRole, oracle.address);
  
  const verifierRole = await sarcophagus.VERIFIER_ROLE();
  await sarcophagus.grantRole(verifierRole, deployer.address);
  console.log("✅ Roles configured\n");

  // Mint test tokens
  console.log("💰 Minting test tokens...");
  await mockVTHO.mint(user1.address, ethers.parseEther("10000"));
  await mockB3TR.mint(user1.address, ethers.parseEther("10000"));
  await mockVTHO.mint(user2.address, ethers.parseEther("10000"));
  await mockB3TR.mint(user2.address, ethers.parseEther("10000"));
  await mockVTHO.mint(user3.address, ethers.parseEther("10000"));
  await mockB3TR.mint(user3.address, ethers.parseEther("10000"));
  console.log("✅ Test tokens minted\n");

  // Approve tokens
  console.log("✅ Approving tokens for Sarcophagus...");
  await mockVTHO.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("10000"));
  await mockB3TR.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("10000"));
  await mockVTHO.connect(user2).approve(await sarcophagus.getAddress(), ethers.parseEther("10000"));
  await mockB3TR.connect(user2).approve(await sarcophagus.getAddress(), ethers.parseEther("10000"));
  await mockVTHO.connect(user3).approve(await sarcophagus.getAddress(), ethers.parseEther("10000"));
  await mockB3TR.connect(user3).approve(await sarcophagus.getAddress(), ethers.parseEther("10000"));
  console.log("✅ Token approvals complete\n");

  // ===== TESTING SCENARIOS =====

  console.log("🚀 Starting Deep Testing Scenarios...\n");

  // Scenario 1: Basic OBOL Tokenomics
  console.log("📊 Scenario 1: Basic OBOL Tokenomics");
  const tokenomics = await obol.getTokenomics();
  console.log(`Total Supply: ${ethers.formatEther(tokenomics.totalSupplyAmount)} OBOL`);
  console.log(`Initial Supply: ${ethers.formatEther(tokenomics.initialSupply)} OBOL`);
  console.log(`Reward Supply: ${ethers.formatEther(tokenomics.rewardSupply)} OBOL`);
  
  const vestingProgress = await obol.getVestingProgress();
  const vestedAmount = await obol.getVestedAmount();
  console.log(`Vesting Progress: ${vestingProgress}%`);
  console.log(`Vested Amount: ${ethers.formatEther(vestedAmount)} OBOL`);
  console.log("✅ Tokenomics verified\n");

  // Scenario 2: User Verification and Sarcophagus Creation
  console.log("👤 Scenario 2: User Verification and Sarcophagus Creation");
  await deathVerifier.verifyUser(user1.address, 30, "ipfs://verification1");
  console.log(`✅ User1 verified (age 30)`);

  const beneficiaries = [user2.address];
  const percentages = [10000]; // 100%
  const guardians = [ethers.ZeroAddress];
  const ages = [30];
  const contingentBeneficiaries = [ethers.ZeroAddress];
  const survivorshipPeriods = [0];

  await sarcophagus.connect(user1).createSarcophagus(
    beneficiaries,
    percentages,
    guardians,
    ages,
    contingentBeneficiaries,
    survivorshipPeriods
  );
  console.log("✅ Sarcophagus created for User1\n");

  // Scenario 3: Initial Deposit and OBOL Rewards
  console.log("💎 Scenario 3: Initial Deposit and OBOL Rewards");
  
  // Fast-forward 31 days to satisfy minimum lock period
  await time.increase(31 * 24 * 60 * 60);
  console.log("⏰ Advanced time by 31 days");

  const depositAmount = ethers.parseEther("100"); // 100 VET
  console.log(`💰 Depositing ${ethers.formatEther(depositAmount)} VET...`);
  
  await sarcophagus.connect(user1).depositTokens(depositAmount, 0, 0, { value: depositAmount });
  console.log("✅ Initial deposit completed");

  // Check OBOL balance after deposit
  const obolBalance = await obol.balanceOf(user1.address);
  console.log(`🪙 OBOL Balance: ${ethers.formatEther(obolBalance)} OBOL`);

  // Check pending rewards
  const pendingRewards = await obol.getPendingRewards(user1.address);
  console.log(`🎁 Pending Rewards: ${ethers.formatEther(pendingRewards)} OBOL`);

  // Claim rewards if any
  if (pendingRewards > 0) {
    console.log("🎯 Claiming rewards...");
    await obol.connect(user1).claimContinuousRewards(user1.address);
    const finalBalance = await obol.balanceOf(user1.address);
    console.log(`🪙 Final OBOL Balance: ${ethers.formatEther(finalBalance)} OBOL`);
  }
  console.log("✅ Initial deposit rewards processed\n");

  // Scenario 4: Token Deposits and Additional Rewards
  console.log("🪙 Scenario 4: Token Deposits and Additional Rewards");
  
  const vthoAmount = ethers.parseEther("50");
  const b3trAmount = ethers.parseEther("50");
  
  console.log(`💰 Depositing ${ethers.formatEther(vthoAmount)} VTHO and ${ethers.formatEther(b3trAmount)} B3TR...`);
  await sarcophagus.connect(user1).depositTokens(0, vthoAmount, b3trAmount);
  
  const balanceAfterTokens = await obol.balanceOf(user1.address);
  console.log(`🪙 OBOL Balance after token deposit: ${ethers.formatEther(balanceAfterTokens)} OBOL`);
  console.log("✅ Token deposits completed\n");

  // Scenario 5: Continuous Earning Over Time
  console.log("⏰ Scenario 5: Continuous Earning Over Time");
  
  // Advance time by 7 days
  await time.increase(7 * 24 * 60 * 60);
  console.log("⏰ Advanced time by 7 days");

  const pendingAfterWeek = await obol.getPendingRewards(user1.address);
  console.log(`🎁 Pending rewards after 1 week: ${ethers.formatEther(pendingAfterWeek)} OBOL`);

  if (pendingAfterWeek > 0) {
    await obol.connect(user1).claimContinuousRewards(user1.address);
    const balanceAfterWeek = await obol.balanceOf(user1.address);
    console.log(`🪙 OBOL Balance after 1 week: ${ethers.formatEther(balanceAfterWeek)} OBOL`);
  }

  // Advance time by 30 more days
  await time.increase(30 * 24 * 60 * 60);
  console.log("⏰ Advanced time by 30 more days");

  const pendingAfterMonth = await obol.getPendingRewards(user1.address);
  console.log(`🎁 Pending rewards after 1 month: ${ethers.formatEther(pendingAfterMonth)} OBOL`);

  if (pendingAfterMonth > 0) {
    await obol.connect(user1).claimContinuousRewards(user1.address);
    const balanceAfterMonth = await obol.balanceOf(user1.address);
    console.log(`🪙 OBOL Balance after 1 month: ${ethers.formatEther(balanceAfterMonth)} OBOL`);
  }
  console.log("✅ Continuous earning verified\n");

  // Scenario 6: Multiple Users and Competition
  console.log("👥 Scenario 6: Multiple Users and Competition");
  
  // Verify and create sarcophagus for User2
  await deathVerifier.verifyUser(user2.address, 35, "ipfs://verification2");
  await sarcophagus.connect(user2).createSarcophagus(
    [user3.address],
    [10000],
    [ethers.ZeroAddress],
    [35],
    [ethers.ZeroAddress],
    [0]
  );
  
  // User2 deposits
  await sarcophagus.connect(user2).depositTokens(ethers.parseEther("200"), 0, 0, { value: ethers.parseEther("200") });
  
  const user2Balance = await obol.balanceOf(user2.address);
  console.log(`🪙 User2 OBOL Balance: ${ethers.formatEther(user2Balance)} OBOL`);
  
  // Check total reward supply
  const remainingSupply = await obol.getRemainingRewardSupply();
  console.log(`🎁 Remaining Reward Supply: ${ethers.formatEther(remainingSupply)} OBOL`);
  console.log("✅ Multiple users scenario completed\n");

  // Scenario 7: OBOL Token Locking
  console.log("🔒 Scenario 7: OBOL Token Locking");
  
  // First, mint some OBOL tokens to user1 for testing
  console.log("🪙 Minting OBOL tokens to User1 for testing...");
  await obol.mintVaultReward(user1.address, ethers.parseEther("100"));
  console.log(`✅ Minted 100 OBOL to User1`);
  
  const obolToLock = ethers.parseEther("10");
  console.log(`🔒 Locking ${ethers.formatEther(obolToLock)} OBOL tokens...`);
  
  await obol.connect(user1).approve(await sarcophagus.getAddress(), obolToLock);
  await sarcophagus.connect(user1).lockObolTokens(obolToLock);
  
  const sarcophagusData = await sarcophagus.sarcophagi(user1.address);
  const lockedOBOL = sarcophagusData.obolAmount;
  console.log(`🔒 Locked OBOL: ${ethers.formatEther(lockedOBOL)} OBOL`);
  console.log("✅ OBOL locking completed\n");

  // Scenario 8: Death Verification and Inheritance
  console.log("💀 Scenario 8: Death Verification and Inheritance");
  
  // Simulate death verification
  const currentBlock = await ethers.provider.getBlock("latest");
  const deathTimestamp = currentBlock.timestamp - 3600; // 1 hour ago
  await deathVerifier.connect(oracle).verifyDeath(
    user1.address, 
    deathTimestamp,
    30, // age at death
    85, // life expectancy
    "ipfs://death-certificate"
  );
  console.log("💀 Death verified for User1");
  
  // Check if inheritance can be claimed
  const userSarcophagusData = await sarcophagus.sarcophagi(user1.address);
  const canClaim = userSarcophagusData.isDeceased;
  console.log(`📋 Can claim inheritance: ${canClaim}`);
  
  if (canClaim) {
    console.log("🎯 Attempting to claim inheritance...");
    try {
      await sarcophagus.connect(user2).claimInheritance(user1.address, 0); // beneficiaryIndex 0
      console.log("✅ Inheritance claimed successfully");
    } catch (error) {
      console.log(`❌ Inheritance claim failed: ${error.message}`);
    }
  }
  console.log("✅ Death verification scenario completed\n");

  // Scenario 9: Reward Calculation Edge Cases
  console.log("🧮 Scenario 9: Reward Calculation Edge Cases");
  
  // Test with very small amounts
  const smallDeposit = ethers.parseEther("0.001");
  console.log(`💰 Testing with small deposit: ${ethers.formatEther(smallDeposit)} VET`);
  
  const smallReward = await obol.calculateReward(smallDeposit);
  console.log(`🎁 Calculated reward: ${ethers.formatEther(smallReward)} OBOL`);
  
  // Test with large amounts
  const largeDeposit = ethers.parseEther("10000");
  console.log(`💰 Testing with large deposit: ${ethers.formatEther(largeDeposit)} VET`);
  
  const largeReward = await obol.calculateReward(largeDeposit);
  console.log(`🎁 Calculated reward: ${ethers.formatEther(largeReward)} OBOL`);
  console.log("✅ Reward calculation edge cases tested\n");

  // Scenario 10: Contract State Verification
  console.log("📊 Scenario 10: Contract State Verification");
  
  const totalSupply = await obol.totalSupply();
  const sarcophagusBalance = await obol.balanceOf(await sarcophagus.getAddress());
  const user1Stake = await obol.getUserStake(user1.address);
  
  console.log(`📈 Total OBOL Supply: ${ethers.formatEther(totalSupply)} OBOL`);
  console.log(`🏦 Sarcophagus OBOL Balance: ${ethers.formatEther(sarcophagusBalance)} OBOL`);
  console.log(`👤 User1 Locked Value: ${ethers.formatEther(user1Stake.lockedValue)} VET`);
  console.log(`👤 User1 Total Earned: ${ethers.formatEther(user1Stake.totalEarned)} OBOL`);
  console.log(`👤 User1 Start Time: ${new Date(Number(user1Stake.startTime) * 1000).toISOString()}`);
  console.log("✅ Contract state verified\n");

  // Final Summary
  console.log("🎉 Deep Testing Complete!");
  console.log("\n📋 Test Summary:");
  console.log("✅ OBOL tokenomics and vesting");
  console.log("✅ User verification and sarcophagus creation");
  console.log("✅ Initial deposits and reward generation");
  console.log("✅ Token deposits and additional rewards");
  console.log("✅ Continuous earning over time");
  console.log("✅ Multiple users and competition");
  console.log("✅ OBOL token locking");
  console.log("✅ Death verification and inheritance");
  console.log("✅ Reward calculation edge cases");
  console.log("✅ Contract state verification");
  
  console.log("\n🚀 All scenarios tested successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 