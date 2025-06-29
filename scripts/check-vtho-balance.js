require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');

async function main() {
  console.log("🔋 Checking VET and VTHO balances...");
  
  // Load the stable key
  const keyData = JSON.parse(require('fs').readFileSync('stable-key.json', 'utf8'));
  
  // Initialize Web3 with Thorify
  const web3 = thorify(new Web3(), "https://testnet.veblocks.net");
  
  // Add the stable account
  const account = web3.eth.accounts.privateKeyToAccount(keyData.privateKey);
  web3.eth.accounts.wallet.add(account);
  
  console.log("Address:", account.address);
  
  // Check VET balance
  const vetBalance = await web3.eth.getBalance(account.address);
  console.log("VET Balance:", web3.utils.fromWei(vetBalance, 'ether'), "VET");
  
  // Check VTHO balance (energy)
  const vthoBalance = await web3.eth.getEnergy(account.address);
  console.log("VTHO Balance:", web3.utils.fromWei(vthoBalance, 'ether'), "VTHO");
  
  // Check if we have enough energy for deployment
  const estimatedGas = 5000000; // 5M gas
  const gasPrice = await web3.eth.getGasPrice();
  const estimatedCost = web3.utils.toBN(estimatedGas).mul(web3.utils.toBN(gasPrice));
  
  console.log("Estimated gas cost:", web3.utils.fromWei(estimatedCost, 'ether'), "VTHO");
  
  if (web3.utils.toBN(vthoBalance).lt(estimatedCost)) {
    console.log("❌ Insufficient VTHO for deployment");
    console.log("Get VTHO from: https://faucet.vechain.org/");
  } else {
    console.log("✅ Sufficient VTHO for deployment");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 