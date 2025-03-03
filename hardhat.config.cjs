require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require('@nomicfoundation/hardhat-ethers');
require("@typechain/hardhat");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      // Add this to help with type resolution
      outputSelection: {
        "*": {
          "*": ["storageLayout"]
        }
      }
    }
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
      accounts: [
        // Private keys from Ganache default accounts
        "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d", // Account 0
        "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1", // Account 1
        "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c", // Account 2
        "0xf1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1", // Account 3
        "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c", // Account 4
      ]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v6"
  },
  // Add explicit type resolution for Ethers signers
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  }
};

