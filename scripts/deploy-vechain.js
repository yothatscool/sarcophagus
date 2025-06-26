const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying to VeChain with account:', deployer.address);

    // VeChain Token Addresses
    const VTHO_ADDRESS = "0x0000000000000000456E65726779"; // VTHO token on VeChain
    const B3TR_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual B3TR address when available

    console.log('Using VeChain token addresses:');
    console.log('VTHO:', VTHO_ADDRESS);
    console.log('B3TR:', B3TR_ADDRESS);

    // Deploy DeathVerifier
    console.log('\nDeploying DeathVerifier...');
    const DeathVerifier = await ethers.getContractFactory('DeathVerifier');
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();
    console.log('✅ DeathVerifier deployed to:', await deathVerifier.getAddress());

    // Deploy Sarcophagus
    console.log('\nDeploying Sarcophagus...');
    const Sarcophagus = await ethers.getContractFactory('Sarcophagus');
    const sarcophagus = await Sarcophagus.deploy(
        VTHO_ADDRESS,
        B3TR_ADDRESS,
        await deathVerifier.getAddress()
    );
    await sarcophagus.waitForDeployment();
    console.log('✅ Sarcophagus deployed to:', await sarcophagus.getAddress());

    // Grant roles
    console.log('\nSetting up roles...');
    await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), deployer.address);
    await sarcophagus.grantRole(await sarcophagus.VERIFIER_ROLE(), deployer.address);
    await sarcophagus.grantRole(await sarcophagus.ORACLE_ROLE(), deployer.address);
    console.log('✅ Roles granted to deployer');

    // Save deployment info
    const deploymentInfo = {
        network: 'vechain_testnet',
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            DeathVerifier: await deathVerifier.getAddress(),
            Sarcophagus: await sarcophagus.getAddress(),
            VTHO: VTHO_ADDRESS,
            B3TR: B3TR_ADDRESS
        },
        roles: {
            ORACLE_ROLE: await deathVerifier.ORACLE_ROLE(),
            VERIFIER_ROLE: await sarcophagus.VERIFIER_ROLE()
        }
    };

    console.log('\n=== DEPLOYMENT SUMMARY ===');
    console.log('Network: VeChain Testnet');
    console.log('Deployer:', deployer.address);
    console.log('DeathVerifier:', await deathVerifier.getAddress());
    console.log('Sarcophagus:', await sarcophagus.getAddress());
    console.log('VTHO Token:', VTHO_ADDRESS);
    console.log('B3TR Token:', B3TR_ADDRESS);
    console.log('\n✅ Deployment completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify contracts on VeChain Explorer');
    console.log('2. Set up oracle services for death verification');
    console.log('3. Test with real VTHO tokens');
    console.log('4. Deploy frontend to interact with contracts');

    // Save deployment info to file
    const fs = require('fs');
    fs.writeFileSync(
        'vechain-deployment.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log('\n📄 Deployment info saved to vechain-deployment.json');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Deployment failed:', error);
        process.exit(1);
    }); 