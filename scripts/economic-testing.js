const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  console.log("💰 Starting Economic Testing...\n");

  // Get signers
  const [deployer, user1, user2, user3, oracle] = await ethers.getSigners();
  
  console.log("👥 Test Accounts:");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`User1: ${user1.address}`);
  console.log(`User2: ${user2.address}`);
  console.log(`User3: ${user3.address}`);
  console.log(`Oracle: ${oracle.address}\n`);

  // Deploy contracts
  console.log("🏗️  Deploying contracts for economic testing...");
  
  const MockVTHO = await ethers.getContractFactory("MockVTHO");
  const mockVTHO = await MockVTHO.deploy();
  
  const MockB3TR = await ethers.getContractFactory("MockB3TR");
  const mockB3TR = await MockB3TR.deploy();
  
  const OBOL = await ethers.getContractFactory("OBOL");
  const obol = await OBOL.deploy();
  
  const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
  const deathVerifier = await DeathVerifier.deploy();
  
  const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
  const sarcophagus = await Sarcophagus.deploy(
    await obol.getAddress(),
    await deathVerifier.getAddress(),
    await mockVTHO.getAddress(),
    await mockB3TR.getAddress()
  );

  console.log("✅ Contracts deployed\n");

  // Economic analysis functions
  const analyzeTokenomics = async () => {
    console.log("📊 Tokenomics Analysis:");
    
    const totalSupply = await obol.totalSupply();
    const initialSupply = await obol.initialSupply();
    const rewardSupply = await obol.rewardSupply();
    
    console.log(`Total Supply: ${ethers.formatEther(totalSupply)} OBOL`);
    console.log(`Initial Supply: ${ethers.formatEther(initialSupply)} OBOL`);
    console.log(`Reward Supply: ${ethers.formatEther(rewardSupply)} OBOL`);
    console.log(`Reward Percentage: ${(parseFloat(ethers.formatEther(rewardSupply)) / parseFloat(ethers.formatEther(totalSupply)) * 100).toFixed(2)}%`);
    console.log("");
  };

  const testRewardDistribution = async () => {
    console.log("🧪 Testing Reward Distribution Scenarios:");
    
    // Scenario 1: Single user with small deposit
    console.log("Scenario 1: Small Deposit (10 VET)");
    await deathVerifier.connect(oracle).verifyUser(user1.address, 30, "ipfs://verification");
    await sarcophagus.connect(user1).createSarcophagus([user2.address], [100], [false], [25]);
    
    const smallDeposit = ethers.parseEther("10");
    await sarcophagus.connect(user1).depositTokens(smallDeposit, 0, 0);
    
    const smallReward = await obol.balanceOf(user1.address);
    console.log(`Reward for 10 VET: ${ethers.formatEther(smallReward)} OBOL`);
    console.log(`Reward Rate: ${(parseFloat(ethers.formatEther(smallReward)) / 10).toFixed(4)} OBOL per VET`);
    console.log("");

    // Scenario 2: Single user with large deposit
    console.log("Scenario 2: Large Deposit (1000 VET)");
    await deathVerifier.connect(oracle).verifyUser(user2.address, 35, "ipfs://verification");
    await sarcophagus.connect(user2).createSarcophagus([user3.address], [100], [false], [30]);
    
    const largeDeposit = ethers.parseEther("1000");
    await sarcophagus.connect(user2).depositTokens(largeDeposit, 0, 0);
    
    const largeReward = await obol.balanceOf(user2.address);
    console.log(`Reward for 1000 VET: ${ethers.formatEther(largeReward)} OBOL`);
    console.log(`Reward Rate: ${(parseFloat(ethers.formatEther(largeReward)) / 1000).toFixed(4)} OBOL per VET`);
    console.log("");

    // Scenario 3: Multiple token types
    console.log("Scenario 3: Mixed Token Deposit");
    await deathVerifier.connect(oracle).verifyUser(user3.address, 40, "ipfs://verification");
    await sarcophagus.connect(user3).createSarcophagus([deployer.address], [100], [false], [35]);
    
    const mixedDeposit = await sarcophagus.connect(user3).depositTokens(
      ethers.parseEther("100"),
      ethers.parseEther("1000"),
      ethers.parseEther("500")
    );
    
    const mixedReward = await obol.balanceOf(user3.address);
    console.log(`Reward for mixed deposit: ${ethers.formatEther(mixedReward)} OBOL`);
    console.log("");
  };

  const testVestingSchedule = async () => {
    console.log("📅 Testing Vesting Schedule:");
    
    // Lock OBOL tokens
    await obol.mintVaultReward(user1.address, ethers.parseEther("1000"));
    await obol.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("100"));
    await sarcophagus.connect(user1).lockObolTokens(ethers.parseEther("100"));
    
    const lockedAmount = ethers.parseEther("100");
    const vestingPeriod = 365 * 24 * 60 * 60; // 1 year in seconds
    
    // Test vesting at different time points
    const timePoints = [0, 0.25, 0.5, 0.75, 1.0]; // 0%, 25%, 50%, 75%, 100%
    
    for (const timePoint of timePoints) {
      const timeToAdvance = vestingPeriod * timePoint;
      if (timeToAdvance > 0) {
        await time.increase(timeToAdvance);
      }
      
      const vestedAmount = await sarcophagus.getVestedAmount(user1.address);
      const percentage = (parseFloat(ethers.formatEther(vestedAmount)) / parseFloat(ethers.formatEther(lockedAmount)) * 100).toFixed(2);
      
      console.log(`After ${(timePoint * 100).toFixed(0)}% of vesting period: ${percentage}% vested`);
    }
    console.log("");
  };

  const testInflationControl = async () => {
    console.log("📈 Testing Inflation Control:");
    
    const initialTotalSupply = await obol.totalSupply();
    console.log(`Initial Total Supply: ${ethers.formatEther(initialTotalSupply)} OBOL`);
    
    // Simulate high activity period
    const highActivityUsers = 100;
    const averageDeposit = ethers.parseEther("50");
    
    let totalRewardsMinted = ethers.parseBigInt("0");
    
    for (let i = 0; i < 10; i++) { // Test with 10 users
      const user = await ethers.getSigner(i + 5); // Get additional signers
      
      await deathVerifier.connect(oracle).verifyUser(user.address, 25 + i, `ipfs://verification-${i}`);
      await sarcophagus.connect(user).createSarcophagus([deployer.address], [100], [false], [25]);
      await sarcophagus.connect(user).depositTokens(averageDeposit, 0, 0);
      
      const userReward = await obol.balanceOf(user.address);
      totalRewardsMinted += userReward;
    }
    
    const finalTotalSupply = await obol.totalSupply();
    const inflationRate = (parseFloat(ethers.formatEther(totalRewardsMinted)) / parseFloat(ethers.formatEther(initialTotalSupply)) * 100).toFixed(4);
    
    console.log(`Total Rewards Minted: ${ethers.formatEther(totalRewardsMinted)} OBOL`);
    console.log(`Final Total Supply: ${ethers.formatEther(finalTotalSupply)} OBOL`);
    console.log(`Inflation Rate: ${inflationRate}%`);
    console.log("");
  };

  const testEconomicScenarios = async () => {
    console.log("🌍 Testing Economic Scenarios:");
    
    // Scenario 1: High Activity Period
    console.log("Scenario 1: High Activity Period");
    const highActivityStart = Date.now();
    
    for (let i = 0; i < 5; i++) {
      const user = await ethers.getSigner(i + 15);
      await deathVerifier.connect(oracle).verifyUser(user.address, 30 + i, `ipfs://high-activity-${i}`);
      await sarcophagus.connect(user).createSarcophagus([deployer.address], [100], [false], [25]);
      await sarcophagus.connect(user).depositTokens(ethers.parseEther("100"), 0, 0);
    }
    
    const highActivityDuration = Date.now() - highActivityStart;
    console.log(`High activity period: ${highActivityDuration}ms for 5 users`);
    console.log("");

    // Scenario 2: Low Activity Period
    console.log("Scenario 2: Low Activity Period");
    await time.increase(7 * 24 * 60 * 60); // Advance 1 week
    
    const lowActivityStart = Date.now();
    await deathVerifier.connect(oracle).verifyUser(deployer.address, 45, "ipfs://low-activity");
    await sarcophagus.connect(deployer).createSarcophagus([user1.address], [100], [false], [40]);
    await sarcophagus.connect(deployer).depositTokens(ethers.parseEther("25"), 0, 0);
    
    const lowActivityDuration = Date.now() - lowActivityStart;
    console.log(`Low activity period: ${lowActivityDuration}ms for 1 user`);
    console.log("");

    // Scenario 3: Market Volatility (simulated)
    console.log("Scenario 3: Market Volatility Simulation");
    const volatilityScenarios = [
      { name: "Bull Market", multiplier: 2.0 },
      { name: "Bear Market", multiplier: 0.5 },
      { name: "Normal Market", multiplier: 1.0 }
    ];
    
    for (const scenario of volatilityScenarios) {
      console.log(`${scenario.name}:`);
      const simulatedReward = ethers.parseEther("100") * BigInt(Math.floor(scenario.multiplier * 100)) / BigInt(100);
      console.log(`  Simulated reward: ${ethers.formatEther(simulatedReward)} OBOL`);
    }
    console.log("");
  };

  // Run all economic tests
  await analyzeTokenomics();
  await testRewardDistribution();
  await testVestingSchedule();
  await testInflationControl();
  await testEconomicScenarios();

  // Economic health assessment
  console.log("🏥 Economic Health Assessment:");
  
  const totalSupply = await obol.totalSupply();
  const totalRewardsMinted = await obol.balanceOf(sarcophagus.getAddress());
  const inflationRate = (parseFloat(ethers.formatEther(totalRewardsMinted)) / parseFloat(ethers.formatEther(totalSupply)) * 100).toFixed(4);
  
  console.log(`Total Supply: ${ethers.formatEther(totalSupply)} OBOL`);
  console.log(`Rewards Minted: ${ethers.formatEther(totalRewardsMinted)} OBOL`);
  console.log(`Inflation Rate: ${inflationRate}%`);
  
  if (parseFloat(inflationRate) < 5) {
    console.log("✅ Inflation rate is sustainable (< 5%)");
  } else {
    console.log("⚠️  Inflation rate may be too high");
  }
  
  console.log("✅ Economic testing complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 