const { ethers } = require('hardhat');

async function main() {
  // Use the first signer (deployer/oracle)
  const [oracle] = await ethers.getSigners();

  // Use the deployed DeathVerifier address from deployments.json
  const deathVerifierAddress = process.env.DEATH_VERIFIER_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

  // Attach to the deployed contract
  const DeathVerifier = await ethers.getContractFactory('DeathVerifier');
  const deathVerifier = await DeathVerifier.attach(deathVerifierAddress);

  // Test address to mark as deceased
  const testUser = '0x1111111111111111111111111111111111111111';

  // Call markDeceased
  console.log(`Calling markDeceased(${testUser}) as oracle (${oracle.address})...`);
  const tx = await deathVerifier.connect(oracle).markDeceased(testUser);
  console.log('Transaction sent:', tx.hash);
  await tx.wait();
  console.log('DeceasedMarked event should be emitted.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 