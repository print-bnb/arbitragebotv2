// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "./finance/PaymentSplitter.sol";

contract Payment is PaymentSplitter {
    
    address[] private contributors = [
        0x1BEb6235e160B4007b01E74483De4FBE4A10E233, // Lionel Wallet (exemple)
        0x44DAe7210064C7AED59FE174326fA8cf34eFcd0f // Lorcann Wallet (exemple)
    ];

    uint256[] private percentages = [
        50,
        50
    ];
    
    constructor () PaymentSplitter(contributors, percentages) payable public {}
}
