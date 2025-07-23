// mockOracle.js
require('dotenv').config();
const { ethers } = require('ethers');

// === CONFIG ===
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const ABI = require('./artifacts/contracts/DeathVerifier.sol/DeathVerifier.json').abi;

// List of user wallet addresses to check
const userAddresses = [
    '0x1111111111111111111111111111111111111111',
    '0x2222222222222222222222222222222222222222',
    '0x3333333333333333333333333333333333333333',
    // Add more addresses as needed
];

async function main() {
    // Set up provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    for (const user of userAddresses) {
        // Simulate a random death check (50% chance)
        const isDeceased = Math.random() > 0.5;
        console.log(`Checking user ${user}: ${isDeceased ? 'DECEASED' : 'ALIVE'}`);
        if (isDeceased) {
            try {
                const tx = await contract.markDeceased(user);
                console.log(`  -> markDeceased tx sent: ${tx.hash}`);
                await tx.wait();
                console.log(`  -> markDeceased confirmed for ${user}`);
            } catch (err) {
                console.error(`  -> Error marking deceased:`, err.reason || err.message);
            }
        }
    }
}

main().catch(console.error); 