// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Vereavement.sol";

contract MockAttacker {
    Vereavement public vereavement;
    uint256 public attackCount;

    constructor(address payable _vereavement) {
        vereavement = Vereavement(_vereavement);
    }

    // Function to start the attack
    function attack() external {
        vereavement.payoutVault(msg.sender, address(0));
    }

    // Fallback function to attempt reentrancy
    receive() external payable {
        if (attackCount < 3) {
            attackCount++;
            vereavement.payoutVault(msg.sender, address(0));
        }
    }
} 