const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Transaction Status...");
  
  const TX_HASH = "0x9478e18ffabca8f5c0ae39debe393736c0e3b4547dfc8eaff800ee09b94dee9f";
  const CONTRACT_ADDRESS = "0x50c4015792Eb129E0c4E58521b8eA633FF188198";
  
  try {
    const provider = ethers.provider;
    
    // Check transaction receipt
    console.log("📋 Checking transaction receipt...");
    const receipt = await provider.getTransactionReceipt(TX_HASH);
    
    if (receipt) {
      console.log("✅ Transaction found!");
      console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
      console.log("Block Number:", receipt.blockNumber);
      console.log("Gas Used:", receipt.gasUsed.toString());
      console.log("Contract Address:", receipt.contractAddress);
      
      if (receipt.status === 0) {
        console.log("❌ Transaction failed!");
        return;
      }
      
      if (receipt.contractAddress) {
        console.log("✅ Contract deployed to:", receipt.contractAddress);
        
        // Check if this matches our expected address
        if (receipt.contractAddress.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
          console.log("✅ Address matches expected address");
        } else {
          console.log("⚠️ Address doesn't match expected address");
          console.log("Expected:", CONTRACT_ADDRESS);
          console.log("Actual:", receipt.contractAddress);
        }
      }
    } else {
      console.log("❌ Transaction not found or still pending");
    }
    
    // Check current contract code
    console.log("\n🔍 Checking contract code...");
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log("Contract has code:", code !== "0x");
    console.log("Code length:", code.length);
    
    if (code !== "0x") {
      console.log("✅ Contract code found!");
      
      // Try to test the contract
      console.log("\n🧪 Testing contract...");
      try {
        const OBOL = await ethers.getContractFactory("OBOL");
        const obol = OBOL.attach(CONTRACT_ADDRESS);
        
        const name = await obol.name();
        console.log("✅ Contract Name:", name);
        
        const symbol = await obol.symbol();
        console.log("✅ Contract Symbol:", symbol);
        
        console.log("✅ Contract is working!");
      } catch (error) {
        console.log("❌ Contract test failed:", error.message);
      }
    } else {
      console.log("❌ No contract code found");
      
      // Check if there's a delay
      console.log("\n⏳ Checking if there's a delay...");
      console.log("Sometimes VeChain has delays in state updates.");
      console.log("Try checking again in a few minutes.");
    }
    
    // Check recent blocks for any contract creation
    console.log("\n📋 Checking recent blocks for contract creation...");
    const blockNumber = await provider.getBlockNumber();
    console.log("Current block:", blockNumber);
    
    // Check the last few blocks
    for (let i = 0; i < 10; i++) {
      try {
        const block = await provider.getBlock(blockNumber - i);
        if (block && block.transactions.length > 0) {
          console.log(`Block ${blockNumber - i}: ${block.transactions.length} transactions`);
          
          // Check if any transaction created a contract
          for (const txHash of block.transactions) {
            const txReceipt = await provider.getTransactionReceipt(txHash);
            if (txReceipt && txReceipt.contractAddress) {
              console.log(`  Contract created: ${txReceipt.contractAddress}`);
            }
          }
        }
      } catch (error) {
        // Skip blocks that can't be accessed
      }
    }
    
    console.log("\n🔗 Explorer Links:");
    console.log("Transaction: https://explore-testnet.vechain.org/tx/" + TX_HASH);
    console.log("Contract: https://explore-testnet.vechain.org/address/" + CONTRACT_ADDRESS);
    
  } catch (error) {
    console.error("❌ Error checking transaction:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 