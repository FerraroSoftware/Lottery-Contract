const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

// Only run on dev chains
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle, vrfCoordinatorV2Mock;

      beforeEach(async () => {
        const { deployer } = await getNamedAccounts();
        // from tags
        await deployments.fixture(["all"]);

        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });

      describe("constructor", function () {
        it("intitiallizes the raffle correctly", async () => {
          // Ideally, we'd separate these out so that only 1 assert per "it" block
          // And ideally, we'd make this check everything
          const raffleState = await raffle.getRaffleState();
          const interval = await raffle.getInterval();
          assert.equal(raffleState.toString(), "0");
          assert.equal(
            interval.toString(),
            networkConfig[network.config.chainId]["keepersUpdateInterval"]
          );
        });
      });
    });
