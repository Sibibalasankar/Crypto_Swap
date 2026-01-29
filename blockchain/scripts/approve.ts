import { ethers } from "hardhat";

const TOKEN_A = "0x1426DA8803cafC77c7B78329ED84d9477B380B6c";
const TOKEN_B = "0x40616A3e2C3c6868F455d92919253Ec1d48A4fF8";
const SWAP    = "0x71237162c8DB4b52135caa2B6A9993e7d72Bbf52";


async function main() {
  const [signer] = await ethers.getSigners();

  const tokenA = await ethers.getContractAt("TokenA", TOKEN_A, signer);
  const tokenB = await ethers.getContractAt("TokenB", TOKEN_B, signer);

  const amount = ethers.parseEther("1000"); // adjust if you want

  await (await tokenA.approve(SWAP, amount)).wait();
  console.log("Approved TokenA");

  await (await tokenB.approve(SWAP, amount)).wait();
  console.log("Approved TokenB");
}

main().catch(console.error);
