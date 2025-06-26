const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigWallet", function () {
    let multiSigWallet;
    let owner, signer1, signer2, signer3, user;
    let initialSigners, weights, requiredWeight;

    beforeEach(async function () {
        [owner, signer1, signer2, signer3, user] = await ethers.getSigners();
        
        initialSigners = [signer1.address, signer2.address, signer3.address];
        weights = [1, 1, 1];
        requiredWeight = 2;

        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        multiSigWallet = await MultiSigWallet.deploy(initialSigners, weights, requiredWeight);
    });

    describe("Deployment", function () {
        it("Should deploy with correct initial configuration", async function () {
            expect(await multiSigWallet.getSignerCount()).to.equal(3n);
            expect(await multiSigWallet.totalWeight()).to.equal(3n);
            expect(await multiSigWallet.requiredWeight()).to.equal(2n);
        });

        it("Should set up signers correctly", async function () {
            const signerAddresses = await multiSigWallet.getSignerAddresses();
            expect(signerAddresses).to.deep.equal(initialSigners);
            
            for (let i = 0; i < initialSigners.length; i++) {
                const signer = await multiSigWallet.signers(initialSigners[i]);
                expect(signer.isActive).to.be.true;
                expect(signer.weight).to.equal(BigInt(weights[i]));
            }
        });

        it("Should grant correct roles", async function () {
            const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
            const executorRole = ethers.keccak256(ethers.toUtf8Bytes("EXECUTOR_ROLE"));
            
            expect(await multiSigWallet.hasRole(adminRole, owner.address)).to.be.true;
            expect(await multiSigWallet.hasRole(executorRole, owner.address)).to.be.true;
            
            for (const signer of initialSigners) {
                expect(await multiSigWallet.hasRole(executorRole, signer)).to.be.true;
            }
        });
    });

    describe("Transaction Management", function () {
        let transactionId;

        beforeEach(async function () {
            // Use a simple test transaction instead of mock contract
            const data = "0x"; // Empty data
            await multiSigWallet.connect(signer1).submitTransaction(
                user.address,
                0,
                data
            );
            transactionId = 1;
        });

        it("Should submit transaction successfully", async function () {
            const transaction = await multiSigWallet.getTransaction(transactionId);
            expect(transaction.target).to.equal(user.address);
            expect(transaction.value).to.equal(0n);
            expect(transaction.data).to.equal("0x");
            expect(transaction.executed).to.be.false;
            expect(transaction.confirmations).to.equal(1n); // Auto-confirmed by submitter
        });

        it("Should confirm transaction", async function () {
            await multiSigWallet.connect(signer2).confirmTransaction(transactionId);

            const transaction = await multiSigWallet.getTransaction(transactionId);
            expect(transaction.confirmations).to.equal(2n);
        });

        it("Should revoke confirmation", async function () {
            await multiSigWallet.connect(signer2).confirmTransaction(transactionId);
            await multiSigWallet.connect(signer2).revokeConfirmation(transactionId);

            const transaction = await multiSigWallet.getTransaction(transactionId);
            expect(transaction.confirmations).to.equal(1n);
        });

        it("Should execute transaction after timelock", async function () {
            await multiSigWallet.connect(signer2).confirmTransaction(transactionId);
            
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86400]); // 24 hours
            await ethers.provider.send("evm_mine");

            await multiSigWallet.connect(signer1).executeTransaction(transactionId);

            const transaction = await multiSigWallet.getTransaction(transactionId);
            expect(transaction.executed).to.be.true;
        });

        it("Should not execute transaction before timelock", async function () {
            await multiSigWallet.connect(signer2).confirmTransaction(transactionId);
            
            let error;
            try {
                await multiSigWallet.connect(signer1).executeTransaction(transactionId);
            } catch (e) {
                error = e;
            }
            expect(error).to.exist;
            expect(error.message).to.include("timelock not expired");
        });

        it("Should not execute transaction with insufficient confirmations", async function () {
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");

            let error;
            try {
                await multiSigWallet.connect(signer1).executeTransaction(transactionId);
            } catch (e) {
                error = e;
            }
            expect(error).to.exist;
            expect(error.message).to.include("insufficient confirmations");
        });
    });

    describe("Signer Management", function () {
        it("Should add new signer", async function () {
            await multiSigWallet.connect(owner).addSigner(user.address, 2);

            const signer = await multiSigWallet.signers(user.address);
            expect(signer.isActive).to.be.true;
            expect(signer.weight).to.equal(2n);
            expect(await multiSigWallet.totalWeight()).to.equal(5n);
        });

        it("Should remove signer", async function () {
            await multiSigWallet.connect(owner).removeSigner(signer3.address);

            const signer = await multiSigWallet.signers(signer3.address);
            expect(signer.isActive).to.be.false;
            expect(signer.weight).to.equal(0n);
            expect(await multiSigWallet.totalWeight()).to.equal(2n);
        });

        it("Should update signer weight", async function () {
            await multiSigWallet.connect(owner).updateSignerWeight(signer1.address, 3);

            const signer = await multiSigWallet.signers(signer1.address);
            expect(signer.weight).to.equal(3n);
            expect(await multiSigWallet.totalWeight()).to.equal(5n);
        });

        it("Should update required weight", async function () {
            await multiSigWallet.connect(owner).updateRequiredWeight(3);

            expect(await multiSigWallet.requiredWeight()).to.equal(3n);
        });
    });

    describe("Access Control", function () {
        it("Should only allow signers to submit transactions", async function () {
            const data = "0x";
            let error;
            try {
                await multiSigWallet.connect(user).submitTransaction(
                    user.address,
                    0,
                    data
                );
            } catch (e) {
                error = e;
            }
            expect(error).to.exist;
            expect(error.message).to.include("caller is not a signer");
        });

        it("Should only allow signers to confirm transactions", async function () {
            const data = "0x";
            await multiSigWallet.connect(signer1).submitTransaction(
                user.address,
                0,
                data
            );

            let error;
            try {
                await multiSigWallet.connect(user).confirmTransaction(1);
            } catch (e) {
                error = e;
            }
            expect(error).to.exist;
            expect(error.message).to.include("caller is not a signer");
        });

        it("Should only allow admin to add signers", async function () {
            let error;
            try {
                await multiSigWallet.connect(user).addSigner(user.address, 1);
            } catch (e) {
                error = e;
            }
            expect(error).to.exist;
            expect(error.message).to.include("AccessControl");
        });

        it("Should only allow admin to remove signers", async function () {
            let error;
            try {
                await multiSigWallet.connect(user).removeSigner(signer1.address);
            } catch (e) {
                error = e;
            }
            expect(error).to.exist;
            expect(error.message).to.include("AccessControl");
        });
    });

    describe("Edge Cases", function () {
        it("Should not allow duplicate confirmations", async function () {
            const data = "0x";
            await multiSigWallet.connect(signer1).submitTransaction(
                user.address,
                0,
                data
            );

            let error;
            try {
                await multiSigWallet.connect(signer1).confirmTransaction(1);
            } catch (e) {
                error = e;
            }
            expect(error).to.exist;
            expect(error.message).to.include("transaction already confirmed");
        });

        it("Should not allow revoking unconfirmed transaction", async function () {
            const data = "0x";
            await multiSigWallet.connect(signer1).submitTransaction(
                user.address,
                0,
                data
            );

            let error;
            try {
                await multiSigWallet.connect(signer2).revokeConfirmation(1);
            } catch (e) {
                error = e;
            }
            expect(error).to.exist;
            expect(error.message).to.include("transaction not confirmed");
        });

        it("Should not allow executing already executed transaction", async function () {
            const data = "0x";
            await multiSigWallet.connect(signer1).submitTransaction(
                user.address,
                0,
                data
            );

            await multiSigWallet.connect(signer2).confirmTransaction(1);
            
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");

            await multiSigWallet.connect(signer1).executeTransaction(1);
            
            let error;
            try {
                await multiSigWallet.connect(signer1).executeTransaction(1);
            } catch (e) {
                error = e;
            }
            expect(error).to.exist;
            expect(error.message).to.include("transaction already executed");
        });
    });

    describe("Emergency Functions", function () {
        it("Should allow admin to pause", async function () {
            await multiSigWallet.connect(owner).pause();
            expect(await multiSigWallet.paused()).to.be.true;
        });

        it("Should allow admin to unpause", async function () {
            await multiSigWallet.connect(owner).pause();
            await multiSigWallet.connect(owner).unpause();
            expect(await multiSigWallet.paused()).to.be.false;
        });

        it("Should allow emergency ETH withdrawal", async function () {
            // Send ETH to contract
            await owner.sendTransaction({
                to: multiSigWallet.target,
                value: ethers.parseEther("1.0")
            });

            const balanceBefore = await ethers.provider.getBalance(user.address);
            
            await multiSigWallet.connect(owner).emergencyWithdraw(
                ethers.ZeroAddress,
                user.address,
                ethers.parseEther("0.5")
            );

            const balanceAfter = await ethers.provider.getBalance(user.address);
            expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("0.5"));
        });
    });
}); 