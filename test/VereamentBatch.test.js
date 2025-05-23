const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    setupRitualEngine,
    SECONDS_PER_DAY
} = require("./helpers/RitualTestHelpers");

describe("Vereavement Batch Operations", function () {
    let ritualEngine;
    let owner;
    let user1;
    let users;
    let oracle;
    
    // Track gas usage
    let gasUsage = {};
    
    beforeEach(async function () {
        const setup = await setupRitualEngine();
        ritualEngine = setup.ritualEngine;
        owner = setup.owner;
        oracle = setup.oracle;
        [user1, ...users] = await ethers.getSigners();
        
        // Reset gas tracking
        gasUsage = {};
    });
    
    async function trackGasUsage(tx, operation) {
        const receipt = await tx.wait();
        gasUsage[operation] = receipt.gasUsed.toString();
        console.log(`Gas used for ${operation}: ${receipt.gasUsed.toString()}`);
        return receipt.gasUsed;
    }
    
    describe("Batch Ritual Updates", function () {
        it("Should process multiple ritual updates efficiently", async function () {
            // Create ritual vaults for testing
            const testUsers = users.slice(0, 5);
            for (const user of testUsers) {
                await ritualEngine.connect(user).createRitualVault();
            }
            
            // Prepare batch update data
            const updates = testUsers.map((user, i) => ({
                user: user.address,
                value: ethers.utils.parseEther((i + 1).toString()),
                timestamp: Math.floor(Date.now() / 1000),
                ritualType: `TEST_${i}`,
                isActive: true
            }));
            
            // Process batch update
            const tx = await ritualEngine.connect(owner).batchProcessRituals(updates);
            const batchGas = await trackGasUsage(tx, "batchProcessRituals");
            
            // Compare with individual updates
            let totalIndividualGas = ethers.BigNumber.from(0);
            for (const update of updates) {
                const tx = await ritualEngine.connect(update.user).completeRitual(update.ritualType);
                const gas = await trackGasUsage(tx, `individual_ritual_${update.user}`);
                totalIndividualGas = totalIndividualGas.add(gas);
            }
            
            console.log("Gas savings:", totalIndividualGas.sub(batchGas).toString());
            expect(batchGas).to.be.lessThan(totalIndividualGas);
        });
        
        it("Should handle large batch updates efficiently", async function () {
            const batchSize = 20;
            const testUsers = users.slice(0, batchSize);
            
            // Setup vaults
            for (const user of testUsers) {
                await ritualEngine.connect(user).createRitualVault();
            }
            
            // Create large batch update
            const updates = testUsers.map((user, i) => ({
                user: user.address,
                value: ethers.utils.parseEther("1"),
                timestamp: Math.floor(Date.now() / 1000),
                ritualType: `BATCH_${i}`,
                isActive: true
            }));
            
            const tx = await ritualEngine.connect(owner).batchProcessRituals(updates);
            const gasUsed = await trackGasUsage(tx, "largeBatchUpdate");
            
            // Check average gas per update
            const avgGas = ethers.BigNumber.from(gasUsed).div(batchSize);
            console.log(`Average gas per update in batch: ${avgGas.toString()}`);
            expect(avgGas).to.be.lessThan(75000); // Significantly less than individual updates
        });
    });
    
    describe("Batch Beneficiary Updates", function () {
        it("Should process multiple beneficiary updates efficiently", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            
            // Prepare batch beneficiary updates
            const beneficiaries = users.slice(0, 3).map((user, i) => ({
                recipient: user.address,
                percentage: 2000 + i * 1000, // 20%, 30%, 40%
                vestingDuration: 30 * SECONDS_PER_DAY,
                isConditional: false,
                condition: ""
            }));
            
            // Process batch update
            const tx = await ritualEngine.connect(user1).batchUpdateBeneficiaries(beneficiaries);
            const batchGas = await trackGasUsage(tx, "batchBeneficiaryUpdate");
            
            // Compare with individual updates
            let totalIndividualGas = ethers.BigNumber.from(0);
            for (const ben of beneficiaries) {
                const tx = await ritualEngine.connect(user1).addBeneficiary(
                    ben.recipient,
                    ben.percentage,
                    ben.vestingDuration,
                    ben.isConditional,
                    ben.condition
                );
                const gas = await trackGasUsage(tx, `individual_beneficiary_${ben.recipient}`);
                totalIndividualGas = totalIndividualGas.add(gas);
            }
            
            console.log("Gas savings:", totalIndividualGas.sub(batchGas).toString());
            expect(batchGas).to.be.lessThan(totalIndividualGas);
        });
    });
    
    describe("State Encoding/Decoding", function () {
        it("Should efficiently encode and decode ritual states", async function () {
            // Create test states
            const testStates = Array(5).fill(null).map((_, i) => ({
                totalValue: ethers.utils.parseEther((i + 1).toString()),
                carbonOffset: i * 1000,
                longevityScore: i * 100,
                isActive: true,
                memorials: []
            }));
            
            // Encode states
            const tx1 = await ritualEngine.connect(owner).encodeRitualStates(testStates);
            const encodingGas = await trackGasUsage(tx1, "encodeStates");
            
            // Decode states
            const tx2 = await ritualEngine.connect(owner).decodeRitualStates(tx1.encoded);
            const decodingGas = await trackGasUsage(tx2, "decodeStates");
            
            console.log("Total gas for encoding/decoding:", encodingGas.add(decodingGas).toString());
            expect(encodingGas.add(decodingGas)).to.be.lessThan(200000);
        });
    });
    
    describe("Gas Usage Report", function () {
        after(function () {
            console.log("\nBatch Operations Gas Usage Summary:");
            console.log("=================================");
            Object.entries(gasUsage).forEach(([operation, gas]) => {
                console.log(`${operation}: ${gas} gas`);
            });
        });
    });
}); 