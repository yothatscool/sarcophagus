// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockB3TR is ERC20, Ownable {
    constructor() ERC20("Mock B3TR", "B3TR") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
} 