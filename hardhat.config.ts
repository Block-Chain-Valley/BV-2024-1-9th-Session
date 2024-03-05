/* eslint-disable node/no-unsupported-features/es-syntax */
import "@typechain/hardhat";
import "tsconfig-paths/register";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-log-remover";
import "hardhat-contract-sizer";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

const { NETWORK, DEVELOPER_ACCOUNT, DEVELOPER_PRIVATE_KEY, CHAIN_ID, PROVIDER_URL, GAS_PRICE } = process.env;

function getDeployPath(): string {
  return `./src/scripts/deploy/${NETWORK}/todo`;
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  namedAccounts: {
    developer: 0,
  },
  networks: {
    hardhat: {
      live: false,
      tags: ["hardhat", "test"],
      chainId: 1337,
    },
    // replace with your network configuration
    // testnet: {
    //   url: PROVIDER_URL || "",
    //   chainId: +(CHAIN_ID || 0),
    //   from: DEVELOPER_ACCOUNT || "",
    //   gas: "auto",
    //   gasPrice: Number(GAS_PRICE),
    //   accounts: [DEVELOPER_PRIVATE_KEY || "0"],
    // },
    // mainnet: {
    //   url: PROVIDER_URL || "",
    //   chainId: +(CHAIN_ID || 0),
    //   from: DEVELOPER_ACCOUNT || "",
    //   gas: "auto",
    //   gasPrice: Number(GAS_PRICE),
    //   accounts: [DEVELOPER_PRIVATE_KEY || "0"],
    // },
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./src/contracts",
    tests: "./src/test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: getDeployPath(),
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  mocha: {
    timeout: 100000000,
  },
};

export default config;
