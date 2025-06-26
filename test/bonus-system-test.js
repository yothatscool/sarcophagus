const { ethers } = require("hardhat");

async function testBonusSystem() {
  console.log("🧪 Testing Updated Bonus System...\n");

  // Deploy mock contracts
  const [deployer] = await ethers.getSigners();
  
  // Deploy mock tokens
  const MockVTHO = await ethers.getContractFactory("MockVTHO");
  const mockVTHO = await MockVTHO.deploy();
  await mockVTHO.waitForDeployment();
  
  const MockB3TR = await ethers.getContractFactory("MockB3TR");
  const mockB3TR = await MockB3TR.deploy();
  await mockB3TR.waitForDeployment();
  
  // Deploy DeathVerifier
  const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
  const deathVerifier = await DeathVerifier.deploy();
  await deathVerifier.waitForDeployment();
  
  // Deploy OBOL token
  const OBOL = await ethers.getContractFactory("OBOL");
  const obol = await OBOL.deploy();
  await obol.waitForDeployment();
  
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
  console.log(`   DeathVerifier: ${await deathVerifier.getAddress()}`);
  console.log(`   Sarcophagus: ${await sarcophagus.getAddress()}\n`);

  // Test cases
  const testCases = [
    { age: 65, lifeExpectancy: 80, expectedType: "Carbon Offset" },
    { age: 80, lifeExpectancy: 80, expectedType: "Legacy" },
    { age: 85, lifeExpectancy: 80, expectedType: "Legacy" },
    { age: 90, lifeExpectancy: 80, expectedType: "Legacy" },
    { age: 50, lifeExpectancy: 80, expectedType: "Carbon Offset" },
  ];

  console.log("📊 Testing Bonus Calculations:");
  console.log("=" .repeat(50));

  for (const testCase of testCases) {
    try {
      const bonus = await deathVerifier.calculateBonus(
        testCase.age,
        testCase.lifeExpectancy,
        ethers.parseEther("1000"), // 1000 VET deposits
        5 // 5 years in system
      );

      const bonusInEther = ethers.formatEther(bonus);
      const ageDiff = Math.abs(testCase.age - testCase.lifeExpectancy);
      
      console.log(`Age: ${testCase.age}, Life Expectancy: ${testCase.lifeExpectancy}`);
      console.log(`Expected: ${testCase.expectedType}`);
      console.log(`Age Difference: ${ageDiff} years`);
      console.log(`Bonus: ${bonusInEther} B3TR`);
      console.log(`Status: ${bonus > 0 ? "✅ PASS" : "❌ FAIL"}`);
      console.log("-".repeat(30));
    } catch (error) {
      console.log(`❌ Error testing age ${testCase.age}: ${error.message}`);
    }
  }

  console.log("\n🎯 Key Changes Made:");
  console.log("• Removed 5-year grace period around life expectancy");
  console.log("• Carbon Offset Bonus: Available to anyone who dies BEFORE life expectancy");
  console.log("• Legacy Bonus: Available to anyone who lives TO or BEYOND life expectancy");
  console.log("• Everyone gets a bonus - no more zero bonus cases!");
}

testBonusSystem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 