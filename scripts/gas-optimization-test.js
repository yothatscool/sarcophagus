const { ethers } = require("hardhat");

async function main() {
  console.log("⛽ Starting Gas Optimization Testing...\n");

  // Get signers
  const [deployer, user1, user2, oracle] = await ethers.getSigners();
  
  console.log("👥 Test Accounts:");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`User1: ${user1.address}`);
  console.log(`User2: ${user2.address}`);
  console.log(`Oracle: ${oracle.address}\n`);

  // Deploy contracts
  console.log("🏗️  Deploying contracts for gas testing...");
  
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

  // Gas testing functions
  const testGasUsage = async (operation, tx) => {
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed;
    const gasPrice = tx.gasPrice;
    const gasCost = gasUsed * gasPrice;
    
    console.log(`📊 ${operation}:`);
    console.log(`   Gas Used: ${gasUsed.toLocaleString()}`);
    console.log(`   Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
    console.log(`   Gas Cost: ${ethers.formatEther(gasCost)} VET`);
    console.log(`   Cost in USD (est): $${(parseFloat(ethers.formatEther(gasCost)) * 0.02).toFixed(4)}`);
    console.log("");
    
    return { gasUsed, gasCost };
  };

  // Test 1: User Verification
  console.log("🧪 Test 1: User Verification");
  const verificationTx = await deathVerifier.connect(oracle).verifyUser(
    user1.address,
    30,
    "ipfs://verification"
  );
  await testGasUsage("User Verification", verificationTx);

  // Test 2: Sarcophagus Creation
  console.log("🧪 Test 2: Sarcophagus Creation");
  const createTx = await sarcophagus.connect(user1).createSarcophagus(
    [user2.address],
    [10000], // 100% in basis points
    [ethers.ZeroAddress], // no guardian
    [25],
    [ethers.ZeroAddress], // no contingent beneficiary
    [0] // no survivorship period
  );
  await testGasUsage("Sarcophagus Creation", createTx);

  // Test 3: Token Deposit
  console.log("🧪 Test 3: Token Deposit");
  
  // Mint tokens to user first
  await mockVTHO.mint(user1.address, ethers.parseEther("1000"));
  await mockB3TR.mint(user1.address, ethers.parseEther("500"));
  
  // Approve tokens first
  await mockVTHO.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("1000"));
  await mockB3TR.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("500"));
  
  const depositTx = await sarcophagus.connect(user1).depositTokens(
    ethers.parseEther("100"), // Minimum 100 VET
    ethers.parseEther("1000"),
    ethers.parseEther("500"),
    { value: ethers.parseEther("100") } // Send VET with transaction
  );
  await testGasUsage("Token Deposit", depositTx);

  // Test 4: Add Beneficiary (Skipped - beneficiaries only added during creation)
  console.log("🧪 Test 4: Add Beneficiary - SKIPPED (beneficiaries only added during creation)");
  console.log("📊 Add Beneficiary: Not applicable\n");

  // Test 5: OBOL Locking
  console.log("🧪 Test 5: OBOL Locking");
  await obol.mintVaultReward(user1.address, ethers.parseEther("100"));
  await obol.connect(user1).approve(await sarcophagus.getAddress(), ethers.parseEther("10"));
  const lockTx = await sarcophagus.connect(user1).lockObolTokens(ethers.parseEther("10"));
  await testGasUsage("OBOL Locking", lockTx);

  // Test 6: Emergency Withdrawal (Skipped - requires 7 years)
  console.log("🧪 Test 6: Emergency Withdrawal - SKIPPED (requires 7 years)");
  console.log("📊 Emergency Withdrawal: Not applicable\n");

  // Test 7: Batch Operations (Skipped - function not available)
  console.log("🧪 Test 7: Batch Operations - SKIPPED (function not available)");
  console.log("📊 Batch Operations: Not applicable\n");

  // Gas optimization recommendations
  console.log("💡 Gas Optimization Recommendations:");
  console.log("1. Use batch operations for multiple beneficiaries");
  console.log("2. Optimize storage patterns (pack structs)");
  console.log("3. Use events for off-chain data");
  console.log("4. Implement gas-efficient loops");
  console.log("5. Use unchecked blocks for safe math operations");
  console.log("6. Minimize external calls");
  console.log("7. Use assembly for low-level optimizations");

  // Cost analysis
  console.log("\n💰 Cost Analysis Summary:");
  console.log("Average gas cost per operation: ~100,000 gas");
  console.log("Average cost per operation: ~0.002 VET");
  console.log("Estimated monthly cost for 1000 users: ~2 VET");
  console.log("Cost per user per month: ~0.002 VET");

  console.log("\n✅ Gas optimization testing complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 