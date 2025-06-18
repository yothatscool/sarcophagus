const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    setupRitualEngine,
    setupRitualState,
    getRitualState,
    SECONDS_PER_DAY,
    SECONDS_PER_MONTH
} = require("./helpers/RitualTestHelpers");
const { ROLES, ZERO_ADDRESS, toWei, fromWei, generateProofHash } = require("./helpers/TestUtils");

describe("Vereavement", function () {
    let vereavement;
    let ritualEngine;
    let vthoManager;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    let b3trToken;
    let vnsResolver;
    let user1;
    let user2;
    let beneficiary1;
    let beneficiary2;

    beforeEach(async function () {
        // Get test accounts
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

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

        // Deploy main contract
        const Vereavement = await ethers.getContractFactory("Vereavement");
        vereavement = await Vereavement.deploy(
            toWei("500"), // Weekly allocation
            toWei("1000"), // Treasury yield
            3, // Min confirmations
            vthoManager.target,
            vnsResolver.target,
            ritualEngine.target
        );

        // Setup roles
        await vereavement.grantRole(ROLES.ORACLE_ROLE, addr1.address);
        await vereavement.grantRole(ROLES.MEDIATOR_ROLE, addr2.address);
        await ritualEngine.grantRole(ROLES.ORACLE_ROLE, addr1.address);

        // Fund contracts
        await b3trToken.mint(ritualEngine.target, toWei("1000000"));

        // Initialize other variables
        user1 = addr1;
        user2 = addr2;
        beneficiary1 = addr1;
        beneficiary2 = addr2;
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await vereavement.hasRole(await vereavement.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
        });

        it("Should set the correct initial configuration", async function () {
            const config = await vereavement.getTreasuryConfig();
            expect(config.flatWeeklyAllocation).to.equal(toWei("500"));
            expect(config.totalTreasuryYield).to.equal(toWei("1000"));
            expect(config.minConfirmationsRequired).to.equal(3);
        });
    });

    describe("User Registration", function () {
        it("Should allow a user to register with beneficiaries", async function () {
            const recipients = [addr1.address];
            const percentages = [10000]; // 100%
            const vestingDurations = [0];
            const isConditional = [false];
            const conditions = [""];

            await vereavement.connect(addr2).registerUser(
                recipients,
                percentages,
                vestingDurations,
                isConditional,
                conditions
            );

            const [registeredRecipients, registeredPercentages] = await vereavement.getBeneficiaries(addr2.address);
            expect(registeredRecipients[0]).to.equal(addr1.address);
            expect(registeredPercentages[0]).to.equal(10000);
        });

        it("Should not allow registration with invalid percentages", async function () {
            const recipients = [addr1.address];
            const percentages = [5000]; // Only 50%
            const vestingDurations = [0];
            const isConditional = [false];
            const conditions = [""];

            await expect(
                vereavement.connect(addr2).registerUser(
                    recipients,
                    percentages,
                    vestingDurations,
                    isConditional,
                    conditions
                )
            ).to.be.rejectedWith("Percentages must total 100%");
        });
    });

    describe("Ritual System", function () {
        beforeEach(async function () {
            // Register a user first
            const recipients = [addr1.address];
            const percentages = [10000];
            const vestingDurations = [0];
            const isConditional = [false];
            const conditions = [""];

            await vereavement.connect(addr2).registerUser(
                recipients,
                percentages,
                vestingDurations,
                isConditional,
                conditions
            );
        });

        it("Should allow creating a ritual vault", async function () {
            await vereavement.connect(addr2).createRitualVault();
            expect(await vereavement.isRitualActive(addr2.address)).to.equal(true);
        });

        it("Should not allow creating multiple ritual vaults", async function () {
            await vereavement.connect(addr2).createRitualVault();
            await expect(
                vereavement.connect(addr2).createRitualVault()
            ).to.be.rejectedWith("Ritual vault already exists");
        });
    });

    describe("Full Lifecycle Test", function () {
        it("Should handle complete lifecycle with ritual integration", async function () {
            // 1. Register user with beneficiaries
            await vereavement.connect(user1).registerUser(
                [beneficiary1.address, beneficiary2.address],
                [7000, 3000], // 70% and 30%
                [0, 0], // No vesting
                [false, false], // No conditions
                ["", ""] // No conditions
            );

            // 2. Setup ritual vault
            await vereavement.connect(user1).createRitualVault();
            
            // 3. Record carbon offset
            await ritualEngine.connect(addr1).recordCarbonOffset(
                50, // 50 metric tons
                "Major Carbon Offset",
                ethers.keccak256(ethers.toUtf8Bytes("proof"))
            );

            // 4. Build longevity
            for (let i = 0; i < 3; i++) {
                await time.increase(SECONDS_PER_MONTH);
                await vereavement.connect(user1).processSymbolicGrowth();
            }
        });

        it("Should handle ritual power affecting inheritance distribution", async function () {
            // Setup initial state
            await vereavement.connect(user1).registerUser(
                [beneficiary1.address],
                [10000], // 100%
                [0], // No vesting
                [false], // No conditions
                [""] // No conditions
            );
            await vereavement.connect(user1).createRitualVault();

            // Build high ritual power
            await ritualEngine.connect(addr1).recordCarbonOffset(100, "source", ethers.constants.HashZero);
            for (let i = 0; i < 6; i++) {
                await time.increase(SECONDS_PER_MONTH);
                await vereavement.connect(user1).updateLongevityMetrics();
            }

            // Process death with high ritual power
            await vereavement.connect(addr1).confirmDeath(user1.address);
            await vereavement.connect(addr2).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);

            const ritualState = await getRitualState(ritualEngine, user1);
            expect(ritualState.ritualPower).to.be.above(75);

            // Verify enhanced inheritance distribution
            const initialBalance = await b3trToken.balanceOf(beneficiary1.address);
            await vereavement.connect(beneficiary1).payoutVault(user1.address, b3trToken.address);
            const finalBalance = await b3trToken.balanceOf(beneficiary1.address);
            
            expect(finalBalance.sub(initialBalance)).to.be.above(ethers.parseEther("500"));
        });

        it("Should handle memorial preservation", async function () {
            await vereavement.connect(user1).createRitualVault();
            
            // Add multiple memorials
            const memorials = [
                "ipfs://memorial1",
                "ipfs://memorial2",
                "ipfs://memorial3"
            ];
            
            for (const memorial of memorials) {
                await vereavement.connect(user1).preserveMemorial(memorial);
            }
            
            // Verify memorial preservation
            const ritualState = await vereavement.getRitualState(user1.address);
            expect(ritualState.memorials.length).to.equal(3);
            expect(ritualState.memorials).to.deep.equal(memorials);
        });

        it("Should handle emergency situations", async function () {
            // Setup user with emergency contact
            await vereavement.connect(user1).registerUser(
                [beneficiary1.address],
                [10000],
                [0],
                [false],
                [""]
            );
            await vereavement.connect(user1).createRitualVault();
            await vereavement.connect(user1).setEmergencyContact(user2.address);

            // Simulate long inactivity
            await time.increase(180 * SECONDS_PER_DAY);

            // Emergency contact can add activity proof
            await vereavement.connect(user2).addActivityProof(
                user1.address,
                "emergency_check",
                "Emergency welfare check completed"
            );

            // Verify activity was recorded
            const activityHistory = await vereavement.getActivityHistory(user1.address);
            expect(activityHistory.length).to.be.above(0);
            expect(activityHistory[activityHistory.length - 1].proofType).to.equal("emergency_check");
        });
    });
});

