// SPDX-License-Identifier: GPL-3.0-or-later
// Derived from https://github.com/Austin-Williams/uniswap-flash-swapper

pragma solidity ^0.7.5;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "erc3156/contracts/interfaces/IERC3156FlashBorrower.sol";
import "erc3156/contracts/interfaces/IERC3156FlashLender.sol";

import './libraries/UniswapV2Library.sol';
import './interfaces/IUniswapV2Pair.sol';
import './interfaces/IUniswapV2Factory.sol';
import './interfaces/IUniswapV2Router02.sol';

contract FlashLoanBorrower is IERC3156FlashLender, IUniswapV2Callee {
    using SafeMath for uint256;

    // CONSTANTS
    bytes32 public constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");
    IUniswapV2Factory public factory;

    // ACCESS CONTROL
    // Only the `permissionedPairAddress` may call the `uniswapV2Call` function
    address permissionedPairAddress;

    // DEFAULT TOKENS
    address tokenA;
    address tokenB;

    /// @param factory_ Uniswap v2 UniswapV2Factory address
    /// @param _tokenA tokenA contract used in Uniswap v2 Pairs
    /// @param _tokenB tokenB contract used in Uniswap v2 Pairs
    constructor(IUniswapV2Factory _factory, address _tokenA, address _tokenB) {
        factory = _factory;
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    /**
     * @dev Get the Uniswap Pair that will be used as the source of a loan. The opposite token will be tokenA, except for tokenA that will be tokenB.
     * @param token The loan currency.
     * @return The Uniswap V2 Pair that will be used as the source of the flash loan.
     */
    function getPairAddress(address token) public view returns (address) {
        address tokenOther = token == tokenA ? tokenB : tokenA;
        return factory.getPair(token, tokenOther);
    }

    /**
     * @dev From ERC-3156. The amount of currency available to be lended.
     * @param token The loan currency.
     * @return The amount of `token` that can be borrowed.
     */
    function maxFlashLoan(address token) external view override returns (uint256) {
        address pairAddress = getPairAddress(token);
        if (pairAddress != address(0)) {
            uint256 balance = IERC20(token).balanceOf(pairAddress);
            if (balance > 0) return balance - 1;
        }
        return 0;
    }

    /**
     * @dev From ERC-3156. The fee to be charged for a given loan.
     * @param token The loan currency.
     * @param amount The amount of tokens lent.
     * @return The amount of `token` to be charged for the loan, on top of the returned principal.
     */
    function flashFee(address token, uint256 amount) public view override returns (uint256) {
        require(getPairAddress(token) != address(0), "Unsupported currency");
        return ((amount * 3) / 997) + 1;
    }

    /**
     * @dev From ERC-3156. Loan `amount` tokens to `receiver`, which needs to return them plus fee to this contract within the same transaction.
     * @param receiver The contract receiving the tokens, needs to implement the `onFlashLoan(address user, uint256 amount, uint256 fee, bytes calldata)` interface.
     * @param token The loan currency.
     * @param amount The amount of tokens lent.
     * @param userData A data parameter to be passed on to the `receiver` for any custom use.
     */
    function flashLoan(IERC3156FlashBorrower receiver, address token, uint256 amount, bytes memory userData) external override returns(bool) {
        address pairAddress = getPairAddress(token);
        require(pairAddress != address(0), "Unsupported currency");

        IUniswapV2Pair pair = IUniswapV2Pair(pairAddress);

        if (permissionedPairAddress != pairAddress) permissionedPairAddress = pairAddress; // access control

        address token0 = pair.token0();
        address token1 = pair.token1();
        uint amount0Out = token == token0 ? amount : 0;
        uint amount1Out = token == token1 ? amount : 0;
        bytes memory data = abi.encode(
            msg.sender,
            receiver,
            token,
            userData
        );
        pair.swap(amount0Out, amount1Out, address(this), data);
        return true;
    }
    
    function execute(
        address _sender,
        uint _amount0,
        uint _amount1,
        bytes calldata _data
    ) internal {
        // obtain an amount of token that you exchanged, for example BUSD
        uint amountToken = _amount0 == 0 ? _amount1 : _amount0;

        IUniswapV2Pair iUniswapV2Pair = IUniswapV2Pair(msg.sender);
        address token0 = iUniswapV2Pair.token0();
        address token1 = iUniswapV2Pair.token1();

        // require(token0 != address(0) && token1 != address(0), 'e16');

        // if _amount0 is zero sell token1 for token0
        // else sell token0 for token1 as a result
        address[] memory path1 = new address[](2);
        address[] memory path2 = new address[](2);

        address forward = _amount0 == 0 ? token1 : token0;
        address backward = _amount0 == 0 ? token0 : token1;

        // path1 represents the forwarding exchange from source currency to swapped currency
        // path1[0] = path2[1] = _amount0 == 0 ? token1 : token0;
        path1[0] = path2[1] = forward;
        // path2 represents the backward exchange from swapeed currency to source currency
        // path1[1] = path2[0] = _amount0 == 0 ? token0 : token1;
        path1[1] = path2[0] = backward;

        (address sourceRouter, address targetRouter) = abi.decode(_data, (address, address));
        require(sourceRouter != address(0) && targetRouter != address(0), 'e12');

        // IERC20 token that we will sell for otherToken, for example BUSD
        // IERC20 token = IERC20(_amount0 == 0 ? token1 : token0);
        IERC20 token = IERC20(forward);
        token.approve(targetRouter, amountToken);

        // calculate the amount of token how much input token should be reimbursed, BNB -> BUSD
        uint amountRequired = IUniswapV2Router02(sourceRouter).getAmountsIn(amountToken, path2)[0];

        // swap token and obtain equivalent otherToken amountRequired as a result, BUSD -> BNB
        uint amountReceived = IUniswapV2Router02(targetRouter).swapExactTokensForTokens(
            amountToken,
            amountRequired, // we already now what we need at least for payback; get less is a fail; slippage can be done via - ((amountRequired * 19) / 981) + 1,
            path1,
            address(this), 
            block.timestamp + 60
        )[1];

        // fail if we didn't get enough tokens
        require(amountReceived > amountRequired, 'e13');

        // IERC20 otherToken = IERC20(_amount0 == 0 ? token0 : token1);
        IERC20 otherToken = IERC20(backward);

        // callback should send the funds to the pair address back
        otherToken.transfer(msg.sender, amountRequired); // send back borrow
        // transfer the profit to the Payment Spiltter contract
        otherToken.transfer(paymentSplitterAddress, amountReceived - amountRequired);
    }

    // c&p
    // pancake, pancakeV2, apeswap, kebab
    function pancakeCall(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external {
        execute(_sender, _amount0, _amount1, _data);
    }

    function waultSwapCall(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external {
        execute(_sender, _amount0, _amount1, _data);
    }

    function uniswapV2Call(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external {
        execute(_sender, _amount0, _amount1, _data);
    }

    // mdex
    function swapV2Call(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external {
        execute(_sender, _amount0, _amount1, _data);
    }

    // pantherswap
    function pantherCall(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external {
        execute(_sender, _amount0, _amount1, _data);
    }

    // jetswap
    function jetswapCall(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external {
        execute(_sender, _amount0, _amount1, _data);
    }

    // cafeswap
    function cafeCall(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external {
        execute(_sender, _amount0, _amount1, _data);
    }

    // @TODO: pending release
    function BiswapCall(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external {
        execute(_sender, _amount0, _amount1, _data);
    }

    // @TODO: pending release
    function wardenCall(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external {
        execute(_sender, _amount0, _amount1, _data);
    }

    receive() external payable {}
}