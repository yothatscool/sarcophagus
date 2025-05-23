const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    setupRitualEngine,
    SECONDS_PER_DAY
} = require("./helpers/RitualTestHelpers");

describe("Vereavement Storage Optimizations", function () {
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
    
    describe("Memory Pool Operations", function () {
        it("Should efficiently initialize and use memory pools", async function () {
            const poolSize = 10;
            const tx = await ritualEngine.connect(owner).testMemoryPool(poolSize);
            const initGas = await trackGasUsage(tx, "memoryPoolInit");
            
            expect(initGas).to.be.lessThan(100000);
            expect(await ritualEngine.isMemoryPoolInitialized()).to.be.true;
        });
        
        it("Should reuse memory pool efficiently", async function () {
            await ritualEngine.connect(owner).testMemoryPool(10);
            
            const operations = 5;
            let totalGas = ethers.BigNumber.from(0);
            
            for (let i = 0; i < operations; i++) {
                const tx = await ritualEngine.connect(owner).useMemoryPool(i);
                const gas = await trackGasUsage(tx, `memoryPool_${i}`);
                totalGas = totalGas.add(gas);
            }
            
            const avgGas = totalGas.div(operations);
            console.log(`Average gas per memory pool operation: ${avgGas.toString()}`);
            expect(avgGas).to.be.lessThan(50000);
        });
    });
    
    describe("Storage Optimization", function () {
        it("Should optimize beneficiary storage layout", async function () {
            // Setup test vault with beneficiaries
            await ritualEngine.connect(user1).createRitualVault();
            
            for (let i = 0; i < 3; i++) {
                await ritualEngine.connect(user1).addBeneficiary(
                    users[i].address,
                    2000 + i * 1000,
                    30 * SECONDS_PER_DAY,
                    false,
                    ""
                );
            }
            
            // Optimize storage
            const tx = await ritualEngine.connect(user1).optimizeVaultStorage();
            const optimizeGas = await trackGasUsage(tx, "optimizeBeneficiaries");
            
            // Verify optimization
            const [totalSlots, usedSlots, freeSlots] = await ritualEngine.getStorageStats(user1.address);
            console.log(`Storage stats - Total: ${totalSlots}, Used: ${usedSlots}, Free: ${freeSlots}`);
            
            expect(optimizeGas).to.be.lessThan(200000);
            expect(freeSlots).to.be.above(0);
        });
        
        it("Should optimize token balance storage", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            
            // Add token balances
            const tokens = users.slice(0, 3).map(u => u.address); // Mock token addresses
            for (const token of tokens) {
                await ritualEngine.connect(user1).addToken(token);
                await ritualEngine.connect(user1).updateTokenBalance(token, {
                    vetBalance: ethers.utils.parseEther("100"),
                    vthoBalance: ethers.utils.parseEther("50"),
                    b3trBalance: ethers.utils.parseEther("25"),
                    isVthoEnabled: true,
                    isB3trEnabled: true
                });
            }
            
            // Optimize storage
            const tx = await ritualEngine.connect(user1).optimizeVaultStorage();
            const optimizeGas = await trackGasUsage(tx, "optimizeTokenBalances");
            
            // Verify data integrity
            for (const token of tokens) {
                const balance = await ritualEngine.getTokenBalance(user1.address, token);
                expect(balance.vetBalance).to.equal(ethers.utils.parseEther("100"));
                expect(balance.vthoBalance).to.equal(ethers.utils.parseEther("50"));
                expect(balance.b3trBalance).to.equal(ethers.utils.parseEther("25"));
            }
            
            expect(optimizeGas).to.be.lessThan(150000);
        });
        
        it("Should optimize activity history storage", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            
            // Add activity proofs
            const proofCount = 5;
            for (let i = 0; i < proofCount; i++) {
                await ritualEngine.connect(user1).recordActivity(
                    `PROOF_${i}`,
                    `Test activity ${i}`
                );
            }
            
            // Optimize storage
            const tx = await ritualEngine.connect(user1).optimizeVaultStorage();
            const optimizeGas = await trackGasUsage(tx, "optimizeActivityHistory");
            
            // Verify history integrity
            const history = await ritualEngine.getActivityHistory(user1.address);
            expect(history.length).to.equal(proofCount);
            
            expect(optimizeGas).to.be.lessThan(120000);
        });
    });
    
    describe("Storage Defragmentation", function () {
        it("Should handle large storage operations efficiently", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            
            // Add lots of data
            const beneficiaryCount = 10;
            const tokenCount = 5;
            const activityCount = 20;
            
            // Add beneficiaries
            for (let i = 0; i < beneficiaryCount; i++) {
                await ritualEngine.connect(user1).addBeneficiary(
                    users[i].address,
                    1000,
                    30 * SECONDS_PER_DAY,
                    false,
                    ""
                );
            }
            
            // Add tokens
            for (let i = 0; i < tokenCount; i++) {
                await ritualEngine.connect(user1).addToken(users[i].address);
            }
            
            // Add activities
            for (let i = 0; i < activityCount; i++) {
                await ritualEngine.connect(user1).recordActivity(
                    `PROOF_${i}`,
                    `Test activity ${i}`
                );
            }
            
            // Measure optimization
            const beforeStats = await ritualEngine.getStorageStats(user1.address);
            const tx = await ritualEngine.connect(user1).optimizeVaultStorage();
            const afterStats = await ritualEngine.getStorageStats(user1.address);
            
            const optimizeGas = await trackGasUsage(tx, "fullOptimization");
            const slotsSaved = beforeStats[0].sub(afterStats[0]);
            
            console.log(`Slots saved: ${slotsSaved.toString()}`);
            expect(optimizeGas.div(slotsSaved)).to.be.lessThan(50000); // Gas per slot saved
        });
    });
    
    describe("Gas Usage Report", function () {
        after(function () {
            console.log("\nStorage Optimization Gas Usage Summary:");
            console.log("=====================================");
            Object.entries(gasUsage).forEach(([operation, gas]) => {
                console.log(`${operation}: ${gas} gas`);
            });
        });
    });
}); 