describe("Vereavement Role Management", function () {
    let vereavement;
    let owner;
    let mediator;
    let oracle;
    let user1;
    let user2;
    
    // Role constants
    const MEDIATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MEDIATOR_ROLE"));
    const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
    
    beforeEach(async function () {
        [owner, mediator, oracle, user1, user2] = await ethers.getSigners();
        
        const Vereavement = await ethers.getContractFactory("Vereavement");
        vereavement = await Vereavement.deploy(
            1000, // _flatWeeklyAllocation
            500,  // _totalTreasuryYield
            3,    // _minConfirmations
            ethers.constants.AddressZero, // _vthoManager
            ethers.constants.AddressZero, // _vnsResolver
            ethers.constants.AddressZero  // _ritualEngine
        );
        await vereavement.deployed();
    });

    describe("Role Management", function () {
        it("Should add mediator correctly", async function () {
            await vereavement.addMediator(mediator.address);
            expect(await vereavement.hasRole(MEDIATOR_ROLE, mediator.address)).to.be.true;
        });

        it("Should add oracle correctly", async function () {
            await vereavement.addOracle(oracle.address);
            expect(await vereavement.hasRole(ORACLE_ROLE, oracle.address)).to.be.true;
        });

        it("Should add multiple mediators in batch", async function () {
            await vereavement.addMediatorsBatch([mediator.address, user1.address]);
            expect(await vereavement.hasRole(MEDIATOR_ROLE, mediator.address)).to.be.true;
            expect(await vereavement.hasRole(MEDIATOR_ROLE, user1.address)).to.be.true;
        });

        it("Should remove mediator correctly", async function () {
            await vereavement.addMediator(mediator.address);
            await vereavement.removeMediator(mediator.address);
            expect(await vereavement.hasRole(MEDIATOR_ROLE, mediator.address)).to.be.false;
        });

        it("Should not allow non-admin to add mediator", async function () {
            await expect(
                vereavement.connect(user1).addMediator(mediator.address)
            ).to.be.revertedWith("AccessControl");
        });

        it("Should not allow adding zero address as mediator", async function () {
            await expect(
                vereavement.addMediator(ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid address");
        });

        it("Should track role members correctly", async function () {
            await vereavement.addMediator(mediator.address);
            await vereavement.addMediator(user1.address);
            const mediators = await vereavement.getMediators();
            expect(mediators).to.include(mediator.address);
            expect(mediators).to.include(user1.address);
            expect(mediators.length).to.equal(3); // Including owner
        });
    });

    describe("Role Suspension", function () {
        beforeEach(async function () {
            await vereavement.addMediator(mediator.address);
        });

        it("Should suspend role member correctly", async function () {
            await vereavement.suspendRoleMember(MEDIATOR_ROLE, mediator.address);
            expect(await vereavement.isRoleMemberSuspended(MEDIATOR_ROLE, mediator.address)).to.be.true;
            expect(await vereavement.hasRole(MEDIATOR_ROLE, mediator.address)).to.be.false;
        });

        it("Should unsuspend role member correctly", async function () {
            await vereavement.suspendRoleMember(MEDIATOR_ROLE, mediator.address);
            await vereavement.unsuspendRoleMember(MEDIATOR_ROLE, mediator.address);
            expect(await vereavement.isRoleMemberSuspended(MEDIATOR_ROLE, mediator.address)).to.be.false;
            expect(await vereavement.hasRole(MEDIATOR_ROLE, mediator.address)).to.be.true;
        });

        it("Should prevent suspended member from performing role actions", async function () {
            await vereavement.addMediator(mediator.address);
            await vereavement.suspendRoleMember(MEDIATOR_ROLE, mediator.address);
            
            // Try to perform mediator action (e.g., approving conditional payout)
            await expect(
                vereavement.connect(mediator).approveConditionalPayout(user1.address, user2.address)
            ).to.be.revertedWith("Not a mediator");
        });

        it("Should allow suspended member to perform actions after unsuspension", async function () {
            await vereavement.addMediator(mediator.address);
            await vereavement.suspendRoleMember(MEDIATOR_ROLE, mediator.address);
            await vereavement.unsuspendRoleMember(MEDIATOR_ROLE, mediator.address);
            
            expect(await vereavement.hasRole(MEDIATOR_ROLE, mediator.address)).to.be.true;
            expect(await vereavement.isRoleMemberSuspended(MEDIATOR_ROLE, mediator.address)).to.be.false;
        });
    });

    describe("Role Delegation", function () {
        beforeEach(async function () {
            await vereavement.addMediator(mediator.address);
        });

        it("Should delegate role correctly", async function () {
            await vereavement.connect(mediator).delegateRole(MEDIATOR_ROLE, user1.address, 86400); // 1 day
            expect(await vereavement.canActForRole(MEDIATOR_ROLE, user1.address)).to.be.true;
        });

        it("Should revoke delegation correctly", async function () {
            await vereavement.connect(mediator).delegateRole(MEDIATOR_ROLE, user1.address, 86400);
            await vereavement.connect(mediator).revokeDelegation(MEDIATOR_ROLE);
            expect(await vereavement.canActForRole(MEDIATOR_ROLE, user1.address)).to.be.false;
        });

        it("Should respect delegation expiry", async function () {
            await vereavement.connect(mediator).delegateRole(MEDIATOR_ROLE, user1.address, 86400);
            
            // Increase time past expiry
            await ethers.provider.send("evm_increaseTime", [86401]);
            await ethers.provider.send("evm_mine");
            
            expect(await vereavement.canActForRole(MEDIATOR_ROLE, user1.address)).to.be.false;
        });

        it("Should allow indefinite delegation", async function () {
            await vereavement.connect(mediator).delegateRole(MEDIATOR_ROLE, user1.address, 0);
            expect(await vereavement.canActForRole(MEDIATOR_ROLE, user1.address)).to.be.true;
            
            // Increase time significantly
            await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]); // 1 year
            await ethers.provider.send("evm_mine");
            
            expect(await vereavement.canActForRole(MEDIATOR_ROLE, user1.address)).to.be.true;
        });
    });

    describe("Role Transfer", function () {
        beforeEach(async function () {
            await vereavement.addMediator(mediator.address);
        });

        it("Should request and complete role transfer correctly", async function () {
            await vereavement.connect(mediator).requestRoleTransfer(MEDIATOR_ROLE, user1.address);
            await vereavement.connect(user1).acceptRoleTransfer(MEDIATOR_ROLE, mediator.address);
            
            expect(await vereavement.hasRole(MEDIATOR_ROLE, user1.address)).to.be.true;
            expect(await vereavement.hasRole(MEDIATOR_ROLE, mediator.address)).to.be.false;
        });

        it("Should cancel role transfer correctly", async function () {
            await vereavement.connect(mediator).requestRoleTransfer(MEDIATOR_ROLE, user1.address);
            await vereavement.connect(mediator).cancelRoleTransfer(MEDIATOR_ROLE);
            
            await expect(
                vereavement.connect(user1).acceptRoleTransfer(MEDIATOR_ROLE, mediator.address)
            ).to.be.revertedWith("No pending transfer");
        });

        it("Should not allow transfer to existing role member", async function () {
            await vereavement.addMediator(user1.address);
            await expect(
                vereavement.connect(mediator).requestRoleTransfer(MEDIATOR_ROLE, user1.address)
            ).to.be.revertedWith("Already has role");
        });

        it("Should not allow accepting transfer after cancellation", async function () {
            await vereavement.connect(mediator).requestRoleTransfer(MEDIATOR_ROLE, user1.address);
            await vereavement.connect(mediator).cancelRoleTransfer(MEDIATOR_ROLE);
            
            await expect(
                vereavement.connect(user1).acceptRoleTransfer(MEDIATOR_ROLE, mediator.address)
            ).to.be.revertedWith("No pending transfer");
        });

        it("Should not allow accepting transfer by non-recipient", async function () {
            await vereavement.connect(mediator).requestRoleTransfer(MEDIATOR_ROLE, user1.address);
            
            await expect(
                vereavement.connect(user2).acceptRoleTransfer(MEDIATOR_ROLE, mediator.address)
            ).to.be.revertedWith("Not transfer recipient");
        });
    });

    describe("Role Recovery", function () {
        it("Should recover role after delay", async function () {
            // Remove all admins first
            await vereavement.renounceRole(await vereavement.DEFAULT_ADMIN_ROLE(), owner.address);
            
            await vereavement.connect(user1).requestRoleRecovery(
                await vereavement.DEFAULT_ADMIN_ROLE(),
                user1.address
            );
            
            // Increase time by recovery delay
            await ethers.provider.send("evm_increaseTime", [14 * 24 * 60 * 60]); // 14 days
            await ethers.provider.send("evm_mine");
            
            await vereavement.connect(user1).executeRoleRecovery(await vereavement.DEFAULT_ADMIN_ROLE());
            expect(await vereavement.hasRole(await vereavement.DEFAULT_ADMIN_ROLE(), user1.address)).to.be.true;
        });

        it("Should not allow recovery if role has active members", async function () {
            await expect(
                vereavement.connect(user1).requestRoleRecovery(MEDIATOR_ROLE, user1.address)
            ).to.be.revertedWith("Role has active members");
        });

        it("Should not allow executing recovery before delay", async function () {
            // Remove all admins first
            await vereavement.renounceRole(await vereavement.DEFAULT_ADMIN_ROLE(), owner.address);
            
            await vereavement.connect(user1).requestRoleRecovery(
                await vereavement.DEFAULT_ADMIN_ROLE(),
                user1.address
            );
            
            await expect(
                vereavement.connect(user1).executeRoleRecovery(await vereavement.DEFAULT_ADMIN_ROLE())
            ).to.be.revertedWith("Delay not met");
        });

        it("Should allow cancelling recovery request", async function () {
            // Remove all admins first
            await vereavement.renounceRole(await vereavement.DEFAULT_ADMIN_ROLE(), owner.address);
            
            await vereavement.connect(user1).requestRoleRecovery(
                await vereavement.DEFAULT_ADMIN_ROLE(),
                user1.address
            );
            
            await vereavement.connect(user1).cancelRoleRecovery(await vereavement.DEFAULT_ADMIN_ROLE());
            
            const status = await vereavement.getRoleRecoveryStatus(await vereavement.DEFAULT_ADMIN_ROLE());
            expect(status.isActive).to.be.false;
        });
    });

    describe("Edge Cases and Restrictions", function () {
        it("Should not allow self-suspension", async function () {
            await expect(
                vereavement.suspendRoleMember(await vereavement.DEFAULT_ADMIN_ROLE(), owner.address)
            ).to.be.revertedWith("Cannot suspend self");
        });

        it("Should not allow delegation to existing role members", async function () {
            await vereavement.addMediator(user1.address);
            await expect(
                vereavement.connect(mediator).delegateRole(MEDIATOR_ROLE, user1.address, 86400)
            ).to.be.revertedWith("Already has role");
        });

        it("Should not allow suspended members to delegate", async function () {
            await vereavement.suspendRoleMember(MEDIATOR_ROLE, mediator.address);
            await expect(
                vereavement.connect(mediator).delegateRole(MEDIATOR_ROLE, user1.address, 86400)
            ).to.be.revertedWith("Role suspended");
        });
    });
});

