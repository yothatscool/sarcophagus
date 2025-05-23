require("@vechain/hardhat-vechain");
require("@vechain/hardhat-ethers");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();
const { hdkey } = require('ethereumjs-wallet');
const bip39 = require('bip39');

// You can use either PRIVATE_KEY or MNEMONIC
const { PRIVATE_KEY, MNEMONIC, VECHAIN_URL } = process.env;

// Function to get private key from mnemonic if needed
function getPrivateKeyFromMnemonic(mnemonic, index = 0) {
  if (!mnemonic) return null;
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdwallet = hdkey.fromMasterSeed(seed);
  const wallet = hdwallet.derivePath(`m/44'/818'/0'/0/${index}`).getWallet();
  return wallet.getPrivateKey().toString('hex');
}

// Get the private key either directly or from mnemonic
const privateKey = PRIVATE_KEY || (MNEMONIC ? getPrivateKeyFromMnemonic(MNEMONIC) : "");

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    vechain: {
      url: VECHAIN_URL || "https://testnet.veblocks.net",
      privateKey: privateKey,
      delegateUrl: "https://sponsor-testnet.vechain.energy/by/90"  // Optional: VeChain fee delegation
    },
    hardhat: {
      chainId: 1337
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
