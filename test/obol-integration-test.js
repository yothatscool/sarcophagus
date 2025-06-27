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
  
  const MockGLO = await ethers.getContractFactory("MockGLO");
  const mockGLO = await MockGLO.deploy();
  await mockGLO.waitForDeployment();
  
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
    await mockGLO.getAddress(),
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

  // Test OBOL balance after deposit
  const obolBalance = await obol.balanceOf(user1.address);
  console.log(`   OBOL Balance: ${ethers.formatEther(obolBalance)} OBOL`);

  // Test reward claiming
  console.log("\n🎁 Testing Reward Claiming:");
  
  // Check pending rewards
  const pendingRewards = await obol.getPendingRewards(user1.address);
  console.log(`   Pending Rewards: ${ethers.formatEther(pendingRewards)} OBOL`);

  // Claim rewards
  await obol.connect(user1).claimContinuousRewards(user1.address);
  console.log(`   ✅ Rewards claimed`);

  // Check final balance
  const finalBalance = await obol.balanceOf(user1.address);
  console.log(`   Final OBOL Balance: ${ethers.formatEther(finalBalance)} OBOL`);

  console.log("\n✅ OBOL Integration Test Completed Successfully!");
}

// Run the test
testOBOLIntegration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });