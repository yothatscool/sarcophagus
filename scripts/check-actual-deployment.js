const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Actual Deployed Contract...");
  
  // The actual deployed address from the transaction receipt
  const ACTUAL_ADDRESS = "0x4d8aD598C9bEE4B2eb165b70F652051DE2e6d85D";
  const TX_HASH = "0x2c6833054dbb944b3baf59123224833d9536be3c0057e2aff07e118ddf8215c5";
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Checking with account:", deployer.address);
    
    console.log("\n📋 Actual Deployed Address:", ACTUAL_ADDRESS);
    console.log("Transaction Hash:", TX_HASH);
    
    // Check if contract has code
    console.log("\n🔍 Checking contract code...");
    const code = await ethers.provider.getCode(ACTUAL_ADDRESS);
    console.log("Contract code length:", code.length);
    console.log("Has code:", code !== "0x");
    
    if (code === "0x" || code.length < 100) {
      console.log("❌ No contract code found at actual address!");
      return;
    }
    
    // Test the contract
    console.log("\n🧪 Testing actual deployed contract...");
    
    try {
      const OBOL = await ethers.getContractFactory("OBOL");
      const obol = OBOL.attach(ACTUAL_ADDRESS);
      
      const name = await obol.name();
      const symbol = await obol.symbol();
      const decimals = await obol.decimals();
      const totalSupply = await obol.totalSupply();
      
      console.log("✅ Contract Name:", name);
      console.log("✅ Contract Symbol:", symbol);
      console.log("✅ Contract Decimals:", decimals);
      console.log("✅ Total Supply:", ethers.formatEther(totalSupply));
      
      console.log("✅ Contract is working at the actual address!");
      
    } catch (error) {
      console.log("❌ Contract test failed:", error.message);
    }
    
    // Check transaction receipt details
    console.log("\n📋 Transaction Receipt Details:");
    const receipt = await ethers.provider.getTransactionReceipt(TX_HASH);
    
    if (receipt) {
      console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
      console.log("Block Number:", receipt.blockNumber);
      console.log("Gas Used:", receipt.gasUsed.toString());
      console.log("Contract Address from Receipt:", receipt.contractAddress);
      console.log("Expected Address (from Hardhat):", "0x50c4015792Eb129E0c4E58521b8eA633FF188198");
      console.log("Actual Address (from Receipt):", receipt.contractAddress);
      
      if (receipt.contractAddress && receipt.contractAddress !== "0x50c4015792Eb129E0c4E58521b8eA633FF188198") {
        console.log("⚠️ Address mismatch detected!");
        console.log("This suggests VeChain calculates addresses differently than expected.");
      }
    }
    
    // Check if there are multiple contracts deployed
    console.log("\n🔍 Checking for multiple deployments...");
    
    // Check the expected address too
    const expectedAddress = "0x50c4015792Eb129E0c4E58521b8eA633FF188198";
    const expectedCode = await ethers.provider.getCode(expectedAddress);
    console.log("Expected address code length:", expectedCode.length);
    
    // Check a few other possible addresses
    for (let i = 0; i < 5; i++) {
      const nonce = await ethers.provider.getTransactionCount(deployer.address);
      const possibleAddress = ethers.getCreateAddress({
        from: deployer.address,
        nonce: nonce - i
      });
      
      const possibleCode = await ethers.provider.getCode(possibleAddress);
      if (possibleCode !== "0x" && possibleCode.length > 100) {
        console.log(`Found contract at nonce ${nonce - i}: ${possibleAddress} (${possibleCode.length} bytes)`);
      }
    }
    
    console.log("\n💡 Analysis:");
    console.log("1. The transaction succeeded and deployed a contract");
    console.log("2. But it's at a different address than Hardhat expected");
    console.log("3. This might be a VeChain-specific address calculation issue");
    console.log("4. The contract might actually be working at the actual address");
    
    console.log("\n🔗 Explorer Links:");
    console.log("Actual Contract: https://explore-testnet.vechain.org/address/" + ACTUAL_ADDRESS);
    console.log("Transaction: https://explore-testnet.vechain.org/tx/" + TX_HASH);
    
  } catch (error) {
    console.error("❌ Check failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 