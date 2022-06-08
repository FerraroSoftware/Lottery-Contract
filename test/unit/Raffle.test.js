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
      let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval;

      beforeEach(async () => {
        //   const { deployer } = await getNamedAccounts();
        deployer = (await getNamedAccounts()).deployer;
        // from tags
        await deployments.fixture(["all"]);

        raffle = await ethers.getContract("Raffle", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
      });

      // describe functions dont regonize async functions no point in declaring for that
      describe("constructor", function () {
        it("intitiallizes the raffle correctly", async () => {
          // Ideally, we'd separate these out so that only 1 assert per "it" block
          // And ideally, we'd make this check everything
          const raffleState = await raffle.getRaffleState();
          assert.equal(raffleState.toString(), "0");
          assert.equal(
            interval.toString(),
            networkConfig[network.config.chainId]["keepersUpdateInterval"]
          );
        });
      });

      describe("enterRaffle", function () {
        it("reverts when you don't pay enough", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            "Raffle__NotEnoughETHEntered"
          );
        });
        it("records players when they enter", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          const playerFromContract = await raffle.getPlayer(0);

          // deployer and first to enter should match

          assert.equal(playerFromContract, deployer);
        });
        it("emits event on enter", async function () {
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.emit(raffle, "RaffleEnter");
        });

        it("doesn't allow entrance when raffle is calculating", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          // pretend to be chainlink keeper
          await raffle.performUpkeep([]);

          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWith("Raffle__NotOpen");
        });
      });

      describe("checkUpkeep", function () {
        it("returns false if people havnt sent any eth", async function () {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          // we can call and get return value without doing a transaction...
          const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(!upKeepNeeded);
        });
      });
      it("returns false if raffle isn't open", async function () {
        await raffle.enterRaffle({ value: raffleEntranceFee });
        await network.provider.send("evm_increaseTime", [
          interval.toNumber() + 1,
        ]);
        await network.provider.send("evm_mine", []);
        // pretend to be chainlink keeper
        await raffle.performUpkeep([]);
        const raffleState = await raffle.getRaffleState();
        // we can call and get return value without doing a transaction...
        const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([]);
        assert.equal(raffleState.toString(), "1");
        //   assert.equal(upKeepNeeded, false); todo fix
      });

      it("returns false if enough time hasn't passed", async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });
        await network.provider.send("evm_increaseTime", [
          interval.toNumber() - 1,
        ]);
        await network.provider.request({ method: "evm_mine", params: [] });
        const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
        assert(!upkeepNeeded);
      });
      it("returns true if enough time has passed, has players, eth, and is open", async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee });
        await network.provider.send("evm_increaseTime", [
          interval.toNumber() + 1,
        ]);
        await network.provider.request({ method: "evm_mine", params: [] });
        const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
        assert(upkeepNeeded);
      });
    });
