// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Swap {
    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // ------------------
    // ADD LIQUIDITY
    // ------------------
    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Invalid amount");

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;
    }

    // ------------------
    // SWAP A -> B
    // ------------------
    function swapAforB(uint256 amountAIn) external {
        require(amountAIn > 0, "Invalid input");

        uint256 amountBOut = getAmountOut(
            amountAIn,
            reserveA,
            reserveB
        );

        require(amountBOut < reserveB, "Insufficient liquidity");

        tokenA.transferFrom(msg.sender, address(this), amountAIn);
        tokenB.transfer(msg.sender, amountBOut);

        reserveA += amountAIn;
        reserveB -= amountBOut;
    }

    // ------------------
    // SWAP B -> A 🔥 (NEW)
    // ------------------
    function swapBforA(uint256 amountBIn) external {
        require(amountBIn > 0, "Invalid input");

        uint256 amountAOut = getAmountOut(
            amountBIn,
            reserveB,
            reserveA
        );

        require(amountAOut < reserveA, "Insufficient liquidity");

        tokenB.transferFrom(msg.sender, address(this), amountBIn);
        tokenA.transfer(msg.sender, amountAOut);

        reserveB += amountBIn;
        reserveA -= amountAOut;
    }

    // ------------------
    // AMM FORMULA (x*y=k with 0.3% fee)
    // ------------------
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        uint256 amountInWithFee = amountIn * 997;
        return (amountInWithFee * reserveOut) /
            (reserveIn * 1000 + amountInWithFee);
    }
}
