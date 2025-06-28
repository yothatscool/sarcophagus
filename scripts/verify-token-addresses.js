const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying token addresses on VeChain Testnet...\n");

  // Testnet token addresses
  const B3TR_ADDRESS = "0x5ef79995FE8a89e0812330E4378eB2660ceDe699";
  const VTHO_ADDRESS = "0x0000000000000000000000000000456E65726779";
  const GLO_ADDRESS = "0x29c630cCe4DdB23900f5Fe66Ab55e488C15b9F5e";

  // Basic ERC20 ABI for checking token info
  const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)"
  ];

  try {
    // Connect to testnet
    const provider = new ethers.JsonRpcProvider("https://testnet.vechain.energy");
    
    console.log("📡 Connected to VeChain Testnet");
    console.log("🔗 RPC URL: https://testnet.vechain.energy\n");

    // Check B3TR Token
    console.log("🔍 Checking B3TR Token...");
    try {
      const b3trContract = new ethers.Contract(B3TR_ADDRESS, ERC20_ABI, provider);
      const b3trName = await b3trContract.name();
      const b3trSymbol = await b3trContract.symbol();
      const b3trDecimals = await b3trContract.decimals();
      const b3trSupply = await b3trContract.totalSupply();
      
      console.log(`✅ B3TR Token verified:`);
      console.log(`   Name: ${b3trName}`);
      console.log(`   Symbol: ${b3trSymbol}`);
      console.log(`   Decimals: ${b3trDecimals}`);
      console.log(`   Total Supply: ${ethers.formatUnits(b3trSupply, b3trDecimals)} ${b3trSymbol}`);
      console.log(`   Address: ${B3TR_ADDRESS}\n`);
    } catch (error) {
      console.log(`❌ B3TR Token verification failed: ${error.message}\n`);
    }

    // Check VTHO Token
    console.log("🔍 Checking VTHO Token...");
    try {
      const vthoContract = new ethers.Contract(VTHO_ADDRESS, ERC20_ABI, provider);
      const vthoName = await vthoContract.name();
      const vthoSymbol = await vthoContract.symbol();
      const vthoDecimals = await vthoContract.decimals();
      const vthoSupply = await vthoContract.totalSupply();
      
      console.log(`✅ VTHO Token verified:`);
      console.log(`   Name: ${vthoName}`);
      console.log(`   Symbol: ${vthoSymbol}`);
      console.log(`   Decimals: ${vthoDecimals}`);
      console.log(`   Total Supply: ${ethers.formatUnits(vthoSupply, vthoDecimals)} ${vthoSymbol}`);
      console.log(`   Address: ${VTHO_ADDRESS}\n`);
    } catch (error) {
      console.log(`❌ VTHO Token verification failed: ${error.message}\n`);
    }

    // Check GLO Token
    console.log("🔍 Checking GLO Token...");
    try {
      const gloContract = new ethers.Contract(GLO_ADDRESS, ERC20_ABI, provider);
      const gloName = await gloContract.name();
      const gloSymbol = await gloContract.symbol();
      const gloDecimals = await gloContract.decimals();
      const gloSupply = await gloContract.totalSupply();
      
      console.log(`✅ GLO Token verified:`);
      console.log(`   Name: ${gloName}`);
      console.log(`   Symbol: ${gloSymbol}`);
      console.log(`   Decimals: ${gloDecimals}`);
      console.log(`   Total Supply: ${ethers.formatUnits(gloSupply, gloDecimals)} ${gloSymbol}`);
      console.log(`   Address: ${GLO_ADDRESS}\n`);
    } catch (error) {
      console.log(`❌ GLO Token verification failed: ${error.message}\n`);
    }

    console.log("🎉 Token address verification complete!");
    console.log("\n📋 Summary:");
    console.log(`   B3TR: ${B3TR_ADDRESS}`);
    console.log(`   VTHO: ${VTHO_ADDRESS}`);
    console.log(`   GLO: ${GLO_ADDRESS}`);
    console.log("\n✅ All token addresses are ready for deployment!");

  } catch (error) {
    console.error("❌ Token verification failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 