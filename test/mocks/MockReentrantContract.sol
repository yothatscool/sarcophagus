// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../contracts/interfaces/IVereavementRitual.sol";

contract MockReentrantContract {
    IVereavementRitual public ritualEngine;
    
    constructor(address _ritualEngine) {
        ritualEngine = IVereavementRitual(_ritualEngine);
    }
    
    // Function that attempts reentrancy
    function attemptReentrantCall() external {
        ritualEngine.createRitualVault();
        ritualEngine.createRitualVault();
    }
    
    // Fallback function that attempts reentrance
    receive() external payable {
        if (address(ritualEngine).balance >= 1 ether) {
            ritualEngine.completeRitual("REENTRANT");
        }
    }
} 