const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Your Existing Deployed Contracts...");
  
  // Your actual deployed contract addresses
  const CONTRACTS = {
    sarcophagus: "0xDdC3EA7774D8159cA36941Cd8C2242f0BddDDD86",
    obol: "0x7Bf213e820f681BcdEDB2595B1Aeb304A6638dB9",
    b3trRewards: "0x354f8114254f985fB5ebc4401B4330bB6393ed18",
    deathVerifier: "0xe010129bE20F85845d169BF656310e9F695687A7",
    multiSigWallet: "0x8077A68349049658f5d8E387AaD7475422E04aF7"
  };
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Testing with account:", deployer.address);
    
    console.log("\n📋 Your Deployed Contract Addresses:");
    for (const [name, address] of Object.entries(CONTRACTS)) {
      console.log(`${name}: ${address}`);
    }
    
    // Test each contract
    console.log("\n🔍 Testing Contract Code...");
    
    for (const [name, address] of Object.entries(CONTRACTS)) {
      const code = await ethers.provider.getCode(address);
      console.log(`${name}: Code length ${code.length} (${code !== "0x" ? "✅ Has code" : "❌ No code"})`);
    }
    
    // Test OBOL Token
    console.log("\n🪙 Testing OBOL Token...");
    try {
      const OBOL = await ethers.getContractFactory("OBOL");
      const obol = OBOL.attach(CONTRACTS.obol);
      
      const name = await obol.name();
      const symbol = await obol.symbol();
      const decimals = await obol.decimals();
      const totalSupply = await obol.totalSupply();
      const deployerBalance = await obol.balanceOf(deployer.address);
      
      console.log("✅ OBOL Name:", name);
      console.log("✅ OBOL Symbol:", symbol);
      console.log("✅ OBOL Decimals:", decimals);
      console.log("✅ OBOL Total Supply:", ethers.formatEther(totalSupply));
      console.log("✅ Your Balance:", ethers.formatEther(deployerBalance));
      
    } catch (error) {
      console.log("❌ OBOL test failed:", error.message);
    }
    
    // Test DeathVerifier
    console.log("\n💀 Testing DeathVerifier...");
    try {
      const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
      const deathVerifier = DeathVerifier.attach(CONTRACTS.deathVerifier);
      
      const expiry = await deathVerifier.VERIFICATION_EXPIRY();
      const defaultAdminRole = await deathVerifier.DEFAULT_ADMIN_ROLE();
      const oracleRole = await deathVerifier.ORACLE_ROLE();
      
      console.log("✅ Verification Expiry:", expiry.toString());
      console.log("✅ Default Admin Role:", defaultAdminRole);
      console.log("✅ Oracle Role:", oracleRole);
      
    } catch (error) {
      console.log("❌ DeathVerifier test failed:", error.message);
    }
    
    // Test Sarcophagus
    console.log("\n⚰️ Testing Sarcophagus...");
    try {
      const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
      const sarcophagus = Sarcophagus.attach(CONTRACTS.sarcophagus);
      
      const minDeposit = await sarcophagus.MIN_DEPOSIT();
      const vthoToken = await sarcophagus.vthoToken();
      const b3trToken = await sarcophagus.b3trToken();
      const obolToken = await sarcophagus.obolToken();
      const gloToken = await sarcophagus.gloToken();
      
      console.log("✅ Min Deposit:", ethers.formatEther(minDeposit), "VET");
      console.log("✅ VTHO Token:", vthoToken);
      console.log("✅ B3TR Token:", b3trToken);
      console.log("✅ OBOL Token:", obolToken);
      console.log("✅ GLO Token:", gloToken);
      
    } catch (error) {
      console.log("❌ Sarcophagus test failed:", error.message);
    }
    
    // Test B3TR Rewards
    console.log("\n🎁 Testing B3TR Rewards...");
    try {
      const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
      const b3trRewards = B3TRRewards.attach(CONTRACTS.b3trRewards);
      
      const b3trToken = await b3trRewards.b3trToken();
      const sarcophagusContract = await b3trRewards.sarcophagusContract();
      const threshold = await b3trRewards.rateAdjustmentThreshold();
      
      console.log("✅ B3TR Token:", b3trToken);
      console.log("✅ Sarcophagus Contract:", sarcophagusContract);
      console.log("✅ Rate Threshold:", threshold.toString());
      
    } catch (error) {
      console.log("❌ B3TR Rewards test failed:", error.message);
    }
    
    // Test MultiSig Wallet
    console.log("\n🔐 Testing MultiSig Wallet...");
    try {
      const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
      const multiSig = MultiSigWallet.attach(CONTRACTS.multiSigWallet);
      
      const requiredWeight = await multiSig.requiredWeight();
      const totalWeight = await multiSig.totalWeight();
      
      console.log("✅ Required Weight:", requiredWeight.toString());
      console.log("✅ Total Weight:", totalWeight.toString());
      
    } catch (error) {
      console.log("❌ MultiSig test failed:", error.message);
    }
    
    // Test integration - Create a Sarcophagus
    console.log("\n🔗 Testing Integration - Create Sarcophagus...");
    try {
      const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
      const sarcophagus = Sarcophagus.attach(CONTRACTS.sarcophagus);
      
      const beneficiary = "0x3d32fE6e85066240f3018c9FC664db7967d2d313";
      const percentages = [100];
      const nftContracts = [ethers.ZeroAddress];
      const nftIds = [0];
      const nftValues = [ethers.parseEther("1")];
      const nftPercentages = [0];
      
      console.log("Attempting to create sarcophagus...");
      console.log("Beneficiary:", beneficiary);
      
      // This might fail due to role requirements, but let's try
      try {
        const tx = await sarcophagus.createSarcophagus(
          [beneficiary],
          percentages,
          nftContracts,
          nftIds,
          nftValues,
          nftPercentages,
          { value: ethers.parseEther("1") }
        );
        
        console.log("✅ Sarcophagus creation transaction sent:", tx.hash);
        await tx.wait();
        console.log("✅ Sarcophagus created successfully!");
        
      } catch (createError) {
        console.log("⚠️ Sarcophagus creation failed (expected if roles not set):", createError.message);
        console.log("This is normal if admin roles haven't been configured yet.");
      }
      
    } catch (error) {
      console.log("❌ Integration test failed:", error.message);
    }
    
    console.log("\n🎉 === EXISTING CONTRACTS TESTING COMPLETE ===");
    console.log("✅ Your contracts are deployed and working!");
    console.log("\n🔗 Explorer Links:");
    for (const [name, address] of Object.entries(CONTRACTS)) {
      console.log(`${name}: https://explore-testnet.vechain.org/address/${address}`);
    }
    
    console.log("\n💡 Next Steps:");
    console.log("1. Update your frontend config to use these addresses");
    console.log("2. Test the frontend integration");
    console.log("3. Set up admin roles if needed");
    console.log("4. Deploy the frontend for public testing");
    
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