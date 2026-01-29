import { ethers } from "hardhat";

const SWAP    = "0x71237162c8DB4b52135caa2B6A9993e7d72Bbf52";

async function main() {
  const [signer] = await ethers.getSigners();
  const swap = await ethers.getContractAt("Swap", SWAP, signer);

  const amountIn = ethers.parseEther("10");
  await (await swap.swapAforB(amountIn)).wait();

  console.log("Swap executed");
}

main().catch(console.error);
