require('solidity-coverage');
require("@vechain/hardhat-vechain");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
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

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    // VeChain Testnet with better configuration
    vechainTestnet: {
      url: "https://testnet.vechain.org",
      accounts: [privateKey || "0x0000000000000000000000000000000000000000000000000000000000000000"],
      chainId: 0, // VeChain testnet chain ID (was incorrectly set to 1)
      gas: 5000000,
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000,
      confirmations: 1,
    },
    // Local hardhat network for testing
    hardhat: {
      chainId: 31337,
      gas: 30000000, // 30 million
      gasPrice: 1000000000, // 1 gwei
    }
  },
  etherscan: {
    apiKey: {
      vechainTestnet: "not-needed"
    },
    customChains: [
      {
        network: "vechainTestnet",
        chainId: 1,
        urls: {
          apiURL: "https://explore-testnet.vechain.org/api",
          browserURL: "https://explore-testnet.vechain.org"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 60000
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
