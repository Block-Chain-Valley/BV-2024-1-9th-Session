import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { setup } from "./setup";
import { NameCard } from "@typechains";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import { mockNameCardInput } from "./mock/mock";

describe("명함 컨트랙트 테스트", () => {
  /* Signer */
  let admin: SignerWithAddress;
  let users: SignerWithAddress[];

  /* 컨트랙트 객체 */
  let nameCard: NameCard;

  /* 테스트 스냅샷 */
  let initialSnapshotId: number;
  let snapshotId: number;

  before(async () => {
    /* 테스트에 필요한 컨트랙트 및 Signer 정보를 불러오는 함수 */
    ({ admin, users, nameCard } = await setup());
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

  it("명함이 정상적으로 생성되는가?", async () => {
    const nameCardInput = mockNameCardInput();
    /*
      트랜잭션의 성공, 실패 또는 이벤트 결과 등 트랜잭션의 실행 결과와 관련된 값은 expect 밖에서 비동기 처리를 해 준다.
    */
    await expect(nameCard.connect(users[0]).upsertNameCard(users[0].address, nameCardInput))
      .to.emit(nameCard, "NameCardUpserted")
      .withArgs(users[0].address, Object.values(nameCardInput));
  });

  it("생성된 명함 조회가 가능한가?", async () => {
    const nameCardInput = mockNameCardInput();
    await nameCard.connect(users[0]).upsertNameCard(users[0].address, nameCardInput);

    const { name, phoneNum, team, year } = await nameCard.getNameCard(users[0].address);
    expect(name).to.equal(nameCardInput.name);
    expect(phoneNum).to.equal(nameCardInput.phoneNum);
    expect(team).to.equal(nameCardInput.team);
    expect(year).to.equal(Number(nameCardInput.year));
  });
});
