import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * @dev this script is used for tests and deployments on hardhat network
 * @deployer person who deployed
 * @date deployed date
 * @description summary of this deployment
 */

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  const { deploy } = deployments;
  const [developer] = await ethers.getSigners();

  // entryFee: 1 ETH로 설정
  const entryFee = ethers.utils.parseEther("1");

  await deploy("Challenge", {
    from: developer.address,
    contract: "Challenge",
    args: [entryFee],
    log: true,
    autoMine: true,
  });
};

export default func;
func.tags = ["001_deploy_contracts"];
