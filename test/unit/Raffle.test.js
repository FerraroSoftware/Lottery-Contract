// const { assert, expect } = require("chai");
// const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
// const {
//   developmentChains,
//   networkConfig,
// } = require("../../helper-hardhat-config");

// // Only run on development chains
// !developmentChains.includes(network.name)
//   ? describe.skip
//   : describe("Raffle", async function () {
//       let raffle, vrfCoordinatorV2Mock;
//       const chainId = network.config.chainId;

//       beforeEach(async function () {
//         const { deployer } = await getNamedAccounts();
//         // all tag from deploy scripts
//         await deployments.fixture("[all");
//         raffle = await ethers.getContract("Raffle", deployer);
//         vrfCoordinatorV2Mock = await ethers.getContract(
//           "VRFCoordinatorV2Mock",
//           deployer
//         );
//       });

//       describe("constuctor", async function () {
//         it("initializes the raffle correctly", async function () {
//           // Ideally we make our tests have just 1 assert per "it"
//           const raffleState = await raffle.getRaffleState();
//           const interval = await raffle.getInterval();
//           assert.equal(raffleState.toString(), "0");
//           assert.equal(
//             interval == networkConfig[chainId]["keepersUpdateInterval"]
//           );
//         });
//       });
//     });

const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle, vrfCoordinatorV2Mock;

      beforeEach(async () => {
        //   accounts = await ethers.getSigners(); // could also do with getNamedAccounts
        //   deployer = accounts[0]
        //   player = accounts[1];
        const { deployer } = await getNamedAccounts();
        await deployments.fixture(["all"]);

        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        //   raffle = raffleContract.connect(player);
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