describe("Role Management View Functions", function () {
    beforeEach(async function () {
        await vereavement.addMediator(mediator.address);
        await vereavement.addOracle(oracle.address);
    });

    it("Should return correct role information", async function () {
        const [hasRole, isSuspended, delegatedBy, delegationExpiry] = await vereavement.getRoleInfo(MEDIATOR_ROLE, mediator.address);
        expect(hasRole).to.be.true;
        expect(isSuspended).to.be.false;
        expect(delegatedBy).to.equal(ethers.constants.AddressZero);
        expect(delegationExpiry).to.equal(0);
    });

    it("Should return correct role members", async function () {
        await vereavement.suspendRoleMember(MEDIATOR_ROLE, mediator.address);
        
        const [activeMembers, suspendedMembers] = await vereavement.getRoleMembers(MEDIATOR_ROLE);
        expect(activeMembers).to.include(owner.address);
        expect(suspendedMembers).to.include(mediator.address);
    });

    it("Should return correct transfer request details", async function () {
        await vereavement.connect(mediator).requestRoleTransfer(MEDIATOR_ROLE, user1.address);
        
        const [to, requestTime, isActive, canExecute] = await vereavement.getRoleTransferRequest(MEDIATOR_ROLE, mediator.address);
        expect(to).to.equal(user1.address);
        expect(isActive).to.be.true;
        expect(canExecute).to.be.false; // Should be false until delay period passes
    });

    it("Should return correct delegation details", async function () {
        await vereavement.connect(mediator).delegateRole(MEDIATOR_ROLE, user1.address, 86400);
        
        const [delegate, expiry, isActive] = await vereavement.getRoleDelegation(MEDIATOR_ROLE, mediator.address);
        expect(delegate).to.equal(user1.address);
        expect(isActive).to.be.true;
        
        // Test expiry
        await ethers.provider.send("evm_increaseTime", [86401]);
        await ethers.provider.send("evm_mine");
        
        const [_, __, isStillActive] = await vereavement.getRoleDelegation(MEDIATOR_ROLE, mediator.address);
        expect(isStillActive).to.be.false;
    });

    it("Should handle non-existent role queries", async function () {
        const [hasRole, isSuspended, delegatedBy, delegationExpiry] = await vereavement.getRoleInfo(MEDIATOR_ROLE, user1.address);
        expect(hasRole).to.be.false;
        expect(isSuspended).to.be.false;
        expect(delegatedBy).to.equal(ethers.constants.AddressZero);
        expect(delegationExpiry).to.equal(0);
    });

    it("Should handle expired delegations correctly", async function () {
        await vereavement.connect(mediator).delegateRole(MEDIATOR_ROLE, user1.address, 3600);
        
        await ethers.provider.send("evm_increaseTime", [3601]);
        await ethers.provider.send("evm_mine");
        
        const [delegate, expiry, isActive] = await vereavement.getRoleDelegation(MEDIATOR_ROLE, mediator.address);
        expect(delegate).to.equal(user1.address);
        expect(isActive).to.be.false;
        expect(await vereavement.canActForRole(MEDIATOR_ROLE, user1.address)).to.be.false;
    });
}); 