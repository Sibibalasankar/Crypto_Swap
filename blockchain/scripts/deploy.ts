import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy TokenA
  const TokenA = await ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy();
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log("TokenA deployed to:", tokenAAddress);

  // Deploy TokenB
  const TokenB = await ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy();
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log("TokenB deployed to:", tokenBAddress);

  // Deploy Swap
  const Swap = await ethers.getContractFactory("Swap");
  const swap = await Swap.deploy(tokenAAddress, tokenBAddress);
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log("Swap deployed to:", swapAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
