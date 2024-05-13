// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Challenge Smart Contract
/// @author Blockchain Valley
/// @notice 참가자들이 이더를 보내어 참가할 수 있습니다. 컨트랙트 소유자만이 챌린지를 시작하고 종료할 수 있으며 챌린지가 종료되면, 성공한 참가자들에게 보상이 분배됩니다.

contract Challenge {
    address public owner;
    uint256 public entryFee;
    uint256 public challengeDuration;
    uint256 public challengeStartTime;
    bool public challengeActive;

    mapping(address => bool) public isValidParticipants;
    address[] public participantList;
    address[] public winnerList;

    event JoinedChallenge(address participant);
    event ChallengeStarted(uint256 startTime, uint256 duration);
    event ChallengeEnded();
    event WinnerDeclared(address winner);
    event RewardDistributed(address winner, uint256 amount);

    constructor(uint256 _entryFee) {
        owner = msg.sender;
        entryFee = _entryFee;
        challengeActive = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function startChallenge(uint256 _duration) public onlyOwner {
        require(!challengeActive, "Challenge is already active.");

        challengeDuration = _duration;
        challengeStartTime = block.timestamp;
        challengeActive = true;

        emit ChallengeStarted(challengeStartTime, challengeDuration);
    }

    function joinChallenge() public payable {
        require(!challengeActive, "Challenge has already started.");
        require(msg.value == entryFee, "Incorrect entry fee.");

        isValidParticipants[msg.sender] = true;
        participantList.push(msg.sender);

        emit JoinedChallenge(msg.sender);
    }

    function declareWinner(address _winner) public onlyOwner {
        require(challengeActive, "Challenge is not active.");
        require(isValidParticipants[_winner], "Address is not a participant.");

        winnerList.push(_winner);

        emit WinnerDeclared(_winner);
    }

    function endChallenge() public onlyOwner {
        require(challengeActive, "Challenge is not active.");
        require(block.timestamp >= challengeStartTime + challengeDuration, "Challenge period has not yet ended.");

        challengeActive = false;
        distributeRewards();

        emit ChallengeEnded();
    }

    function distributeRewards() private {
        uint256 totalWinners = winnerList.length;

        address[] memory internalWinnerList = winnerList;
        if (totalWinners > 0) {
            uint256 rewardAmount = address(this).balance / totalWinners;
            for (uint i = 0; i < internalWinnerList.length; i++) {
                payable(internalWinnerList[i]).transfer(rewardAmount);
                emit RewardDistributed(internalWinnerList[i], rewardAmount);
            }
        }
    }

    function getParticipantList() external view returns (address[] memory) {
        return participantList;
    }

    function getWinnerList() external view returns (address[] memory) {
        return winnerList;
    }
}
