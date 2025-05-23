const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
    deployTestContracts,
    SECONDS_PER_DAY,
    SECONDS_PER_MONTH,
    SECONDS_PER_YEAR
} = require("./helpers/testHelpers");

describe("Vereavement Vesting System", function () {
    let contracts;
    let owner;
    let user1;
    let user2;
    let guardian;
    let oracle;

    beforeEach(async function () {
        contracts = await deployTestContracts();
        owner = contracts.owner;
        [user1, user2, guardian, oracle] = contracts.addrs;

        // Setup oracle role
        await contracts.vereavement.grantRole(
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ROLE")),
            oracle.address
        );

        // Register user with initial setup
        await contracts.vereavement.connect(user1).registerUser(
            [user2.address],
            [10000],
            [0],
            [false],
            [""]
        );
    });

    describe("Age-based Vesting", function () {
        it("Should set up age-based vesting", async function () {
            const fullAccessAge = 21;
            const monthlyAllowance = ethers.utils.parseEther("1");
            
            await contracts.vereavement.connect(user1).setAgeBasedVesting(
                user2.address,
                fullAccessAge,
                monthlyAllowance,
                guardian.address
            );
            
            const vesting = await contracts.vereavement.getAgeVesting(user1.address, user2.address);
            expect(vesting.fullAccessAge).to.equal(fullAccessAge);
            expect(vesting.monthlyAllowance).to.equal(monthlyAllowance);
            expect(vesting.guardian).to.equal(guardian.address);
        });

        it("Should enforce age restrictions on withdrawals", async function () {
            // Setup vesting
            await contracts.vereavement.connect(user1).setAgeBasedVesting(
                user2.address,
                21,
                ethers.utils.parseEther("1"),
                guardian.address
            );

            // Fund vault
            await contracts.vereavement.connect(user1).depositVET({ value: ethers.utils.parseEther("10") });

            // Confirm death
            await contracts.vereavement.connect(oracle).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);

            // Set beneficiary age to 18
            await contracts.vereavement.connect(oracle).verifyAge(
                user2.address,
                2005, // 18 years old
                ethers.utils.formatBytes32String("proof")
            );

            // Try to withdraw full amount
            await expect(
                contracts.vereavement.connect(user2).payoutVault(user1.address, ethers.constants.AddressZero)
            ).to.be.revertedWith("Age restriction applies");

            // Should allow monthly allowance
            await contracts.vereavement.connect(user2).claimMonthlyAllowance(user1.address);
            const balance = await ethers.provider.getBalance(user2.address);
            expect(balance).to.be.gt(0);
        });

        it("Should allow guardian to manage funds", async function () {
            await contracts.vereavement.connect(user1).setAgeBasedVesting(
                user2.address,
                21,
                ethers.utils.parseEther("1"),
                guardian.address
            );

            await contracts.vereavement.connect(user1).depositVET({ value: ethers.utils.parseEther("10") });
            await contracts.vereavement.connect(oracle).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);

            // Guardian can withdraw
            await contracts.vereavement.connect(guardian).guardianWithdraw(
                user1.address,
                user2.address,
                ethers.utils.parseEther("1")
            );

            const balance = await contracts.vereavement.getGuardianBalance(user1.address, user2.address);
            expect(balance).to.equal(ethers.utils.parseEther("1"));
        });
    });

    describe("Milestone-based Releases", function () {
        it("Should add milestone condition", async function () {
            const milestone = {
                description: "Graduate college",
                amount: ethers.utils.parseEther("5"),
                oracleKey: ethers.utils.formatBytes32String("GRADUATION")
            };

            await contracts.vereavement.connect(user1).addMilestone(
                user2.address,
                milestone.description,
                milestone.amount,
                milestone.oracleKey
            );

            const milestones = await contracts.vereavement.getMilestones(user1.address, user2.address);
            expect(milestones.descriptions[0]).to.equal(milestone.description);
            expect(milestones.amounts[0]).to.equal(milestone.amount);
        });

        it("Should achieve milestone and release funds", async function () {
            // Add milestone
            const milestone = {
                description: "Graduate college",
                amount: ethers.utils.parseEther("5"),
                oracleKey: ethers.utils.formatBytes32String("GRADUATION")
            };

            await contracts.vereavement.connect(user1).addMilestone(
                user2.address,
                milestone.description,
                milestone.amount,
                milestone.oracleKey
            );

            // Fund vault
            await contracts.vereavement.connect(user1).depositVET({ value: ethers.utils.parseEther("10") });

            // Confirm death
            await contracts.vereavement.connect(oracle).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);

            // Achieve milestone
            await contracts.vereavement.connect(oracle).achieveMilestone(
                user1.address,
                user2.address,
                0, // first milestone
                ethers.utils.formatBytes32String("proof")
            );

            // Verify milestone achieved
            const milestones = await contracts.vereavement.getMilestones(user1.address, user2.address);
            expect(milestones.achievements[0]).to.be.true;

            // Claim milestone funds
            await contracts.vereavement.connect(user2).claimMilestone(
                user1.address,
                0,
                ethers.constants.AddressZero
            );

            const balance = await ethers.provider.getBalance(user2.address);
            expect(balance).to.be.gt(0);
        });

        it("Should handle multiple milestones", async function () {
            const milestones = [
                {
                    description: "Graduate high school",
                    amount: ethers.utils.parseEther("1"),
                    oracleKey: ethers.utils.formatBytes32String("HIGH_SCHOOL")
                },
                {
                    description: "Graduate college",
                    amount: ethers.utils.parseEther("2"),
                    oracleKey: ethers.utils.formatBytes32String("COLLEGE")
                },
                {
                    description: "Get first job",
                    amount: ethers.utils.parseEther("2"),
                    oracleKey: ethers.utils.formatBytes32String("JOB")
                }
            ];

            // Add milestones
            for (const milestone of milestones) {
                await contracts.vereavement.connect(user1).addMilestone(
                    user2.address,
                    milestone.description,
                    milestone.amount,
                    milestone.oracleKey
                );
            }

            // Fund vault
            await contracts.vereavement.connect(user1).depositVET({ value: ethers.utils.parseEther("10") });

            // Confirm death
            await contracts.vereavement.connect(oracle).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);

            // Achieve milestones in sequence
            for (let i = 0; i < milestones.length; i++) {
                await contracts.vereavement.connect(oracle).achieveMilestone(
                    user1.address,
                    user2.address,
                    i,
                    ethers.utils.formatBytes32String(`proof${i}`)
                );

                await contracts.vereavement.connect(user2).claimMilestone(
                    user1.address,
                    i,
                    ethers.constants.AddressZero
                );
            }

            // Verify all milestones achieved
            const achievedMilestones = await contracts.vereavement.getMilestones(user1.address, user2.address);
            expect(achievedMilestones.achievements).to.deep.equal([true, true, true]);
        });
    });

    describe("Combined Vesting Scenarios", function () {
        it("Should handle age-based vesting with milestones", async function () {
            // Setup age-based vesting
            await contracts.vereavement.connect(user1).setAgeBasedVesting(
                user2.address,
                21,
                ethers.utils.parseEther("1"),
                guardian.address
            );

            // Add milestone
            await contracts.vereavement.connect(user1).addMilestone(
                user2.address,
                "Graduate college",
                ethers.utils.parseEther("5"),
                ethers.utils.formatBytes32String("GRADUATION")
            );

            // Fund vault
            await contracts.vereavement.connect(user1).depositVET({ value: ethers.utils.parseEther("10") });

            // Confirm death
            await contracts.vereavement.connect(oracle).confirmDeath(user1.address);
            await time.increase(30 * SECONDS_PER_DAY);

            // Set age to 18
            await contracts.vereavement.connect(oracle).verifyAge(
                user2.address,
                2005,
                ethers.utils.formatBytes32String("proof")
            );

            // Should allow monthly allowance but not milestone claim
            await contracts.vereavement.connect(user2).claimMonthlyAllowance(user1.address);
            await expect(
                contracts.vereavement.connect(user2).claimMilestone(
                    user1.address,
                    0,
                    ethers.constants.AddressZero
                )
            ).to.be.revertedWith("Milestone not achieved");

            // Achieve milestone
            await contracts.vereavement.connect(oracle).achieveMilestone(
                user1.address,
                user2.address,
                0,
                ethers.utils.formatBytes32String("proof")
            );

            // Should now allow milestone claim
            await contracts.vereavement.connect(user2).claimMilestone(
                user1.address,
                0,
                ethers.constants.AddressZero
            );
        });
    });
}); 