import { NameCard } from "@typechains";
import { ethers, getNamedAccounts } from "hardhat";

const main = async () => {
  const { developer } = await getNamedAccounts();
  const signer = await ethers.getSigner(developer);

  const nameCard = await ethers.getContract<NameCard>("NameCard");
};

main();
