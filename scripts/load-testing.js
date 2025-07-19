const { ethers } = require("hardhat");

async function main() {
  console.log("⚡ Starting Load Testing...\n");

  // Get signers (simulate multiple users)
  const signers = await ethers.getSigners();
  const [deployer, oracle] = signers;
  const users = signers.slice(2, 12); // 10 test users
  
  console.log(`👥 Load Testing with ${users.length} concurrent users\n`);

  // Deploy contracts
  console.log("🏗️  Deploying contracts for load testing...");
  
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
    await mockVTHO.getAddress(),
    await mockB3TR.getAddress(),
    await obol.getAddress(),
    await mockVTHO.getAddress(), // GLO token (using VTHO as mock)
    await deathVerifier.getAddress(),
    await obol.getAddress(),
    deployer.address // fee collector
  );

  console.log("✅ Contracts deployed\n");

  // Add oracle account
  await deathVerifier.addOracle(oracle.address);
  
  // Grant VAULT_ROLE to Sarcophagus contract
  await obol.grantRole(await obol.VAULT_ROLE(), await sarcophagus.getAddress());
  
  console.log("✅ Oracle added and roles granted\n");

  // Performance tracking
  const performanceMetrics = {
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    totalGasUsed: 0,
    startTime: Date.now(),
    transactions: []
  };

  const trackTransaction = async (operation, txPromise, userIndex) => {
    try {
      const startTime = Date.now();
      const tx = await txPromise;
      const receipt = await tx.wait();
      const endTime = Date.now();
      
      const transactionData = {
        operation,
        userIndex,
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
        duration: endTime - startTime,
        success: true
      };
      
      performanceMetrics.transactions.push(transactionData);
      performanceMetrics.totalTransactions++;
      performanceMetrics.successfulTransactions++;
      performanceMetrics.totalGasUsed += receipt.gasUsed;
      
      return transactionData;
    } catch (error) {
      performanceMetrics.totalTransactions++;
      performanceMetrics.failedTransactions++;
      
      const transactionData = {
        operation,
        userIndex,
        gasUsed: 0,
        blockNumber: null,
        duration: 0,
        success: false,
        error: error.message
      };
      
      performanceMetrics.transactions.push(transactionData);
      return transactionData;
    }
  };

  // Test 1: Concurrent User Verification
  console.log("🧪 Test 1: Concurrent User Verification");
  const verificationPromises = users.map((user, index) => 
    trackTransaction(
      "User Verification",
      deathVerifier.connect(oracle).verifyUser(
        user.address,
        25 + index,
        `ipfs://verification-${index}`
      ),
      index
    )
  );
  
  const verificationResults = await Promise.all(verificationPromises);
  console.log(`✅ Completed ${verificationResults.length} user verifications\n`);

  // Test 2: Concurrent Sarcophagus Creation
  console.log("🧪 Test 2: Concurrent Sarcophagus Creation");
  const creationPromises = users.map((user, index) => 
    trackTransaction(
      "Sarcophagus Creation",
      sarcophagus.connect(user).createSarcophagus(
        [deployer.address],
        [100],
        [false],
        [25 + index]
      ),
      index
    )
  );
  
  const creationResults = await Promise.all(creationPromises);
  console.log(`✅ Completed ${creationResults.length} sarcophagus creations\n`);

  // Test 3: Concurrent Token Deposits
  console.log("🧪 Test 3: Concurrent Token Deposits");
  const depositPromises = users.map((user, index) => 
    trackTransaction(
      "Token Deposit",
      sarcophagus.connect(user).depositTokens(
        ethers.parseEther("1"),
        ethers.parseEther("10"),
        ethers.parseEther("5")
      ),
      index
    )
  );
  
  const depositResults = await Promise.all(depositPromises);
  console.log(`✅ Completed ${depositResults.length} token deposits\n`);

  // Test 4: Concurrent OBOL Operations
  console.log("🧪 Test 4: Concurrent OBOL Operations");
  const obolPromises = users.map(async (user, index) => {
    // Mint OBOL first
    await obol.mintVaultReward(user.address, ethers.parseEther("100"));
    await obol.connect(user).approve(await sarcophagus.getAddress(), ethers.parseEther("10"));
    
    return trackTransaction(
      "OBOL Locking",
      sarcophagus.connect(user).lockObolTokens(ethers.parseEther("10")),
      index
    );
  });
  
  const obolResults = await Promise.all(obolPromises);
  console.log(`✅ Completed ${obolResults.length} OBOL operations\n`);

  // Test 5: Stress Test - Multiple Operations Per User
  console.log("🧪 Test 5: Stress Test - Multiple Operations Per User");
  const stressPromises = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    // Test multiple token deposits instead of adding beneficiaries
    for (let j = 0; j < 3; j++) {
      stressPromises.push(
        trackTransaction(
          "Additional Token Deposit",
          sarcophagus.connect(user).depositTokens(
            ethers.parseEther("10"),
            ethers.parseEther("100"),
            ethers.parseEther("50"),
            { value: ethers.parseEther("10") }
          ),
          i
        )
      );
    }
  }
  
  const stressResults = await Promise.all(stressPromises);
  console.log(`✅ Completed ${stressResults.length} stress test operations\n`);

  // Calculate performance metrics
  const endTime = Date.now();
  const totalDuration = endTime - performanceMetrics.startTime;
  const tps = performanceMetrics.totalTransactions / (totalDuration / 1000);
  const successRate = (performanceMetrics.successfulTransactions / performanceMetrics.totalTransactions) * 100;
  const avgGasUsed = performanceMetrics.totalGasUsed / performanceMetrics.successfulTransactions;

  // Performance report
  console.log("📊 Load Testing Performance Report");
  console.log("==================================");
  console.log(`Total Transactions: ${performanceMetrics.totalTransactions}`);
  console.log(`Successful Transactions: ${performanceMetrics.successfulTransactions}`);
  console.log(`Failed Transactions: ${performanceMetrics.failedTransactions}`);
  console.log(`Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)} seconds`);
  console.log(`Transactions Per Second: ${tps.toFixed(2)} TPS`);
  console.log(`Average Gas Used: ${avgGasUsed.toLocaleString()}`);
  console.log(`Total Gas Used: ${performanceMetrics.totalGasUsed.toLocaleString()}`);

  // Performance analysis
  console.log("\n📈 Performance Analysis:");
  
  if (tps >= 100) {
    console.log("✅ Transaction throughput meets target (100+ TPS)");
  } else {
    console.log("⚠️  Transaction throughput below target");
  }
  
  if (successRate >= 95) {
    console.log("✅ Success rate meets target (95%+)");
  } else {
    console.log("⚠️  Success rate below target");
  }
  
  if (avgGasUsed < 200000) {
    console.log("✅ Gas efficiency meets target (< 200k gas)");
  } else {
    console.log("⚠️  Gas usage above target");
  }

  // Bottleneck analysis
  console.log("\n🔍 Bottleneck Analysis:");
  const operationStats = {};
  performanceMetrics.transactions.forEach(tx => {
    if (!operationStats[tx.operation]) {
      operationStats[tx.operation] = { count: 0, totalGas: 0, totalDuration: 0 };
    }
    operationStats[tx.operation].count++;
    operationStats[tx.operation].totalGas += tx.gasUsed;
    operationStats[tx.operation].totalDuration += tx.duration;
  });

  Object.entries(operationStats).forEach(([operation, stats]) => {
    const avgGas = stats.totalGas / stats.count;
    const avgDuration = stats.totalDuration / stats.count;
    console.log(`${operation}:`);
    console.log(`  Count: ${stats.count}`);
    console.log(`  Avg Gas: ${avgGas.toLocaleString()}`);
    console.log(`  Avg Duration: ${avgDuration.toFixed(2)}ms`);
  });

  // Recommendations
  console.log("\n💡 Load Testing Recommendations:");
  console.log("1. Monitor gas prices during high activity");
  console.log("2. Implement transaction queuing for peak loads");
  console.log("3. Consider batch operations for efficiency");
  console.log("4. Optimize contract storage patterns");
  console.log("5. Implement retry mechanisms for failed transactions");

  console.log("\n✅ Load testing complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 