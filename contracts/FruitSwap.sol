// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FruitToken} from "./FruitToken.sol";
import './libraries/Math.sol';
import "hardhat/console.sol";

contract FruitSwap {
    uint public constant MINIMUM_LIQUIDITY = 10**3;

    uint public reserveToken;
    uint public reserveEth;
    uint public tokenFee;
    uint public ethFee;
    uint public kLast; // last k value
    FruitToken fruitToken;
    address public token0;

    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, 'Locked');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    function getReserves() public view returns (uint _reserve0, uint _reserve1) {
        _reserve0 = reserveToken;
        _reserve1 = reserveEth;
    }


    constructor(address _token0) {
        token0 = _token0;
        fruitToken = new FruitToken();
    }


    function sync() private {
        reserveToken = IERC20(token0).balanceOf(address(this));
        reserveEth = address(this).balance;
        kLast = reserveToken * reserveEth;
    }

    // adds liquidity, mints fruit tokens and send it to _to
    function addLiquidity(address _to) external lock returns(uint liquidity) {
        require(_to != address(0), "address should be non zero");
        (uint _reserve0, uint _reserve1) = getReserves();

        uint balanceToken = IERC20(token0).balanceOf(address(this));
        uint balanceEth = address(this).balance;
        uint amount0 = balanceToken - _reserve0;
        uint amount1 = balanceEth - _reserve1;

        uint _totalSupply = fruitToken.totalSupply();
        if(_totalSupply == 0){
            liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            fruitToken.mint(address(_to), MINIMUM_LIQUIDITY);
        } else {
            liquidity = Math.min(amount0 * _totalSupply / _reserve0, amount1 * _totalSupply / _reserve1);
        }
        require(liquidity > 0, 'Insufficient liquidity');
        fruitToken.mint(_to, liquidity);
        sync();
        emit Mint(msg.sender, amount0, amount1, _to);
    }

    // removes liquidity, and sends back token0 and token1
    function removeLiquidity(address _to) lock external returns(uint amount0, uint amount1) {
        address _token0 = token0;                                      
        uint balanceToken = IERC20(_token0).balanceOf(address(this));
        uint balanceEth = address(this).balance;
        uint liquidity = fruitToken.balanceOf(address(this));                         
        uint _totalSupply = fruitToken.totalSupply();
        amount0 = liquidity * balanceToken / _totalSupply;
        amount1 = liquidity * balanceEth / _totalSupply;
        require(amount0 > 0 && amount1 > 0, 'Insufficient liquidity burned');
        fruitToken.burn(address(this), liquidity);
        bool success0 = IERC20(_token0).transfer(_to, amount0);
        (bool success1,) = _to.call{value: amount1}("");
        require(success0 && success1, "Token transfer failed");
        sync();
        emit Burn(msg.sender, amount0, amount1, _to);
    }

    // Trades token0 for eth and if successful sends back eth to sender
    function swapTokenForETH(address sender, uint expectedAmountOut) external lock returns (uint) {
        uint balanceToken = IERC20(token0).balanceOf(address(this));
        uint actualAmountOut;
        uint amountIn;
        { // limiting scope of reserveToken and reserveEth to avoid stack too deep errors
        (uint _reserve0, uint _reserve1) = getReserves();
        require(balanceToken > _reserve0, "insufficient balance");
        amountIn = balanceToken - _reserve0;
        uint fees = amountIn / 100;
        tokenFee += fees;
        uint availableAmountIn = amountIn - fees;
        actualAmountOut = _reserve1 - kLast / (_reserve0 + availableAmountIn);
        }
        require( expectedAmountOut - actualAmountOut < expectedAmountOut/10, "Slippage is more than 10" );
        (bool success, ) = sender.call{value: actualAmountOut}("");
        require(success, "Token Transfer failed");
        sync();
        emit Swap(sender, amountIn, actualAmountOut);
        return actualAmountOut;
    }

    //Trades eth for token and if succesful sends back token0 to sender
    function swapETHForToken(address sender, uint expectedAmountOut) external lock returns (uint) {
        uint balanceEth = address(this).balance;
        uint actualAmountOut;
        uint amountIn;
        { // limiting scope of reserveToken and reserveEth to avoid stack too deep errors
        (uint _reserve0, uint _reserve1) = getReserves();

        require(balanceEth > _reserve1, "insufficient balance");
        amountIn = balanceEth - _reserve1;
        uint fees = amountIn / 100;
        ethFee += fees;
        uint availableAmountIn = amountIn - fees;
        actualAmountOut = _reserve0 - kLast / (_reserve1 + availableAmountIn);
        }
        require( expectedAmountOut - actualAmountOut < expectedAmountOut/10, "Slippage is more than 10" );
        bool success = IERC20(token0).transfer(sender, actualAmountOut);
        require(success, "Token Transfer failed");
        sync();
        emit Swap(sender, amountIn, actualAmountOut);
        return actualAmountOut;

    }

    receive() external payable {}

    function getToken() public view returns(FruitToken) {
        return fruitToken;
    }

    // events
    event Mint(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(address indexed sender, uint amountIn, uint actualAmountOut);

}

