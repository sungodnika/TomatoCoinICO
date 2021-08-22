// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract TomatoCoin is ERC20, Ownable {
    address public treasury;
    bool public taxable;

    uint constant public TOTAL_SUPPLY = 500000;
    uint constant public INITIAL_SUPPLY = TOTAL_SUPPLY / 10;
    uint constant public TAX_RATE = 2;

    constructor(address _treasury) ERC20("TomatoCoin", "TOM") {
        require(_treasury != address(0), "address should be non zero");
        treasury = _treasury;
        _mint(treasury, INITIAL_SUPPLY * 10**decimals());
    }

    // events
    event Taxable(bool enabled);
    
    // transfer function
    function _transfer(address from, address to, uint256 value) internal override {
        if(taxable) {
            uint tax = value * TAX_RATE / 100;
            value -= tax;
            super._transfer(from, treasury, tax);
        }
        super._transfer(from, to, value);
    }
    
    // taggle between taxable and non taxable
    function setTaxable(bool _taxable) external onlyOwner {
        taxable = _taxable;
        emit Taxable((_taxable));
    }

    // mint new tokens
    function mint(address to, uint256 amount) external onlyOwner{
        require(ERC20.totalSupply() + amount <= TOTAL_SUPPLY * 10**decimals(), "Total Supply Limit exceeded");
        _mint(to, amount);
    }


}

