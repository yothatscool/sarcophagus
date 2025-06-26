const { ethers } = require("hardhat");

async function main() {
    console.log("🔄 Reverting Admin Roles to Deployer (Hybrid Approach)...\n");

    // Multi-sig wallet address
    const MULTISIG_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    
    // Get signers
    const [deployer] = await ethers.getSigners();
    
    console.log("📋 Configuration:");
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Multi-Sig Wallet: ${MULTISIG_ADDRESS}`);
    console.log("");

    // Contract addresses
    const contracts = {
        "Sarcophagus": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "OBOL": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        "B3TRRewards": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        "TokenManager": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        "AgeVerification": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
        "MilestoneManager": "0x0165878A594ca255338adfa4d48449f69242Eb8F"
    };

    // Roles to manage
    const roles = {
        "DEFAULT_ADMIN_ROLE": ethers.keccak256(ethers.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),
        "ADMIN_ROLE": ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE")),
        "ORACLE_ROLE": ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE")),
        "VERIFIER_ROLE": ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE")),
        "VAULT_ROLE": ethers.keccak256(ethers.toUtf8Bytes("VAULT_ROLE")),
        "VEBETTER_ROLE": ethers.keccak256(ethers.toUtf8Bytes("VEBETTER_ROLE"))
    };

    console.log("🔄 Reverting admin roles to deployer...");
    
    // Revert roles for each contract
    for (const [contractName, contractAddress] of Object.entries(contracts)) {
        console.log(`\n🔄 Processing ${contractName}...`);
        
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
                // Grant roles back to deployer
                for (const [roleName, roleHash] of Object.entries(roles)) {
                    try {
                        const multisigHasRole = await contract.hasRole(roleHash, MULTISIG_ADDRESS);
                        if (multisigHasRole) {
                            console.log(`  ✅ Granting ${roleName} back to deployer...`);
                            
                            const tx = await contract.grantRole(roleHash, deployer.address);
                            await tx.wait();
                            
                            console.log(`  ✅ ${roleName} granted to deployer successfully`);
                            
                            // Keep multi-sig wallet as backup admin (don't revoke)
                            console.log(`  🔒 Keeping multi-sig wallet as backup admin for ${roleName}`);
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
    }

    // Verify role transfers
    console.log("\n🔍 Verifying role transfers...");
    
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

    console.log("\n🎉 Hybrid admin setup completed!");
    console.log("\n📋 Current Setup:");
    console.log("✅ Deployer has direct admin access for daily operations");
    console.log("✅ Multi-sig wallet has backup admin access for security");
    console.log("✅ You can perform admin functions directly without multi-sig process");
    console.log("✅ Multi-sig wallet remains as emergency backup");
    console.log("");
    console.log("🔒 This is perfect for single-person operations!");
    console.log("🚀 You can always add more signers to multi-sig later when you have a team");
    console.log("");

    return {
        deployerAddress: deployer.address,
        multisigAddress: MULTISIG_ADDRESS,
        contracts: contracts,
        roles: roles
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Role revert failed:", error);
        process.exit(1);
    }); 