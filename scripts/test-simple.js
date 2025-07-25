const { ethers } = require("hardhat");
require("dotenv").config();

const deploymentData = require("../deployment-mnemonic.json");

async function main() {
  console.log("Testing Core Sarcophagus Protocol Flow");

  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);

  const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
  const sarcophagus = Sarcophagus.attach(deploymentData.contracts.Sarcophagus);

  const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
  const deathVerifier = DeathVerifier.attach(deploymentData.contracts.DeathVerifier);

  // Test 1: User Verification
  console.log("\n1. User Verification Status");
  const userVerification = await sarcophagus.verifications(deployer.address);
  console.log("Is verified:", userVerification.isVerified);
  console.log("Age:", userVerification.age.toString());

  // Test 2: Try to verify user
  console.log("\n2. Attempting User Verification");
  try {
    const verifyTx = await deathVerifier.verifyUser(
      deployer.address,
      30,
      85,
      "ipfs://QmTestHash"
    );
    console.log("Verification tx:", verifyTx.hash);
    await verifyTx.wait();
    console.log("User verified successfully!");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }

  // Test 3: Check verification again
  console.log("\n3. Updated Verification Status");
  const updatedVerification = await sarcophagus.verifications(deployer.address);
  console.log("Is verified:", updatedVerification.isVerified);

  // Test 4: Try to create sarcophagus if verified
  if (updatedVerification.isVerified) {
    console.log("\n4. Creating Sarcophagus");
    try {
      const beneficiary = ethers.Wallet.createRandom().address;
      const createTx = await sarcophagus.createSarcophagus(
        [beneficiary],
        [10000],
        [ethers.ZeroAddress],
        [false],
        [25],
        [ethers.ZeroAddress],
        [0],
        { value: ethers.parseEther("100") }
      );
      console.log("Creation tx:", createTx.hash);
      await createTx.wait();
      console.log("Sarcophagus created!");
    } catch (error) {
      console.log("Creation failed:", error.message);
    }
  }

  // Test 5: Protocol stats
  console.log("\n5. Protocol Statistics");
  const totalFees = await sarcophagus.totalInheritanceFeesCollected();
  const circuitBreaker = await sarcophagus.circuitBreakerActive();
  console.log("Total fees:", ethers.formatEther(totalFees), "VET");
  console.log("Circuit breaker:", circuitBreaker);

  console.log("\nTest completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch(console.error);
