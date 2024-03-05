// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface NameCardInterface {
    enum Team {
        DEV,
        RESEARCH
    }

    struct NameCardInfo {
        string name;
        string phoneNum;
        Team team;
        uint256 year;
    }

    function getNameCard(address walletAddr) external view returns (NameCardInfo memory);

    function upsertNameCard(address walletAddr, NameCardInfo memory nameCardInput) external;

    event NameCardUpserted(address indexed walletAddr, NameCardInfo nameCardInfo);
}
