import { ethers } from "hardhat";

const SWAP = "0x71237162c8DB4b52135caa2B6A9993e7d72Bbf52";

async function main() {
  const [signer] = await ethers.getSigners();
  const swap = await ethers.getContractAt("Swap", SWAP, signer);

  const amountA = ethers.parseEther("500");
  const amountB = ethers.parseEther("500");

  await (await swap.addLiquidity(amountA, amountB)).wait();
  console.log("Liquidity added");
}

main().catch(console.error);
