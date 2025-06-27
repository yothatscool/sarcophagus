const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying Sarcophagus Protocol contracts with the account:', deployer.address);

    // Deploy MockB3TR for testing
    const MockB3TR = await ethers.getContractFactory('MockB3TR');
    const mockB3TR = await MockB3TR.deploy();
    await mockB3TR.waitForDeployment();
    console.log('MockB3TR deployed to:', await mockB3TR.getAddress());

    // Deploy MockVTHOManager for testing
    const MockVTHOManager = await ethers.getContractFactory('MockVTHOManager');
    const mockVTHOManager = await MockVTHOManager.deploy();
    await mockVTHOManager.waitForDeployment();
    console.log('MockVTHOManager deployed to:', await mockVTHOManager.getAddress());

    // Deploy MockGLO for testing
    const MockGLO = await ethers.getContractFactory('MockGLO');
    const mockGLO = await MockGLO.deploy();
    await mockGLO.waitForDeployment();
    console.log('MockGLO deployed to:', await mockGLO.getAddress());

    // Deploy DeathVerifier
    const DeathVerifier = await ethers.getContractFactory('DeathVerifier');
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();
    console.log('DeathVerifier deployed to:', await deathVerifier.getAddress());

    // Deploy OBOL token
    const OBOL = await ethers.getContractFactory('OBOL');
    const obol = await OBOL.deploy();
    await obol.waitForDeployment();
    console.log('OBOL deployed to:', await obol.getAddress());

    // Deploy MultiSigWallet
    const MultiSigWallet = await ethers.getContractFactory('MultiSigWallet');
    const multiSigWallet = await MultiSigWallet.deploy([
        deployer.address,
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
    ], [1, 1, 1], 2); // 3 signers with weight 1 each, 2 out of 3 required
    await multiSigWallet.waitForDeployment();
    console.log('MultiSigWallet deployed to:', await multiSigWallet.getAddress());

    // Deploy Sarcophagus (main protocol contract)
    const Sarcophagus = await ethers.getContractFactory('Sarcophagus');
    const sarcophagus = await Sarcophagus.deploy(
        await mockVTHOManager.getAddress(), // VTHO token address
        await mockB3TR.getAddress(),        // B3TR token address
        await obol.getAddress(),            // OBOL token address
        await mockGLO.getAddress(),         // GLO token address
        await deathVerifier.getAddress(),   // Death verifier address
        await obol.getAddress(),            // OBOL contract address (again)
        deployer.address                    // Fee collector
    );
    await sarcophagus.waitForDeployment();
    console.log('Sarcophagus deployed to:', await sarcophagus.getAddress());

    // Deploy B3TRRewards (after Sarcophagus)
    const B3TRRewards = await ethers.getContractFactory('B3TRRewards');
    // Use 8000 as the rate adjustment threshold (example: 80%)
    const b3trRewards = await B3TRRewards.deploy(
        await mockB3TR.getAddress(),
        await sarcophagus.getAddress(),
        8000
    );
    await b3trRewards.waitForDeployment();
    console.log('B3TRRewards deployed to:', await b3trRewards.getAddress());

    // Grant roles to Sarcophagus contract
    await obol.grantRole(await obol.VAULT_ROLE(), await sarcophagus.getAddress());
    await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), deployer.address);

    // Create .env file for frontend
    const envContent = `NEXT_PUBLIC_SARCOPHAGUS_ADDRESS="${await sarcophagus.getAddress()}"
NEXT_PUBLIC_OBOL_ADDRESS="${await obol.getAddress()}"
NEXT_PUBLIC_B3TR_REWARDS_ADDRESS="${await b3trRewards.getAddress()}"
NEXT_PUBLIC_DEATH_VERIFIER_ADDRESS="${await deathVerifier.getAddress()}"
NEXT_PUBLIC_MULTISIG_WALLET_ADDRESS="${await multiSigWallet.getAddress()}"`;

    fs.writeFileSync(
        path.join(__dirname, '../frontend/.env.local'),
        envContent
    );

    // Create deployment info file
    const deploymentInfo = {
        network: 'hardhat',
        timestamp: new Date().toISOString(),
        contracts: {
            Sarcophagus: await sarcophagus.getAddress(),
            OBOL: await obol.getAddress(),
            B3TRRewards: await b3trRewards.getAddress(),
            DeathVerifier: await deathVerifier.getAddress(),
            MultiSigWallet: await multiSigWallet.getAddress(),
            MockB3TR: await mockB3TR.getAddress(),
            MockVTHOManager: await mockVTHOManager.getAddress(),
            MockGLO: await mockGLO.getAddress()
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
