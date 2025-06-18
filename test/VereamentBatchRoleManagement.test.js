const { expect } = require("chai");
const { ethers } = require("hardhat");
const { ROLES, ZERO_ADDRESS, toWei } = require("./helpers/TestUtils");

describe("Vereavement Batch Role Management", function () {
    let vereavement;
    let owner;
    let mediators;
    let oracles;
    let users;
    let vthoManager;
    let vnsResolver;
    let ritualEngine;
    let b3trToken;
    
    beforeEach(async function () {
        [owner, ...users] = await ethers.getSigners();
        mediators = users.slice(0, 3); // First 3 users as mediators
        oracles = users.slice(3, 6);   // Next 3 users as oracles

        // Deploy mock contracts
        const MockB3TR = await ethers.getContractFactory("MockB3TR");
        b3trToken = await MockB3TR.deploy();

        // Deploy mock VNS Resolver
        const MockVNSResolver = await ethers.getContractFactory("MockVNSResolver");
        vnsResolver = await MockVNSResolver.deploy();

        // Deploy VTHO Manager
        const VTHOManager = await ethers.getContractFactory("VTHOManager");
        vthoManager = await VTHOManager.deploy();

        // Deploy Ritual Engine
        const RitualEngine = await ethers.getContractFactory("RitualEngine");
        ritualEngine = await RitualEngine.deploy(b3trToken.target);
        
        const Vereavement = await ethers.getContractFactory("Vereavement");
        vereavement = await Vereavement.deploy(
            toWei("500"), // Weekly allocation
            toWei("1000"), // Treasury yield
            3, // Min confirmations
            vthoManager.target,
            vnsResolver.target,
            ritualEngine.target
        );
    });

    describe("Batch Mediator Management", function () {
        it("Should add multiple mediators in batch", async function () {
            const mediatorAddresses = mediators.map(m => m.address);
            await vereavement.addMediatorsBatch(mediatorAddresses);
            
            for (const mediator of mediatorAddresses) {
                expect(await vereavement.hasRole(ROLES.MEDIATOR_ROLE, mediator)).to.be.true;
            }
            
            const [activeMembers, _] = await vereavement.getMediators();
            expect(activeMembers.length).to.equal(mediatorAddresses.length + 1); // +1 for owner
        });

        it("Should remove multiple mediators in batch", async function () {
            // First add mediators
            const mediatorAddresses = mediators.map(m => m.address);
            await vereavement.addMediatorsBatch(mediatorAddresses);
            
            // Then remove them
            await vereavement.removeMediatorsBatch(mediatorAddresses);
            
            for (const mediator of mediatorAddresses) {
                expect(await vereavement.hasRole(ROLES.MEDIATOR_ROLE, mediator)).to.be.false;
            }
        });

        it("Should suspend multiple mediators in batch", async function () {
            // First add mediators
            const mediatorAddresses = mediators.map(m => m.address);
            await vereavement.addMediatorsBatch(mediatorAddresses);
            
            // Then suspend them
            await vereavement.suspendMediatorsBatch(mediatorAddresses);
            
            const [activeMembers, suspendedMembers] = await vereavement.getMediators();
            expect(suspendedMembers.length).to.equal(mediatorAddresses.length);
            
            for (const mediator of mediatorAddresses) {
                const [hasRole, isSuspended, _, __] = await vereavement.getMediatorInfo(mediator);
                expect(hasRole).to.be.true;
                expect(isSuspended).to.be.true;
            }
        });

        it("Should unsuspend multiple mediators in batch", async function () {
            // Setup: add and suspend mediators
            const mediatorAddresses = mediators.map(m => m.address);
            await vereavement.addMediatorsBatch(mediatorAddresses);
            await vereavement.suspendMediatorsBatch(mediatorAddresses);
            
            // Unsuspend them
            await vereavement.unsuspendMediatorsBatch(mediatorAddresses);
            
            const [activeMembers, suspendedMembers] = await vereavement.getMediators();
            expect(suspendedMembers.length).to.equal(0);
            
            for (const mediator of mediatorAddresses) {
                const [hasRole, isSuspended, _, __] = await vereavement.getMediatorInfo(mediator);
                expect(hasRole).to.be.true;
                expect(isSuspended).to.be.false;
            }
        });
    });

    describe("Batch Oracle Management", function () {
        it("Should add multiple oracles in batch", async function () {
            const oracleAddresses = oracles.map(o => o.address);
            await vereavement.addOraclesBatch(oracleAddresses);
            
            for (const oracle of oracleAddresses) {
                expect(await vereavement.hasRole(ROLES.ORACLE_ROLE, oracle)).to.be.true;
            }
            
            const [activeMembers, _] = await vereavement.getOracles();
            expect(activeMembers.length).to.equal(oracleAddresses.length + 1); // +1 for owner
        });

        it("Should remove multiple oracles in batch", async function () {
            const oracleAddresses = oracles.map(o => o.address);
            await vereavement.addOraclesBatch(oracleAddresses);
            await vereavement.removeOraclesBatch(oracleAddresses);
            
            for (const oracle of oracleAddresses) {
                expect(await vereavement.hasRole(ROLES.ORACLE_ROLE, oracle)).to.be.false;
            }
        });

        it("Should suspend multiple oracles in batch", async function () {
            const oracleAddresses = oracles.map(o => o.address);
            await vereavement.addOraclesBatch(oracleAddresses);
            await vereavement.suspendOraclesBatch(oracleAddresses);
            
            const [activeMembers, suspendedMembers] = await vereavement.getOracles();
            expect(suspendedMembers.length).to.equal(oracleAddresses.length);
            
            for (const oracle of oracleAddresses) {
                const [hasRole, isSuspended, _, __] = await vereavement.getOracleInfo(oracle);
                expect(hasRole).to.be.true;
                expect(isSuspended).to.be.true;
            }
        });

        it("Should unsuspend multiple oracles in batch", async function () {
            const oracleAddresses = oracles.map(o => o.address);
            await vereavement.addOraclesBatch(oracleAddresses);
            await vereavement.suspendOraclesBatch(oracleAddresses);
            await vereavement.unsuspendOraclesBatch(oracleAddresses);
            
            const [activeMembers, suspendedMembers] = await vereavement.getOracles();
            expect(suspendedMembers.length).to.equal(0);
            
            for (const oracle of oracleAddresses) {
                const [hasRole, isSuspended, _, __] = await vereavement.getOracleInfo(oracle);
                expect(hasRole).to.be.true;
                expect(isSuspended).to.be.false;
            }
        });
    });

    describe("Edge Cases and Restrictions", function () {
        it("Should not allow non-admin to perform batch operations", async function () {
            const addresses = mediators.map(m => m.address);
            await expect(
                vereavement.connect(users[0]).addMediatorsBatch(addresses)
            ).to.be.rejectedWith("AccessControl");
        });

        it("Should handle empty arrays gracefully", async function () {
            await vereavement.addMediatorsBatch([]);
            await vereavement.addOraclesBatch([]);
            const [mediatorActives, mediatorSuspended] = await vereavement.getMediators();
            const [oracleActives, oracleSuspended] = await vereavement.getOracles();
            expect(mediatorActives.length).to.equal(1); // Just owner
            expect(oracleActives.length).to.equal(1); // Just owner
        });

        it("Should not allow adding zero addresses in batch", async function () {
            await expect(
                vereavement.addMediatorsBatch([ZERO_ADDRESS])
            ).to.be.rejectedWith("Invalid address");
        });

        it("Should not allow suspending self in batch", async function () {
            await expect(
                vereavement.suspendMediatorsBatch([owner.address])
            ).to.be.rejectedWith("Cannot suspend self");
        });

        it("Should validate all addresses before making any changes", async function () {
            const validAddresses = mediators.map(m => m.address);
            const invalidAddresses = [...validAddresses, ZERO_ADDRESS];
            
            await expect(
                vereavement.addMediatorsBatch(invalidAddresses)
            ).to.be.rejectedWith("Invalid address");
            
            // Verify no addresses were added
            for (const addr of validAddresses) {
                expect(await vereavement.hasRole(ROLES.MEDIATOR_ROLE, addr)).to.be.false;
            }
        });
    });
}); 