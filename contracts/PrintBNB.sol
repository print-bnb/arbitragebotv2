// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import './interfaces/IERC20.sol';
import './interfaces/IERC3156FlashBorrower.sol';
import './interfaces/IPancakeRouter02.sol';

/*
*  FlashBorrowerExample is a simple smart contract that enables
*  to borrow and returns a flash loan.
*/
contract PrintBNB is IERC3156FlashBorrower {

    enum Direction = {
        PancakeToBiswap
        BiswapToPancake
    }
    
    IERC20 immutable USDT;
    IERC20 immutable WBNB;

    address constant PANCAKE_FACTORY = 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73;
    address constant PANCAKE_ROUTER = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
    address constant BISWAP_FACTORY = 0x858E3312ed3A876947EA49d572A7C42DE08af7EE;
    address constant BISWAP_ROUTER = 0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8;

    address immutable pancakeExchange;
    address immutable biswapExchange;
    address immutable paymentAddress;

    constructor(address _usdtAddress, address _wbnbAddress, address _paymentSplitterAddress) public {
        USDT = IERC20(0x55d398326f99059fF775485246999027B3197955);  
        WBNB = IERC20(0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c);  
        pancake = IPancakeRouter02(PANCAKE_ROUTER);
        pancakeExchange = IPancakeFactory(PANCAKE_FACTORY);
        biswap = IBiswapRouter02(BISWAP_ROUTER);
        biswapExchange = IBiswap1Factory(BISWAP_FACTORY);
        paymentAddress = _paymentSplitterAddress;
    }


    // @dev ERC-3156 Flash loan callback
    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data,
        uint256 direction
    ) external override returns (bytes32) {
        uint balanceWbnb = wbnb.balanceOf(address(this));
        require(balanceWbnb >= amount, "Not enough WBNB");
        
        if(direction == Direction.PancakeToBiswap) {
      
        } else (direction == Direction.BiswapToPancake) {

        }

        // Return success to the lender, he will transfer get the funds back if allowance is set accordingly
        return keccak256('ERC3156FlashBorrower.onFlashLoan');
    }

    function startArbitrage(
        address token0, 
        address token1, 
        uint amount0, 
        uint amount1
    ) external {
        address pairAddress = pancakeExchange.getPair(token0, token1);
        require(pairAddress != address(0), 'This pool does not exist');
        IPancakePair(pairAddress).swap(
            amount0, 
            amount1, 
            address(this), 
            bytes('not empty')
        );
    }

    function pancakeCall(
        address _sender, 
        uint _amount0, 
        uint _amount1, 
        bytes calldata _data
    ) external {
        address[] memory path = new address[](2);

        // obtain an amount of token that you exchanged, for example WBNB
        uint amountToken = _amount0 == 0 ? _amount1 : _amount0;
        
        address token0 = IPancakePair(msg.sender).token0();
        address token1 = IPancakePair(msg.sender).token1();

        require(
            msg.sender == PancakeLibrary.pairFor(pancakeFactory, token0, token1), 
            'Unauthorized'
        ); 
        require(_amount0 == 0 || _amount1 == 0);
        
        // if _amount0 is zero sell token1 for token0
        // else sell token0 for token1 as a result
        path[0] = _amount0 == 0 ? token1 : token0; // represents the forwarding exchange from source currency to swapped currency
        path[1] = _amount0 == 0 ? token0 : token1; // represents the backward exchange from swapeed currency to source currency
     
        // IERC20 token that we will sell for otherToken, for example WBNB
        IERC20 token = IERC20(_amount0 == 0 ? token1 : token0);
        
        token.approve(address(biswap), amountToken);

        // calculate the amount of token how much input token should be reimbursed, USDT -> WBNB
        uint amountRequired = PancakeLibrary.getAmountsIn(
        factory, 
        amountToken, 
        path
        )[0];

        // swap token and obtain equivalent otherToken amountRequired as a result, WBNB -> USDT
        uint amountReceived = biswap.swapExactTokensForTokens(
        amountToken, 
        amountRequired,  // we already now what we need at least for payback; get less is a fail; slippage can be done via - ((amountRequired * 19) / 981) + 1,
        path, 
        msg.sender, 
        deadline
        )[1];

        // callback should send the funds to the pair address back
        IERC20 otherToken = IERC20(_amount0 == 0 ? token0 : token1);
    
        // callback should send the funds to the pair address back
        otherToken.transfer(msg.sender, amountRequired); // send back borrow
        // transfer the profit to the contract owner
        otherToken.transfer(paymentSplitterAddress, amountReceived - amountRequired);
    }
}