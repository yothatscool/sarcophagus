const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    setupRitualEngine,
    SECONDS_PER_DAY
} = require("./helpers/RitualTestHelpers");

describe("Vereavement Gas Benchmarks", function () {
    let ritualEngine;
    let owner;
    let user1;
    let user2;
    let oracle;
    
    // Track gas usage
    let gasUsage = {};
    
    beforeEach(async function () {
        const setup = await setupRitualEngine();
        ritualEngine = setup.ritualEngine;
        owner = setup.owner;
        oracle = setup.oracle;
        [user1, user2] = await ethers.getSigners();
        
        // Reset gas tracking
        gasUsage = {};
    });
    
    async function trackGasUsage(tx, operation) {
        const receipt = await tx.wait();
        gasUsage[operation] = receipt.gasUsed.toString();
        console.log(`Gas used for ${operation}: ${receipt.gasUsed.toString()}`);
    }
    
    describe("Ritual Creation and Updates", function () {
        it("Should benchmark ritual vault creation", async function () {
            const tx = await ritualEngine.connect(user1).createRitualVault();
            await trackGasUsage(tx, "createRitualVault");
            
            expect(parseInt(gasUsage["createRitualVault"])).to.be.lessThan(200000);
        });
        
        it("Should benchmark ritual completion", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            await time.increase(3600);
            
            const tx = await ritualEngine.connect(user1).completeRitual("TEST");
            await trackGasUsage(tx, "completeRitual");
            
            expect(parseInt(gasUsage["completeRitual"])).to.be.lessThan(150000);
        });
        
        it("Should benchmark symbolic growth processing", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            await time.increase(SECONDS_PER_DAY);
            
            const tx = await ritualEngine.connect(user1).processSymbolicGrowth();
            await trackGasUsage(tx, "processSymbolicGrowth");
            
            expect(parseInt(gasUsage["processSymbolicGrowth"])).to.be.lessThan(100000);
        });
    });
    
    describe("Carbon Offset Operations", function () {
        it("Should benchmark carbon offset recording", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            
            const tx = await ritualEngine.connect(oracle).recordCarbonOffset(
                ethers.utils.parseEther("1"),
                "Test Offset",
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proof"))
            );
            await trackGasUsage(tx, "recordCarbonOffset");
            
            expect(parseInt(gasUsage["recordCarbonOffset"])).to.be.lessThan(120000);
        });
        
        it("Should benchmark batch carbon offset recording", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            
            const batchSize = 5;
            let totalGas = ethers.BigNumber.from(0);
            
            for (let i = 0; i < batchSize; i++) {
                const tx = await ritualEngine.connect(oracle).recordCarbonOffset(
                    ethers.utils.parseEther("1"),
                    `Batch Offset ${i}`,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`proof${i}`))
                );
                const receipt = await tx.wait();
                totalGas = totalGas.add(receipt.gasUsed);
            }
            
            const avgGas = totalGas.div(batchSize);
            console.log(`Average gas per batch operation: ${avgGas.toString()}`);
            expect(avgGas.toNumber()).to.be.lessThan(100000);
        });
    });
    
    describe("Storage Operations", function () {
        it("Should benchmark beneficiary addition", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            
            const tx = await ritualEngine.connect(user1).addBeneficiary(
                user2.address,
                1000, // 10%
                30 * SECONDS_PER_DAY,
                false,
                ""
            );
            await trackGasUsage(tx, "addBeneficiary");
            
            expect(parseInt(gasUsage["addBeneficiary"])).to.be.lessThan(200000);
        });
        
        it("Should benchmark vault state updates", async function () {
            await ritualEngine.connect(user1).createRitualVault();
            
            const tx = await ritualEngine.connect(user1).updateVaultSettings({
                minimumBalance: ethers.utils.parseEther("1"),
                inactivityThreshold: 60 * SECONDS_PER_DAY,
                autoDistributeVTHO: true
            });
            await trackGasUsage(tx, "updateVaultSettings");
            
            expect(parseInt(gasUsage["updateVaultSettings"])).to.be.lessThan(150000);
        });
    });
    
    describe("Access Control and Security", function () {
        it("Should benchmark emergency pause", async function () {
            const tx = await ritualEngine.connect(owner).emergencyPause();
            await trackGasUsage(tx, "emergencyPause");
            
            expect(parseInt(gasUsage["emergencyPause"])).to.be.lessThan(50000);
        });
        
        it("Should benchmark role management", async function () {
            const tx = await ritualEngine.connect(owner).grantRole(
                await ritualEngine.DEFAULT_ADMIN_ROLE(),
                user2.address
            );
            await trackGasUsage(tx, "grantRole");
            
            expect(parseInt(gasUsage["grantRole"])).to.be.lessThan(100000);
        });
    });
    
    describe("Gas Usage Report", function () {
        after(function () {
            console.log("\nGas Usage Summary:");
            console.log("=================");
            Object.entries(gasUsage).forEach(([operation, gas]) => {
                console.log(`${operation}: ${gas} gas`);
            });
        });
    });
}); 