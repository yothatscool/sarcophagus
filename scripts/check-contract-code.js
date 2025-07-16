const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Contract Code on VeChain Testnet...");
  
  const CONTRACT_ADDRESS = "0x50c4015792Eb129E0c4E58521b8eA633FF188198";
  
  try {
    const provider = ethers.provider;
    
    // Check if the address has code
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log("Contract has code:", code !== "0x");
    console.log("Code length:", code.length);
    
    if (code === "0x") {
      console.log("❌ No contract code found at this address!");
      return;
    }
    
    // Try to get the contract name by checking different interfaces
    console.log("\n🔍 Attempting to identify contract type...");
    
    const contracts = [
      { name: "DeathVerifier", factory: "DeathVerifier" },
      { name: "Sarcophagus", factory: "Sarcophagus" },
      { name: "OBOL", factory: "OBOL" },
      { name: "B3TRRewards", factory: "B3TRRewards" },
      { name: "MultiSigWallet", factory: "MultiSigWallet" }
    ];
    
    for (const contract of contracts) {
      try {
        console.log(`\nTesting ${contract.name}...`);
        const ContractFactory = await ethers.getContractFactory(contract.factory);
        const contractInstance = ContractFactory.attach(CONTRACT_ADDRESS);
        
        // Try a simple call that should work for any contract
        if (contract.name === "OBOL") {
          const name = await contractInstance.name();
          console.log(`✅ ${contract.name} - Name: ${name}`);
        } else if (contract.name === "DeathVerifier") {
          const expiry = await contractInstance.VERIFICATION_EXPIRY();
          console.log(`✅ ${contract.name} - Verification Expiry: ${expiry.toString()}`);
        } else if (contract.name === "Sarcophagus") {
          const minDeposit = await contractInstance.MIN_DEPOSIT();
          console.log(`✅ ${contract.name} - Min Deposit: ${ethers.formatEther(minDeposit)} VET`);
        } else if (contract.name === "B3TRRewards") {
          const threshold = await contractInstance.rateAdjustmentThreshold();
          console.log(`✅ ${contract.name} - Rate Threshold: ${threshold.toString()}`);
        } else if (contract.name === "MultiSigWallet") {
          const requiredWeight = await contractInstance.requiredWeight();
          console.log(`✅ ${contract.name} - Required Weight: ${requiredWeight.toString()}`);
        }
        
        console.log(`✅ ${contract.name} interface works!`);
        break;
        
      } catch (error) {
        console.log(`❌ ${contract.name} failed: ${error.message}`);
      }
    }
    
    // Check transaction history
    console.log("\n📋 Checking recent transactions...");
    try {
      const blockNumber = await provider.getBlockNumber();
      console.log("Current block:", blockNumber);
      
      // Get the last few blocks to see if there are transactions
      for (let i = 0; i < 5; i++) {
        const block = await provider.getBlock(blockNumber - i);
        if (block && block.transactions.length > 0) {
          console.log(`Block ${blockNumber - i} has ${block.transactions.length} transactions`);
        }
      }
    } catch (error) {
      console.log("Could not check transaction history:", error.message);
    }
    
    console.log("\n🔗 Contract Explorer Link:");
    console.log(`https://explore-testnet.vechain.org/address/${CONTRACT_ADDRESS}`);
    
  } catch (error) {
    console.error("❌ Error checking contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 