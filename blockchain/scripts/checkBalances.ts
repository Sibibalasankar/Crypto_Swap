import { ethers } from "hardhat";

const TOKEN_A = "0x1426DA8803cafC77c7B78329ED84d9477B380B6c";
const TOKEN_B = "0x40616A3e2C3c6868F455d92919253Ec1d48A4fF8";
const SWAP    = "0x71237162c8DB4b52135caa2B6A9993e7d72Bbf52";

async function main() {
  const [user] = await ethers.getSigners();

  const tokenA = await ethers.getContractAt("TokenA", TOKEN_A);
  const tokenB = await ethers.getContractAt("TokenB", TOKEN_B);

  // User balances
  const userBalanceA = await tokenA.balanceOf(user.address);
  const userBalanceB = await tokenB.balanceOf(user.address);

  // Swap balances (liquidity pool)
  const swapBalanceA = await tokenA.balanceOf(SWAP);
  const swapBalanceB = await tokenB.balanceOf(SWAP);

  console.log("=== USER BALANCES ===");
  console.log("TokenA:", ethers.formatEther(userBalanceA));
  console.log("TokenB:", ethers.formatEther(userBalanceB));

  console.log("\n=== SWAP (POOL) BALANCES ===");
  console.log("TokenA:", ethers.formatEther(swapBalanceA));
  console.log("TokenB:", ethers.formatEther(swapBalanceB));
}

main().catch(console.error);
