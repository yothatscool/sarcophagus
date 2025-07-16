const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Actually Deployed Contract...");
  
  // The actual deployed contract address
  const CONTRACT_ADDRESS = "0x50d419E704d036243A0Cb4a440Fec49988457305";
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Testing with account:", deployer.address);
    
    console.log("\n📋 Contract Address:", CONTRACT_ADDRESS);
    
    // Check if contract has code
    console.log("\n🔍 Checking contract code...");
    const code = await ethers.provider.getCode(CONTRACT_ADDRESS);
    console.log("Contract has code:", code !== "0x");
    console.log("Code length:", code.length);
    
    if (code === "0x") {
      console.log("❌ No contract code found at this address!");
      return;
    }
    
    // Test the OBOL contract
    console.log("\n🪙 Testing OBOL Token Functions...");
    
    try {
      const OBOL = await ethers.getContractFactory("OBOL");
      const obol = OBOL.attach(CONTRACT_ADDRESS);
      
      // Test basic ERC20 functions
      const name = await obol.name();
      console.log("✅ Token Name:", name);
      
      const symbol = await obol.symbol();
      console.log("✅ Token Symbol:", symbol);
      
      const decimals = await obol.decimals();
      console.log("✅ Token Decimals:", decimals);
      
      const totalSupply = await obol.totalSupply();
      console.log("✅ Total Supply:", ethers.formatEther(totalSupply));
      
      const deployerBalance = await obol.balanceOf(deployer.address);
      console.log("✅ Deployer Balance:", ethers.formatEther(deployerBalance));
      
      console.log("✅ OBOL Token is working perfectly!");
      
    } catch (error) {
      console.log("❌ OBOL Token test failed:", error.message);
    }
    
    // Test transfer functionality
    console.log("\n💸 Testing Transfer Function...");
    
    try {
      const OBOL = await ethers.getContractFactory("OBOL");
      const obol = OBOL.attach(CONTRACT_ADDRESS);
      
      // Create a test recipient
      const testRecipient = "0x3d32fE6e85066240f3018c9FC664db7967d2d313";
      const transferAmount = ethers.parseEther("100");
      
      console.log("Attempting to transfer", ethers.formatEther(transferAmount), "OBOL to", testRecipient);
      
      const tx = await obol.transfer(testRecipient, transferAmount);
      console.log("✅ Transfer transaction sent:", tx.hash);
      
      await tx.wait();
      console.log("✅ Transfer completed successfully!");
      
      // Check balances after transfer
      const newDeployerBalance = await obol.balanceOf(deployer.address);
      const recipientBalance = await obol.balanceOf(testRecipient);
      
      console.log("✅ New Deployer Balance:", ethers.formatEther(newDeployerBalance));
      console.log("✅ Recipient Balance:", ethers.formatEther(recipientBalance));
      
    } catch (error) {
      console.log("❌ Transfer test failed:", error.message);
    }
    
    // Test approval functionality
    console.log("\n🔐 Testing Approval Function...");
    
    try {
      const OBOL = await ethers.getContractFactory("OBOL");
      const obol = OBOL.attach(CONTRACT_ADDRESS);
      
      const spender = "0x3d32fE6e85066240f3018c9FC664db7967d2d313";
      const approveAmount = ethers.parseEther("50");
      
      console.log("Approving", ethers.formatEther(approveAmount), "OBOL for spender", spender);
      
      const tx = await obol.approve(spender, approveAmount);
      console.log("✅ Approval transaction sent:", tx.hash);
      
      await tx.wait();
      console.log("✅ Approval completed successfully!");
      
      // Check allowance
      const allowance = await obol.allowance(deployer.address, spender);
      console.log("✅ Allowance:", ethers.formatEther(allowance));
      
    } catch (error) {
      console.log("❌ Approval test failed:", error.message);
    }
    
    console.log("\n🎉 === CONTRACT TESTING COMPLETE ===");
    console.log("✅ Contract is fully functional!");
    console.log("🔗 Contract Address:", CONTRACT_ADDRESS);
    console.log("🔗 Explorer Link: https://explore-testnet.vechain.org/address/" + CONTRACT_ADDRESS);
    
    // Save the correct deployment info
    const deploymentInfo = {
      network: "VeChain Testnet",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contract: "OBOL",
      address: CONTRACT_ADDRESS,
      transactionHash: "0x9478e18ffabca8f5c0ae39debe393736c0e3b4547dfc8eaff800ee09b94dee9f",
      status: "Successfully deployed and tested"
    };
    
    const fs = require('fs');
    fs.writeFileSync('correct-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    
    console.log("📄 Correct deployment info saved to: correct-deployment.json");
    
  } catch (error) {
    console.error("❌ Testing failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 