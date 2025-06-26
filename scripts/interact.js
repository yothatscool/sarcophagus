const { ethers } = require('hardhat');

async function main() {
    console.log('=== Sarcophagus Protocol - Local Testing ===\n');

    // Get signers
    const [deployer, user1, user2, oracle] = await ethers.getSigners();
    console.log('Deployer:', deployer.address);
    console.log('User 1:', user1.address);
    console.log('User 2:', user2.address);
    console.log('Oracle:', oracle.address);

    // Get deployed contracts
    const Sarcophagus = await ethers.getContractFactory('Sarcophagus');
    const sarcophagus = await Sarcophagus.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3');

    const OBOL = await ethers.getContractFactory('OBOL');
    const obol = await OBOL.attach('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');

    const DeathVerifier = await ethers.getContractFactory('DeathVerifier');
    const deathVerifier = await DeathVerifier.attach('0xDc64a140Aa3E981100a9becA4E685f962fC0B8C9');

    console.log('\n=== Contract Addresses ===');
    console.log('Sarcophagus:', sarcophagus.address);
    console.log('OBOL:', obol.address);
    console.log('DeathVerifier:', deathVerifier.address);

    // Test user verification
    console.log('\n=== Testing User Verification ===');
    await deathVerifier.connect(oracle).verifyUser(
        user1.address,
        30, // age
        'QmTestHash123' // verification hash
    );
    console.log('✅ User verified:', user1.address);

    // Test sarcophagus creation
    console.log('\n=== Testing Sarcophagus Creation ===');
    const beneficiaries = [user2.address];
    const percentages = [10000]; // 100% in basis points
    await sarcophagus.connect(user1).createSarcophagus(beneficiaries, percentages);
    console.log('✅ Sarcophagus created for:', user1.address);

    // Test token deposit
    console.log('\n=== Testing Token Deposit ===');
    const depositAmount = ethers.utils.parseEther('100'); // 100 VET
    await sarcophagus.connect(user1).depositTokens(
        0, // VTHO amount
        0, // B3TR amount
        { value: depositAmount }
    );
    console.log('✅ Tokens deposited:', ethers.utils.formatEther(depositAmount), 'VET');

    // Test OBOL rewards
    console.log('\n=== Testing OBOL Rewards ===');
    const userStake = await obol.getUserStake(user1.address);
    console.log('User stake info:', {
        lockedValue: ethers.utils.formatEther(userStake.lockedValue),
        totalEarned: ethers.utils.formatEther(userStake.totalEarned),
        pendingRewards: ethers.utils.formatEther(userStake.pendingRewards)
    });

    // Test death verification
    console.log('\n=== Testing Death Verification ===');
    await deathVerifier.connect(oracle).verifyDeath(
        user1.address,
        Math.floor(Date.now() / 1000), // current timestamp
        85, // age at death
        80, // life expectancy
        'QmDeathCertificate123' // proof hash
    );
    console.log('✅ Death verified for:', user1.address);

    // Test inheritance claim
    console.log('\n=== Testing Inheritance Claim ===');
    const sarcophagusData = await sarcophagus.getSarcophagus(user1.address);
    console.log('Sarcophagus data:', {
        vetAmount: ethers.utils.formatEther(sarcophagusData.vetAmount),
        isDeceased: sarcophagusData.isDeceased,
        deathTimestamp: sarcophagusData.deathTimestamp
    });

    if (sarcophagusData.isDeceased) {
        await sarcophagus.connect(user2).claimInheritance(user1.address);
        console.log('✅ Inheritance claimed by:', user2.address);
    }

    console.log('\n=== Testing Complete ===');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 