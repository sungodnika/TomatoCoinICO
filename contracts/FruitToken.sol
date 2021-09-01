// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// LP Token for the FruiteSwap liquidity Pool
contract FruitToken is ERC20 {
    // owner is the one who created the LP
    address public owner;

    constructor() ERC20("FruitToken", "FRT") {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only creater or owner of the token can invoke");
        _;
    }
             
    // mint new tokens to address _to
    function mint(address _to, uint256 amount) external onlyOwner {
        _mint(_to, amount);
    }

    // burn tokens from address _from
    function burn(address _from, uint256 amount) external onlyOwner {
        _burn(_from, amount);
    }

}

