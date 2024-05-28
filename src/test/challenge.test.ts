import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { setup } from "./setup";
import { Challenge } from "@typechains";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { faker } from "@faker-js/faker";
import { HardhatUtil } from "./lib/hardhat-util";

describe("Challenge 컨트랙트 테스트", () => {
  /* Signer */
  let admin: SignerWithAddress;
  let users: SignerWithAddress[];

  /* 컨트랙트 객체 */
  let challenge: Challenge;

  /* 테스트 스냅샷 */
  let initialSnapshotId: number;
  let snapshotId: number;

  before(async () => {
    /* 테스트에 필요한 컨트랙트 및 Signer 정보를 불러오는 함수 */
    ({ admin, users, challenge } = await setup());
    initialSnapshotId = await network.provider.send("evm_snapshot");
  });

  beforeEach(async () => {
    snapshotId = await network.provider.send("evm_snapshot");
  });

  afterEach(async () => {
    await network.provider.send("evm_revert", [snapshotId]);
  });

  after(async () => {
    await network.provider.send("evm_revert", [initialSnapshotId]);
  });

  it("Hardhat 환경 배포 테스트", () => {
    expect(challenge.address).to.not.be.undefined;
  });

  describe("Challenge join 테스트", () => {
    it("상태 변수 값이 정상적으로 업데이트되는가?", async () => {
      const entryFee = await challenge.entryFee();
      await challenge.connect(users[0]).joinChallenge({ value: entryFee });

      const participantList = await challenge.getParticipantList();
      const isValidParticipants = await challenge.isValidParticipants(users[0].address);

      expect(participantList).to.deep.equal([users[0].address]);
      expect(isValidParticipants).to.be.true;
    });

    it("JoinedChallenge 이벤트를 emit하는가?", async () => {
      await expect(challenge.connect(users[0]).joinChallenge({ value: await challenge.entryFee() }))
        .to.emit(challenge, "JoinedChallenge")
        .withArgs(users[0].address);
    });

    it("챌린지가 이미 시작된 경우(challengeActive가 true인 경우), 에러가 발생하는가?", async () => {
      const duration = 86400; // 1 day
      await challenge.connect(admin).startChallenge(duration);

      const entryFee = await challenge.entryFee();
      await expect(challenge.connect(users[0]).joinChallenge({ value: entryFee })).to.be.revertedWith(
        "Challenge has already started.",
      );
    });

    it("Entry Fee보다 부족하거나 더 많은 돈으로 챌린지에 참여 시 에러가 발생하는가?", async () => {
      const entryFee = await challenge.entryFee();
      const insufficientEntryFee = entryFee.div(2);
      await expect(challenge.connect(users[0]).joinChallenge({ value: insufficientEntryFee })).to.be.revertedWith(
        "Incorrect entry fee.",
      );

      const excessEntryFee = entryFee.mul(2);
      await expect(challenge.connect(users[0]).joinChallenge({ value: excessEntryFee })).to.be.revertedWith(
        "Incorrect entry fee.",
      );
    });
  });

  describe("Challenge 시작 테스트", () => {
    const duration = 86400; // 1 day
    let startTimestamp: number;

    beforeEach(async () => {
      startTimestamp = (await HardhatUtil.blockTimeStamp()) + 1;
    });

    it("ChallengeStarted 이벤트를 emit하는가?", async () => {
      await expect(challenge.connect(admin).startChallenge(duration))
        .to.emit(challenge, "ChallengeStarted")
        .withArgs(startTimestamp, duration);
    });

    it("상태 변수 값이 정상적으로 업데이트되는가?", async () => {
      await challenge.connect(admin).startChallenge(duration);

      const challengeActive = await challenge.challengeActive();
      const challengeDuration = await challenge.challengeDuration();
      const challengeStartTime = await challenge.challengeStartTime();

      expect(challengeActive).to.be.true;
      expect(challengeDuration).to.equal(duration);
      expect(challengeStartTime).to.equal(startTimestamp);
    });

    it("챌린지가 이미 시작된 경우 챌린지를 시작할 수 없는가?", async () => {
      await challenge.connect(admin).startChallenge(duration);
      await expect(challenge.connect(admin).startChallenge(duration)).to.be.revertedWith(
        "Challenge is already active.",
      );
    });
  });

  describe("DeclareWinner 테스트", () => {
    const duration = 86400; // 1 day

    beforeEach(async () => {
      /* User 0, 1, 2, 3이 참가자로 참여 */
      const entryFee = await challenge.entryFee();
      const participants = [users[0], users[1], users[2], users[3]];
      await Promise.all(participants.map((user) => challenge.connect(user).joinChallenge({ value: entryFee })));
    });

    it("WinnerDeclared 이벤트를 emit하는가?", async () => {
      /* 챌린지 시작 */
      await challenge.connect(admin).startChallenge(duration);

      /* Winner 지정 */
      await challenge.connect(admin).declareWinner(users[0].address);
      await expect(challenge.connect(admin).declareWinner(users[0].address))
        .to.emit(challenge, "WinnerDeclared")
        .withArgs(users[0].address);
    });

    it("winnerList에 지정한 사용자가 정상적으로 추가되는가?", async () => {
      /* 챌린지 시작 */
      await challenge.connect(admin).startChallenge(duration);

      /* Winner 지정 */
      await challenge.connect(admin).declareWinner(users[0].address);

      const winnerList = await challenge.getWinnerList();
      expect(winnerList).to.deep.equal([users[0].address]);
    });

    it("관리자만 declareWinner 함수를 호출할 수 있는가?", async () => {
      /* 챌린지 시작 */
      await challenge.connect(admin).startChallenge(duration);

      /* Winner 지정 */
      await expect(challenge.connect(users[0]).declareWinner(users[0].address)).to.be.revertedWith(
        "Only owner can call this function.",
      );
    });

    it("이미 챌린지에 join한 참여자만 winner로 지정할 수 있는지?", async () => {
      /* 챌린지 시작 */
      await challenge.connect(admin).startChallenge(duration);

      /* Winner 지정 */
      const invalidAddress = faker.finance.ethereumAddress();
      await expect(challenge.connect(admin).declareWinner(invalidAddress)).to.be.revertedWith(
        "Address is not a participant.",
      );
    });

    it("챌린지가 시작되지 않은 경우에는 winner를 지정할 수 없는가?", async () => {
      await expect(challenge.connect(admin).declareWinner(users[0].address)).to.be.revertedWith(
        "Challenge is not active.",
      );
    });
  });

  describe("EndChallenge 테스트", () => {
    const duration = 86400; // 1 day

    beforeEach(async () => {
      /* User 0, 1, 2, 3이 참가자로 참여 */
      const entryFee = await challenge.entryFee();
      const participants = [users[0], users[1], users[2], users[3]];
      await Promise.all(participants.map((user) => challenge.connect(user).joinChallenge({ value: entryFee })));

      /* 챌린지 시작 */
      await challenge.connect(admin).startChallenge(duration);

      /* User 0, User 1을 Winner로 지정 */
      const winners = [users[0], users[1]];
      await Promise.all(winners.map((winner) => challenge.connect(admin).declareWinner(winner.address)));
    });

    it("RewardDistributed가 Winner 수 만큼 emit하는가?", async () => {
      /* 챌린지 종료 시간으로 이동 */
      await HardhatUtil.passNSeconds(duration);

      /* 챌린지 종료 */
      const participantNum = (await challenge.getParticipantList()).length;
      const winnerList = await challenge.getWinnerList();

      const entryFee = await challenge.entryFee();
      const expectedReward = entryFee.mul(participantNum).div(winnerList.length);

      const receipt = await (await challenge.connect(admin).endChallenge()).wait();
      const events = receipt.events?.filter((event) => event.event === "RewardDistributed");

      expect(events).to.have.lengthOf(winnerList.length);
      events?.forEach((event) => {
        expect(event.args?.winner).to.be.oneOf(winnerList);
        expect(event.args?.amount).to.equal(expectedReward);
      });
    });

    it("ChallengeEnded 이벤트가 emit하는가?", async () => {
      /* 챌린지 종료 시간으로 이동 */
      await HardhatUtil.passNSeconds(duration);

      /* 챌린지 종료 */
      await expect(challenge.connect(admin).endChallenge()).to.emit(challenge, "ChallengeEnded");
    });

    it("Winner가 정상적으로 보상을 받는가?", async () => {
      /* 챌린지 종료 시간으로 이동 */
      await HardhatUtil.passNSeconds(duration);

      /* 챌린지 종료 */
      const winnerList = await challenge.getWinnerList();
      const participantNum = (await challenge.getParticipantList()).length;
      const entryFee = await challenge.entryFee();
      const expectedReward = entryFee.mul(participantNum).div(winnerList.length);

      /* EndChallenge 전후 잔고 비교 */
      const winnerBalanceBeforeEnd = await ethers.provider.getBalance(winnerList[0]);
      await challenge.connect(admin).endChallenge();
      const winnerBalanceAfterEnd = await ethers.provider.getBalance(winnerList[0]);

      expect(winnerBalanceAfterEnd.sub(winnerBalanceBeforeEnd)).to.equal(expectedReward);
    });

    it("ChallengeActive가 업데이트 되는가?", async () => {
      /* 챌린지 종료 시간으로 이동 */
      await HardhatUtil.passNSeconds(duration);

      /* 챌린지 종료 */
      await challenge.connect(admin).endChallenge();
      const challengeActive = await challenge.challengeActive();
      expect(challengeActive).to.be.false;
    });

    it("관리자만 endChallenge 함수를 호출할 수 있는가?", async () => {
      /* 챌린지 종료 시간으로 이동 */
      await HardhatUtil.passNSeconds(duration);

      /* 챌린지 종료 */
      await expect(challenge.connect(users[0]).endChallenge()).to.be.revertedWith("Only owner can call this function.");
    });

    it("챌린지 종료 시간 전에 endChallenge 함수 호출 시 에러가 발생하는가?", async () => {
      await expect(challenge.connect(admin).endChallenge()).to.be.revertedWith("Challenge period has not yet ended.");
    });

    it("챌린지 시작 전 endChallenge 함수 호출 시 에러가 발생하는가?", async () => {
      /* 챌린지 종료 시간으로 이동 */
      await HardhatUtil.passNSeconds(duration);

      /* endChallenge 호출하여 기존 챌린지 종료 */
      await challenge.connect(admin).endChallenge();

      /* 챌린지 시작 전 endChallenge 호출 */
      await expect(challenge.connect(admin).endChallenge()).to.be.revertedWith("Challenge is not active.");
    });
  });
});
