const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account:', deployer.address);

    // Deploy AgeVerification
    const AgeVerification = await ethers.getContractFactory('AgeVerification');
    const ageVerification = await AgeVerification.deploy();
    await ageVerification.deployed();
    console.log('AgeVerification deployed to:', ageVerification.address);

    // Deploy TokenManager
    const TokenManager = await ethers.getContractFactory('TokenManager');
    const tokenManager = await TokenManager.deploy(
        deployer.address, // VTHO manager address - replace with actual
        deployer.address  // B3TR token address - replace with actual
    );
    await tokenManager.deployed();
    console.log('TokenManager deployed to:', tokenManager.address);

    // Deploy RitualEngine
    const RitualEngine = await ethers.getContractFactory('RitualEngine');
    const ritualEngine = await RitualEngine.deploy();
    await ritualEngine.deployed();
    console.log('RitualEngine deployed to:', ritualEngine.address);

    // Deploy Vereavement
    const Vereavement = await ethers.getContractFactory('Vereavement');
    const vereavement = await Vereavement.deploy(
        ageVerification.address,
        tokenManager.address,
        ritualEngine.address,
        deployer.address, // VTHO manager address - replace with actual
        deployer.address  // VNS resolver address - replace with actual
    );
    await vereavement.deployed();
    console.log('Vereavement deployed to:', vereavement.address);

    // Create .env file for frontend
    const envContent = `NEXT_PUBLIC_VEREAVEMENT_ADDRESS="${vereavement.address}"
NEXT_PUBLIC_RITUAL_ENGINE_ADDRESS="${ritualEngine.address}"
NEXT_PUBLIC_TOKEN_MANAGER_ADDRESS="${tokenManager.address}"
NEXT_PUBLIC_AGE_VERIFICATION_ADDRESS="${ageVerification.address}"`;

    fs.writeFileSync(
        path.join(__dirname, '../frontend/.env.local'),
        envContent
    );

    // Create deployment info file
    const deploymentInfo = {
        network: network.name,
        timestamp: new Date().toISOString(),
        contracts: {
            Vereavement: vereavement.address,
            RitualEngine: ritualEngine.address,
            TokenManager: tokenManager.address,
            AgeVerification: ageVerification.address
        }
    };

    fs.writeFileSync(
        path.join(__dirname, '../deployments.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('Deployment info saved to deployments.json');
    console.log('Frontend environment variables saved to frontend/.env.local');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
