const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying Sarcophagus contracts with the account:', deployer.address);

    // Deploy mock tokens for testing
    console.log('Deploying mock tokens...');
    const MockVTHO = await ethers.getContractFactory('MockVTHO');
    const mockVTHO = await MockVTHO.deploy();
    await mockVTHO.waitForDeployment();
    console.log('MockVTHO deployed to:', await mockVTHO.getAddress());

    const MockB3TR = await ethers.getContractFactory('MockB3TR');
    const mockB3TR = await MockB3TR.deploy();
    await mockB3TR.waitForDeployment();
    console.log('MockB3TR deployed to:', await mockB3TR.getAddress());

    // Deploy DeathVerifier
    console.log('Deploying DeathVerifier...');
    const DeathVerifier = await ethers.getContractFactory('DeathVerifier');
    const deathVerifier = await DeathVerifier.deploy();
    await deathVerifier.waitForDeployment();
    console.log('DeathVerifier deployed to:', await deathVerifier.getAddress());

    // Deploy Sarcophagus
    console.log('Deploying Sarcophagus...');
    const Sarcophagus = await ethers.getContractFactory('Sarcophagus');
    const sarcophagus = await Sarcophagus.deploy(
        await mockVTHO.getAddress(),
        await mockB3TR.getAddress(),
        await deathVerifier.getAddress()
    );
    await sarcophagus.waitForDeployment();
    console.log('Sarcophagus deployed to:', await sarcophagus.getAddress());

    // Grant roles
    console.log('Setting up roles...');
    await deathVerifier.grantRole(await deathVerifier.ORACLE_ROLE(), deployer.address);
    await sarcophagus.grantRole(await sarcophagus.VERIFIER_ROLE(), deployer.address);
    await sarcophagus.grantRole(await sarcophagus.ORACLE_ROLE(), deployer.address);

    // Mint some tokens to deployer for testing
    console.log('Minting test tokens...');
    await mockVTHO.mint(deployer.address, ethers.parseEther('10000'));
    await mockB3TR.mint(deployer.address, ethers.parseEther('10000'));

    console.log('\n=== DEPLOYMENT SUMMARY ===');
    console.log('MockVTHO:', await mockVTHO.getAddress());
    console.log('MockB3TR:', await mockB3TR.getAddress());
    console.log('DeathVerifier:', await deathVerifier.getAddress());
    console.log('Sarcophagus:', await sarcophagus.getAddress());
    console.log('Deployer:', deployer.address);
    console.log('\nDeployer has been granted VERIFIER_ROLE and ORACLE_ROLE');
    console.log('Deployer has been minted 10,000 VTHO and 10,000 B3TR for testing');
    console.log('\nYou can now interact with the contracts!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 