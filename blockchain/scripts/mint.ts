import { ethers } from "hardhat";

const TOKEN_A = "0x1426DA8803cafC77c7B78329ED84d9477B380B6c";
const TOKEN_B = "0x40616A3e2C3c6868F455d92919253Ec1d48A4fF8";

async function main() {
  const [user] = await ethers.getSigners();

  const tokenA = await ethers.getContractAt("TokenA", TOKEN_A);
  const tokenB = await ethers.getContractAt("TokenB", TOKEN_B);

  const amount = ethers.parseEther("1000");

  await (await tokenA.mint(user.address, amount)).wait();
  console.log("Minted TokenA");

  await (await tokenB.mint(user.address, amount)).wait();
  console.log("Minted TokenB");
}

main().catch(console.error);
