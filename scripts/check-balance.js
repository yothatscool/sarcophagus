require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');

async function main() {
  console.log("💰 Checking address balances...");
  
  const MNEMONIC = process.env.MNEMONIC;
  
  // Initialize Web3 with Thorify
  const web3 = thorify(new Web3(), "https://testnet.veblocks.net");
  
  // Check the address you mentioned you funded
  const addressesToCheck = [
    "0x3d32fE6e85066240f3018c9FC664db7967d2d313", // Your VeWorld address
    "0x144d2b3b4823bBd949A769637d522585672DeCbf", // First generated address
    "0xa64fB17ed94B2e6C3Dd979DB125d7b26699938Ad", // Second generated address
    "0x9027A597D2A7cBBc54Cd8905f94e8B8Bd4cFe3Fc", // Third generated address
    "0xAc8176D28Fc5d828af1F20aD3588141c0f8CFFb1"  // Current generated address
  ];
  
  console.log("\nChecking balances for different addresses:");
  
  for (const address of addressesToCheck) {
    try {
      const balance = await web3.eth.getBalance(address);
      const vthoBalance = await web3.eth.getBalance(address, 'latest');
      
      console.log(`${address}:`);
      console.log(`  VET: ${web3.utils.fromWei(balance, 'ether')}`);
      console.log(`  VTHO: ${web3.utils.fromWei(vthoBalance, 'ether')}`);
      
      if (web3.utils.toBN(balance).gt(web3.utils.toBN(0))) {
        console.log(`  ✅ FUNDED!`);
      }
    } catch (error) {
      console.log(`${address}: Error checking balance - ${error.message}`);
    }
  }
  
  // Also check what address the mnemonic generates consistently
  console.log("\n🔍 Checking mnemonic derivation consistency:");
  for (let i = 0; i < 5; i++) {
    try {
      const hdNode = web3.eth.accounts.wallet.create(1, MNEMONIC);
      const account = hdNode[0];
      console.log(`Run ${i + 1}: ${account.address}`);
    } catch (error) {
      console.log(`Run ${i + 1}: Error - ${error.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 