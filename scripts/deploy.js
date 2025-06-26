const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying Sarcophagus Protocol contracts with the account:', deployer.address);

    // Deploy MockB3TR for testing
    const MockB3TR = await ethers.getContractFactory('MockB3TR');
    const mockB3TR = await MockB3TR.deploy();
    await mockB3TR.deployed();
    console.log('MockB3TR deployed to:', mockB3TR.address);

    // Deploy MockVTHOManager for testing
    const MockVTHOManager = await ethers.getContractFactory('MockVTHOManager');
    const mockVTHOManager = await MockVTHOManager.deploy();
    await mockVTHOManager.deployed();
    console.log('MockVTHOManager deployed to:', mockVTHOManager.address);

    // Deploy DeathVerifier
    const DeathVerifier = await ethers.getContractFactory('DeathVerifier');
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.deployed();
    console.log('DeathVerifier deployed to:', deathVerifier.address);

    // Deploy OBOL token
    const OBOL = await ethers.getContractFactory('OBOL');
    const obol = await OBOL.deploy();
    await obol.deployed();
    console.log('OBOL deployed to:', obol.address);

    // Deploy B3TRRewards
    const B3TRRewards = await ethers.getContractFactory('B3TRRewards');
    const b3trRewards = await B3TRRewards.deploy(mockB3TR.address);
    await b3trRewards.deployed();
    console.log('B3TRRewards deployed to:', b3trRewards.address);

    // Deploy MultiSigWallet
    const MultiSigWallet = await ethers.getContractFactory('MultiSigWallet');
    const multiSigWallet = await MultiSigWallet.deploy([
        deployer.address,
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
    ], 2); // 2 out of 3 signatures required
    await multiSigWallet.deployed();
    console.log('MultiSigWallet deployed to:', multiSigWallet.address);

    // Deploy Sarcophagus (main protocol contract)
    const Sarcophagus = await ethers.getContractFactory('Sarcophagus');
    const sarcophagus = await Sarcophagus.deploy(
        mockVTHOManager.address, // VTHO token address
        mockB3TR.address,        // B3TR token address
        obol.address,            // OBOL token address
        deathVerifier.address,   // Death verifier address
        obol.address             // OBOL contract address
    );
    await sarcophagus.deployed();
    console.log('Sarcophagus deployed to:', sarcophagus.address);

    // Grant roles to Sarcophagus contract
    await obol.grantRole(await obol.VAULT_ROLE(), sarcophagus.address);
    await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), deployer.address);

    // Create .env file for frontend
    const envContent = `NEXT_PUBLIC_SARCOPHAGUS_ADDRESS="${sarcophagus.address}"
NEXT_PUBLIC_OBOL_ADDRESS="${obol.address}"
NEXT_PUBLIC_B3TR_REWARDS_ADDRESS="${b3trRewards.address}"
NEXT_PUBLIC_DEATH_VERIFIER_ADDRESS="${deathVerifier.address}"
NEXT_PUBLIC_MULTISIG_WALLET_ADDRESS="${multiSigWallet.address}"`;

    fs.writeFileSync(
        path.join(__dirname, '../frontend/.env.local'),
        envContent
    );

    // Create deployment info file
    const deploymentInfo = {
        network: 'localhost',
        timestamp: new Date().toISOString(),
        contracts: {
            Sarcophagus: sarcophagus.address,
            OBOL: obol.address,
            B3TRRewards: b3trRewards.address,
            DeathVerifier: deathVerifier.address,
            MultiSigWallet: multiSigWallet.address,
            MockB3TR: mockB3TR.address,
            MockVTHOManager: mockVTHOManager.address
        }
    };

    fs.writeFileSync(
        path.join(__dirname, '../deployments.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('Deployment info saved to deployments.json');
    console.log('Frontend environment variables saved to frontend/.env.local');
    console.log('\n=== Sarcophagus Protocol Deployment Complete ===');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
