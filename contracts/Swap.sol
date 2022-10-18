// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "./interfaces/IERC20.sol";
import "./interfaces/Uniswap.sol";
import "./interfaces/IUniswapV2Callee.sol";

// flash swap contract
contract Swap is IUniswapV2Callee {
    address private constant UniswapV2Factory = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

    address[] public pairAddresses;
    // Pair[] public allPairs;

    struct Pair {
        uint[] price;
    }

   // calculate price based on pair reserves
    function getTokenPrice(address pairAddress, uint amount) public view returns(uint amountOfToken0) {
        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);
        IERC20 token1 = IERC20(pair.token1());
        (uint Res0, uint Res1,) = pair.getReserves();

        // decimals
        uint res0 = Res0*(10**token1.decimals());
        uint amountOfToken0 = (amount*res0)/Res1; // return amount of token0 needed to buy token1
        return amountOfToken0;
    }
    
    function testFlashSwap(address _tokenA, address _tokenB, uint256 _amount) external {
        address pair = IUniswapV2Factory(UniswapV2Factory).getPair(
            _tokenA,
            _tokenB
        );
        require(pair != address(0), "!pair");

        address token0 = IUniswapV2Pair(pair).token0();
        address token1 = IUniswapV2Pair(pair).token1();

        uint256 amount0Out = _tokenA == token0 ? _amount : 0;
        uint256 amount1Out = _tokenA == token1 ? _amount : 0;

        bytes memory data = abi.encode(_tokenA, _amount);
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
    }

    // in return of flashloan call, uniswap will return with this function
    // providing us the token borrow and the amount
    // we also have to repay the borrowed amt plus some fees
    function uniswapV2Call(
        address _sender,
        uint256 _amount0,
        uint256 _amount1,
        bytes calldata _data
    ) external override {
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        address pair = IUniswapV2Factory(UniswapV2Factory).getPair(token0, token1);
        require(msg.sender == pair, "!pair");
        require(_sender == address(this), "!sender");

        (address tokenBorrow, uint amount) = abi.decode(_data, (address, uint));

        // 0.3% fees
        uint fee = ((amount * 3) / 997) + 1;
        uint amountToRepay = amount + fee;

        IERC20(tokenBorrow).transfer(pair, amountToRepay);
    }
}