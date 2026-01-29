import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    custom: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;
