// Raffle
// Enter lottery (pay x amount)
// Pick random winner (verifiably random)
// winner to be selected every x minutes -> completely automated
// Chainlink oracle -> randomness, automated execution (chainlink keepers)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error Raffle__NotEnoughETHEntered();

contract Raffle is VRFConsumerBaseV2 {
    /* State variables */
    uint256 private immutable i_entraceFee;
    address payable[] private s_players; // someone from this list will need to be paid
    /* Events */
    event RaffleEnter(address indexed player);

    constructor(address vrfCoordinatorV2, uint256 entraceFee)
        VRFConsumerBaseV2(vrfCoordinatorV2)
    {
        i_entraceFee = entraceFee;
    }

    function enterRaffle() public payable {
        // require (msg.value > i_entraceFee, "not enough eth") -> not as gas effective, storing string
        if (msg.value < i_entraceFee) {
            revert Raffle__NotEnoughETHEntered();
        }
        s_players.push(payable(msg.sender));
        // Events - emit an event when we update a dynamic array or mapping
        // Named events with the function name reversed
        emit RaffleEnter(msg.sender);
    }

    // external are cheaper then public, since contract cant call this
    function requestRandomWinner() external {
        // Request random number
        // do something with it
        // 2 transaction process
    }

    // fills random numbers
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {}

    /* View && Pure functions */
    function getEntranceFee() public view returns (uint256) {
        return i_entraceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
}
