require('dotenv').config();
const { thorify } = require('thorify');
const Web3 = require('web3');

async function main() {
  console.log("🔍 Checking mnemonic address derivation...");
  
  const MNEMONIC = process.env.MNEMONIC;
  console.log("Mnemonic:", MNEMONIC);
  
  // Initialize Web3 with Thorify
  const web3 = thorify(new Web3(), "https://testnet.veblocks.net");
  
  // Derive address from mnemonic
  const hdNode = web3.eth.accounts.wallet.create(1, MNEMONIC);
  const account = hdNode[0];
  
  console.log("Derived address:", account.address);
  console.log("Private key:", account.privateKey);
  
  // Check if this matches your expected deployer address
  const balance = await web3.eth.getBalance(account.address);
  console.log("Balance:", web3.utils.fromWei(balance, 'ether'), "VET");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 