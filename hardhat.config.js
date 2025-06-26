require('solidity-coverage');
require("@vechain/hardhat-vechain");
require("@vechain/hardhat-ethers");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();
const { hdkey } = require('ethereumjs-wallet');
const bip39 = require('bip39');

// You can use either PRIVATE_KEY or MNEMONIC
const { PRIVATE_KEY, MNEMONIC, VECHAIN_TESTNET_URL, VECHAIN_MAINNET_URL } = process.env;

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
    version: "0.8.24",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // VeChain Testnet (Testnet)
    vechain_testnet: {
      url: VECHAIN_TESTNET_URL || "https://testnet.veblocks.net",
      privateKey: privateKey,
      delegateUrl: "https://sponsor-testnet.vechain.energy/by/90",  // VeChain fee delegation
      chainId: 39,
      gas: 10000000,
      gasPrice: 0, // VeChain uses gas price of 0 with fee delegation
      timeout: 60000
    },
    // VeChain Mainnet
    vechain_mainnet: {
      url: VECHAIN_MAINNET_URL || "https://mainnet.veblocks.net",
      privateKey: privateKey,
      delegateUrl: "https://sponsor-mainnet.vechain.energy/by/90",  // VeChain fee delegation
      chainId: 1,
      gas: 10000000,
      gasPrice: 0,
      timeout: 60000
    },
    // Local development network (simulates VeChain)
    hardhat: {
      chainId: 1337,
      gas: 10000000,
      gasPrice: 1000000000, // 1 gwei
      allowUnlimitedContractSize: true
    },
    // Localhost for testing
    localhost: {
      url: "http://127.0.0.1:8545",
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
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    gasPrice: 21,
    showMethodSig: true,
    showTimeSpent: true,
    excludeContracts: ['MockB3TR', 'MockVTHOManager', 'MockVTHO', 'MockToken', 'MockVIP180', 'MockVNSResolver'],
    src: './contracts/',
    outputFile: 'gas-report.txt',
    noColors: true
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ['Sarcophagus', 'OBOL', 'B3TRRewards', 'DeathVerifier', 'MultiSigWallet']
  }
};
