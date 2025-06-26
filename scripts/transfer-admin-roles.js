const { ethers } = require("hardhat");

async function main() {
    console.log("🔐 Transferring Admin Roles to Multi-Sig Wallet...\n");

    // Multi-sig wallet address from deployment
    const MULTISIG_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    
    // Get signers
    const [deployer] = await ethers.getSigners();
    
    console.log("📋 Configuration:");
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Multi-Sig Wallet: ${MULTISIG_ADDRESS}`);
    console.log("");

    // Contract addresses (you'll need to update these with your actual deployed addresses)
    const contracts = {
        "Sarcophagus": "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Update with actual address
        "OBOL": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Update with actual address
        "B3TRRewards": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // Update with actual address
        "TokenManager": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", // Update with actual address
        "DeathVerifier": "0xDc64a140Aa3E981100a9becA4E685f962fC0B8C9", // Update with actual address
        "AgeVerification": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707", // Update with actual address
        "MilestoneManager": "0x0165878A594ca255338adfa4d48449f69242Eb8F" // Update with actual address
    };

    console.log("📝 Contracts to update:");
    for (const [name, address] of Object.entries(contracts)) {
        console.log(`  ${name}: ${address}`);
    }
    console.log("");

    // Roles to transfer
    const roles = {
        "DEFAULT_ADMIN_ROLE": ethers.keccak256(ethers.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),
        "ADMIN_ROLE": ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")),
        "ORACLE_ROLE": ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE")),
        "VERIFIER_ROLE": ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE")),
        "VAULT_ROLE": ethers.keccak256(ethers.toUtf8Bytes("VAULT_ROLE")),
        "VEBETTER_ROLE": ethers.keccak256(ethers.toUtf8Bytes("VEBETTER_ROLE"))
    };

    console.log("🔑 Roles to transfer:");
    for (const [name, roleHash] of Object.entries(roles)) {
        console.log(`  ${name}: ${roleHash}`);
    }
    console.log("");

    // Transfer roles for each contract
    for (const [contractName, contractAddress] of Object.entries(contracts)) {
        console.log(`🔄 Processing ${contractName}...`);
        
        try {
            // Get contract instance
            const contract = await ethers.getContractAt(contractName, contractAddress);
            
            // Check if contract has AccessControl
            let hasAccessControl = false;
            try {
                await contract.hasRole(roles.DEFAULT_ADMIN_ROLE, deployer.address);
                hasAccessControl = true;
            } catch (error) {
                console.log(`  ⚠️  ${contractName} does not have AccessControl or role not found`);
                continue;
            }

            if (hasAccessControl) {
                // Grant roles to multi-sig wallet
                for (const [roleName, roleHash] of Object.entries(roles)) {
                    try {
                        const hasRole = await contract.hasRole(roleHash, deployer.address);
                        if (hasRole) {
                            console.log(`  ✅ Granting ${roleName} to multi-sig wallet...`);
                            
                            const tx = await contract.grantRole(roleHash, MULTISIG_ADDRESS);
                            await tx.wait();
                            
                            console.log(`  ✅ ${roleName} granted successfully`);
                            
                            // Revoke role from deployer
                            console.log(`  🔄 Revoking ${roleName} from deployer...`);
                            const revokeTx = await contract.revokeRole(roleHash, deployer.address);
                            await revokeTx.wait();
                            
                            console.log(`  ✅ ${roleName} revoked from deployer`);
                        }
                    } catch (error) {
                        console.log(`  ⚠️  Error processing ${roleName}: ${error.message}`);
                    }
                }
            }
            
            console.log(`  ✅ ${contractName} processed successfully`);
            
        } catch (error) {
            console.log(`  ❌ Error processing ${contractName}: ${error.message}`);
        }
        
        console.log("");
    }

    // Verify role transfers
    console.log("🔍 Verifying role transfers...");
    
    for (const [contractName, contractAddress] of Object.entries(contracts)) {
        try {
            const contract = await ethers.getContractAt(contractName, contractAddress);
            
            console.log(`\n📋 ${contractName} Role Status:`);
            
            for (const [roleName, roleHash] of Object.entries(roles)) {
                try {
                    const deployerHasRole = await contract.hasRole(roleHash, deployer.address);
                    const multisigHasRole = await contract.hasRole(roleHash, MULTISIG_ADDRESS);
                    
                    console.log(`  ${roleName}:`);
                    console.log(`    Deployer: ${deployerHasRole ? "✅" : "❌"}`);
                    console.log(`    Multi-Sig: ${multisigHasRole ? "✅" : "❌"}`);
                    
                } catch (error) {
                    console.log(`  ${roleName}: Error checking role`);
                }
            }
            
        } catch (error) {
            console.log(`❌ Error verifying ${contractName}: ${error.message}`);
        }
    }

    console.log("\n🎉 Admin role transfer completed!");
    console.log("\n📋 Next Steps:");
    console.log("1. Update your frontend/backend config with the multi-sig wallet address");
    console.log("2. Test multi-sig functionality");
    console.log("3. Ensure all admin operations now go through the multi-sig wallet");
    console.log("");

    return {
        multisigAddress: MULTISIG_ADDRESS,
        contracts: contracts,
        roles: roles
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Role transfer failed:", error);
        process.exit(1);
    }); 