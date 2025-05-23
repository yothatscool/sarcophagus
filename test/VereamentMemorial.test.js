const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    deployTestContracts,
    SECONDS_PER_DAY
} = require("./helpers/testHelpers");

describe("Vereavement Memorial System", function () {
    let contracts;
    let owner;
    let user1;
    let user2;
    let mockVNSResolver;

    beforeEach(async function () {
        contracts = await deployTestContracts();
        owner = contracts.owner;
        [user1, user2] = contracts.addrs;
        mockVNSResolver = contracts.mockVNSResolver;

        // Register user
        await contracts.vereavement.connect(user1).registerUser(
            [user2.address],
            [10000],
            [0],
            [false],
            [""]
        );
    });

    describe("VeChain Name Service Integration", function () {
        it("Should set VNS name", async function () {
            const vnsName = "user1.vns";
            await contracts.vereavement.connect(user1).setVNSName(vnsName);
            
            const storedName = await contracts.vereavement.getVNSName(user1.address);
            expect(storedName).to.equal(vnsName);
        });

        it("Should resolve VNS name to address", async function () {
            const vnsName = "user1.vns";
            await contracts.vereavement.connect(user1).setVNSName(vnsName);
            
            const resolvedAddress = await mockVNSResolver.resolve(vnsName);
            expect(resolvedAddress).to.equal(user1.address);
        });

        it("Should update VNS name", async function () {
            const oldName = "old.vns";
            const newName = "new.vns";
            
            await contracts.vereavement.connect(user1).setVNSName(oldName);
            await contracts.vereavement.connect(user1).setVNSName(newName);
            
            const storedName = await contracts.vereavement.getVNSName(user1.address);
            expect(storedName).to.equal(newName);
        });
    });

    describe("Memorial System", function () {
        it("Should preserve memorial", async function () {
            const memorialHash = "QmTest123";
            await contracts.vereavement.connect(user1).preserveMemorial(memorialHash);
            
            const memorials = await contracts.vereavement.getMemorials(user1.address);
            expect(memorials).to.include(memorialHash);
        });

        it("Should preserve multiple memorials", async function () {
            const hashes = ["QmTest1", "QmTest2", "QmTest3"];
            
            for (const hash of hashes) {
                await contracts.vereavement.connect(user1).preserveMemorial(hash);
            }
            
            const memorials = await contracts.vereavement.getMemorials(user1.address);
            expect(memorials).to.have.members(hashes);
        });

        it("Should add final message", async function () {
            const message = "My final words";
            await contracts.vereavement.connect(user1).addFinalMessage(message);
            
            // Only accessible after death
            await contracts.vereavement.connect(owner).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);
            
            const messages = await contracts.vereavement.getFinalMessages(user1.address);
            expect(messages[0]).to.equal(message);
        });

        it("Should only allow authorized access to final messages", async function () {
            const message = "My final words";
            await contracts.vereavement.connect(user1).addFinalMessage(message);
            
            // Not deceased yet
            await expect(
                contracts.vereavement.connect(user2).getFinalMessages(user1.address)
            ).to.be.revertedWith("User not deceased");
            
            // Confirm death
            await contracts.vereavement.connect(owner).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);
            
            // Only beneficiary or admin can access
            await expect(
                contracts.vereavement.connect(user2).getFinalMessages(user1.address)
            ).to.not.be.reverted;
            
            // Random user cannot access
            const [randomUser] = await ethers.getSigners();
            await expect(
                contracts.vereavement.connect(randomUser).getFinalMessages(user1.address)
            ).to.be.revertedWith("Not authorized");
        });
    });

    describe("Memorial Integration with Ritual System", function () {
        it("Should increase ritual value when preserving memorials", async function () {
            await contracts.vereavement.connect(user1).createRitualVault();
            const initialValue = await contracts.ritualEngine.getRitualValue(user1.address);
            
            await contracts.vereavement.connect(user1).preserveMemorial("QmTest123");
            
            const newValue = await contracts.ritualEngine.getRitualValue(user1.address);
            expect(newValue).to.be.gt(initialValue);
        });

        it("Should track memorial preservation in activity history", async function () {
            await contracts.vereavement.connect(user1).preserveMemorial("QmTest123");
            
            const history = await contracts.vereavement.getActivityHistory(user1.address);
            expect(history[history.length - 1].proofType).to.equal("MEMORIAL_PRESERVED");
        });
    });

    describe("Emergency Access System", function () {
        it("Should allow emergency contact to access memorials", async function () {
            const emergencyContact = user2;
            await contracts.vereavement.connect(user1).setEmergencyContact(emergencyContact.address);
            
            await contracts.vereavement.connect(user1).preserveMemorial("QmEmergencyTest");
            
            const memorials = await contracts.vereavement.connect(emergencyContact).getMemorials(user1.address);
            expect(memorials).to.have.lengthOf(1);
        });

        it("Should allow emergency contact to verify activity", async function () {
            const emergencyContact = user2;
            await contracts.vereavement.connect(user1).setEmergencyContact(emergencyContact.address);
            
            await contracts.vereavement.connect(emergencyContact).addActivityProof(
                user1.address,
                "EMERGENCY_CHECK",
                "Emergency welfare check completed"
            );
            
            const history = await contracts.vereavement.getActivityHistory(user1.address);
            expect(history[history.length - 1].proofType).to.equal("EMERGENCY_CHECK");
        });
    });
}); 