// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import {TomatoCoin} from "./TomatoCoin.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TomatoCoinICO is Pausable, Ownable {
    enum Phase {
        SEED, 
        GENERAL, 
        OPEN
    }

    TomatoCoin public tomatoCoin;

    uint public totalRaised;
    mapping(address => uint256) public contributions;
    mapping(address => bool) public privateInvestors;
    Phase phase;

    constructor(address _treasury) {
        require(_treasury != address(0), "address should be non zero");
        tomatoCoin = new TomatoCoin(_treasury);
        emit TomatoCoinCreation(address(tomatoCoin));
    }

    receive() external payable {
        revert("Please call contribute()");
    }

    // events
    event TomatoCoinCreation(address coinAddress);
    event PhaseChanged(Phase newPhase);
    event Contribute(address contributer, uint amount);
    event RedeemedCoins(address redeemer, uint amount);
    event AddedPrivateInvestor(address privateInvestor);
    event RemovedPrivateInvestor(address privateInvestor);

    function addPrivateInvestor(address privateInvestor) external onlyOwner {
        require(privateInvestor != address(0), "address should be non zero");
        privateInvestors[privateInvestor] = true;
        emit AddedPrivateInvestor(privateInvestor);
    }

    function removePrivateInvestor(address privateInvestor) external onlyOwner {
        require(privateInvestor != address(0), "address should be non zero");
        privateInvestors[privateInvestor] = false;
        emit RemovedPrivateInvestor(privateInvestor);
    }

    function advancePhase() external onlyOwner {
        require(phase!=Phase.OPEN, "The ICO is already open");
        if(phase == Phase.SEED) {
            phase = Phase.GENERAL;
            emit PhaseChanged(phase);
        } else if(phase == Phase.GENERAL) {
            phase = Phase.OPEN;
            emit PhaseChanged(phase);
        }        
    }

    function contribute() payable external whenNotPaused {
        if (phase == Phase.SEED) {
            require(privateInvestors[msg.sender] == true, "This phase is open only for private investors");
            require(contributions[msg.sender] + msg.value <= 1500 ether, "Contribution above individual threshold");
            require(totalRaised + msg.value <= 15000 ether, "Total contribution above threshold");
            contributions[msg.sender] += msg.value;
            totalRaised += msg.value;
            emit Contribute(msg.sender, msg.value);
        } else if(phase == Phase.GENERAL) {
            require(contributions[msg.sender] + msg.value <= 1000 ether, "Contribution above individual threshold");
            require(totalRaised + msg.value <= 30000 ether, "Total contribution above threshold");
            contributions[msg.sender] += msg.value;
            totalRaised += msg.value;
            emit Contribute(msg.sender, msg.value);
        } else if (phase == Phase.OPEN) {
            contributions[msg.sender] += msg.value;
            totalRaised += msg.value;
            emit Contribute(msg.sender, msg.value);
        }
    }

    function redeemTomatoCoin() external whenNotPaused {
        require(phase == Phase.OPEN, "ICO is not Open yet");
        require(contributions[msg.sender]>0, "Not part of the ICO");
        uint tomatoCoins = contributions[msg.sender] * 5;
        contributions[msg.sender] = 0;
        tomatoCoin.mint(msg.sender, tomatoCoins);
        emit RedeemedCoins(msg.sender, tomatoCoins);
    } 

    function pause() external whenNotPaused onlyOwner {
        _pause();
    }

    function unpause() external whenPaused onlyOwner{
        _unpause();
    }

    function getTomatoCoin() external view returns(TomatoCoin) {
        return tomatoCoin;
    }
}