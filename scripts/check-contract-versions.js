const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Contract Versions and Patches...");
  
  // Your deployed contract addresses
  const CONTRACTS = {
    sarcophagus: "0xDdC3EA7774D8159cA36941Cd8C2242f0BddDDD86",
    obol: "0x7Bf213e820f681BcdEDB2595B1Aeb304A6638dB9",
    b3trRewards: "0x354f8114254f985fB5ebc4401B4330bB6393ed18",
    deathVerifier: "0xe010129bE20F85845d169BF656310e9F695687A7",
    multiSigWallet: "0x8077A68349049658f5d8E387AaD7475422E04aF7"
  };
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Checking with account:", deployer.address);
    
    console.log("\n📋 Checking for Today's Patches...");
    
    // Test 1: Check Sarcophagus for GLO conversion fixes
    console.log("\n⚰️ Testing Sarcophagus GLO Conversion...");
    try {
      const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
      const sarcophagus = Sarcophagus.attach(CONTRACTS.sarcophagus);
      
      // Check if the contract has the updated GLO conversion logic
      // This would be a function that allows any-to-any conversions
      const contractCode = await ethers.provider.getCode(CONTRACTS.sarcophagus);
      
      // Check for specific function signatures that indicate the updated version
      const hasGloConversion = contractCode.includes("convertGLO") || 
                              contractCode.includes("convertToken") ||
                              contractCode.includes("swapGLO");
      
      console.log("✅ Contract has GLO conversion functions:", hasGloConversion);
      
      // Try to call the GLO conversion function (this might fail if it doesn't exist)
      try {
        // This is a test call to see if the function exists
        const interface = new ethers.Interface([
          "function convertGLO(address fromToken, address toToken, uint256 amount) external returns (uint256)"
        ]);
        
        // Just check if the function signature exists in the contract
        const hasFunction = contractCode.includes(ethers.id("convertGLO(address,address,uint256)").slice(0, 10));
        console.log("✅ Has convertGLO function:", hasFunction);
        
      } catch (error) {
        console.log("❌ GLO conversion function not found (old version)");
      }
      
    } catch (error) {
      console.log("❌ Sarcophagus test failed:", error.message);
    }
    
    // Test 2: Check for security patches
    console.log("\n🔒 Testing Security Patches...");
    try {
      const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
      const sarcophagus = Sarcophagus.attach(CONTRACTS.sarcophagus);
      
      // Check for reentrancy protection
      const contractCode = await ethers.provider.getCode(CONTRACTS.sarcophagus);
      const hasReentrancyGuard = contractCode.includes("ReentrancyGuard") || 
                                contractCode.includes("nonReentrant");
      
      console.log("✅ Has reentrancy protection:", hasReentrancyGuard);
      
      // Check for pause functionality
      const hasPauseFunction = contractCode.includes("pause") || 
                              contractCode.includes("unpause");
      
      console.log("✅ Has pause functionality:", hasPauseFunction);
      
    } catch (error) {
      console.log("❌ Security test failed:", error.message);
    }
    
    // Test 3: Check B3TR Rewards for bonus system
    console.log("\n🎁 Testing B3TR Rewards Bonus System...");
    try {
      const B3TRRewards = await ethers.getContractFactory("B3TRRewards");
      const b3trRewards = B3TRRewards.attach(CONTRACTS.b3trRewards);
      
      const contractCode = await ethers.provider.getCode(CONTRACTS.b3trRewards);
      
      // Check for bonus system functions
      const hasBonusSystem = contractCode.includes("bonusMultiplier") || 
                            contractCode.includes("calculateBonus") ||
                            contractCode.includes("bonusThreshold");
      
      console.log("✅ Has bonus system:", hasBonusSystem);
      
      // Try to call bonus-related functions
      try {
        const bonusMultiplier = await b3trRewards.bonusMultiplier();
        console.log("✅ Bonus multiplier:", bonusMultiplier.toString());
      } catch (error) {
        console.log("❌ Bonus multiplier not found (old version)");
      }
      
    } catch (error) {
      console.log("❌ B3TR Rewards test failed:", error.message);
    }
    
    // Test 4: Check DeathVerifier for enhanced verification
    console.log("\n💀 Testing DeathVerifier Enhanced Features...");
    try {
      const DeathVerifier = await ethers.getContractFactory("DeathVerifier");
      const deathVerifier = DeathVerifier.attach(CONTRACTS.deathVerifier);
      
      const contractCode = await ethers.provider.getCode(CONTRACTS.deathVerifier);
      
      // Check for enhanced verification features
      const hasEnhancedVerification = contractCode.includes("verifyWithEvidence") || 
                                     contractCode.includes("multiSourceVerification") ||
                                     contractCode.includes("verificationScore");
      
      console.log("✅ Has enhanced verification:", hasEnhancedVerification);
      
      // Check for environmental API integration
      const hasEnvironmentalAPI = contractCode.includes("environmentalFactor") || 
                                 contractCode.includes("lifeExpectancyAdjustment");
      
      console.log("✅ Has environmental API integration:", hasEnvironmentalAPI);
      
    } catch (error) {
      console.log("❌ DeathVerifier test failed:", error.message);
    }
    
    // Test 5: Check for NFT integration
    console.log("\n🖼️ Testing NFT Integration...");
    try {
      const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
      const sarcophagus = Sarcophagus.attach(CONTRACTS.sarcophagus);
      
      const contractCode = await ethers.provider.getCode(CONTRACTS.sarcophagus);
      
      // Check for NFT-related functions
      const hasNFTIntegration = contractCode.includes("nftContract") || 
                               contractCode.includes("nftId") ||
                               contractCode.includes("nftValue") ||
                               contractCode.includes("nftPercentage");
      
      console.log("✅ Has NFT integration:", hasNFTIntegration);
      
      // Try to call NFT-related functions
      try {
        // This would be a function that includes NFT parameters
        const interface = new ethers.Interface([
          "function createSarcophagus(address[] beneficiaries, uint16[] percentages, address[] nftContracts, uint256[] nftIds, uint256[] nftValues, uint16[] nftPercentages) external payable"
        ]);
        
        const hasNFTFunction = contractCode.includes(ethers.id("createSarcophagus(address[],uint16[],address[],uint256[],uint256[],uint16[])").slice(0, 10));
        console.log("✅ Has NFT createSarcophagus function:", hasNFTFunction);
        
      } catch (error) {
        console.log("❌ NFT functions not found (old version)");
      }
      
    } catch (error) {
      console.log("❌ NFT test failed:", error.message);
    }
    
    // Test 6: Check for minimum deposit requirements
    console.log("\n💰 Testing Minimum Deposit Requirements...");
    try {
      const Sarcophagus = await ethers.getContractFactory("Sarcophagus");
      const sarcophagus = Sarcophagus.attach(CONTRACTS.sarcophagus);
      
      // Try to get minimum deposit
      try {
        const minDeposit = await sarcophagus.MIN_DEPOSIT();
        console.log("✅ MIN_DEPOSIT constant:", ethers.formatEther(minDeposit), "VET");
      } catch (error) {
        console.log("❌ MIN_DEPOSIT not found (old version)");
      }
      
      // Check for deposit validation
      const contractCode = await ethers.provider.getCode(CONTRACTS.sarcophagus);
      const hasDepositValidation = contractCode.includes("requireDeposit") || 
                                  contractCode.includes("validateDeposit");
      
      console.log("✅ Has deposit validation:", hasDepositValidation);
      
    } catch (error) {
      console.log("❌ Deposit test failed:", error.message);
    }
    
    console.log("\n📊 === VERSION ANALYSIS COMPLETE ===");
    console.log("\n💡 Summary:");
    console.log("If most features show ❌, your contracts are the OLD version");
    console.log("If most features show ✅, your contracts are the NEW version");
    console.log("\n🔧 If you need the new features, you'll need to:");
    console.log("1. Deploy new contracts with the updated code");
    console.log("2. Or upgrade the existing contracts (if upgradeable)");
    console.log("3. Or use a different deployment account");
    
  } catch (error) {
    console.error("❌ Version check failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 