import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import { ethers } from "hardhat"; 

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

task("balance", "Shows the sale of account[0] on the network")
    .setAction(async (args, hre) => {
      const [account] = await hre.ethers.getSigners();
      const balance = await hre.ethers.provider.getBalance(account.address);
      console.log(`Solde de ${account.address}: ${hre.ethers.formatEther(balance)} ETH`);
    });
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
let PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      gas: 2500000,
    },
    hardhat: {
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};


export default config;