require('dotenv').config();
const fs = require('fs');

console.log("🔧 Setting up correct deployer address...");
console.log("Expected address: 0x3d32fE6e85066240f3018c9FC664db7967d2d313");

console.log("\nTo use this address for deployment, you need to:");
console.log("1. Add your private key to the .env file");
console.log("2. Or provide the correct mnemonic that generates this address");

console.log("\nCurrent .env file contents:");
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log(envContent);
} catch (error) {
  console.log("No .env file found");
}

console.log("\nTo add your private key, add this line to your .env file:");
console.log("PRIVATE_KEY=your_private_key_here");
console.log("\nOr to use a different mnemonic:");
console.log("MNEMONIC=your_correct_mnemonic_here");

console.log("\n💡 If you don't have the private key, you can:");
console.log("1. Check your wallet (VeWorld, Sync2, etc.) for the private key");
console.log("2. Export it from your wallet");
console.log("3. Add it to the .env file"); 