// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interface/NameCardInterface.sol";

contract NameCard is NameCardInterface {
    mapping(address => NameCardInfo) public nameCardInfos;

    function getNameCard(address walletAddr) external view returns (NameCardInfo memory) {
        return nameCardInfos[walletAddr];
    }

    function upsertNameCard(address walletAddr, NameCardInfo memory nameCardInput) external {
        require(walletAddr == msg.sender, "Error: You can only update your own name card.");
        nameCardInfos[walletAddr] = nameCardInput;

        emit NameCardUpserted(walletAddr, nameCardInput);
    }
}
