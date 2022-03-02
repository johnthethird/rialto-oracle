import { expect } from "chai";
// import { Signer, Contract } from "ethers";
import { ethers, upgrades, deployments, getNamedAccounts, network } from "hardhat";
import { setupUser, isLocal } from "./utils";
// import { Oracle } from "../typechain";

// const ZERO_ADDRESS = ethers.constants.AddressZero;

// Prefer this technique over before() as we dont clutter top level scope with vars
const setup = deployments.createFixture(async () => {
  if (isLocal(network.name)) {
    console.log("FIXTURES");
    await deployments.fixture(["EternalStorage", "Oracle"]);
  }
  const EternalStorage = await deployments.get("EternalStorage");
  const Oracle = await deployments.get("Oracle");
  const contracts = {
    eternalStorage: await ethers.getContractAt("EternalStorage", EternalStorage.address),
    oracle: await ethers.getContractAt("Oracle", Oracle.address),
  };

  const setTx = await contracts.eternalStorage.upgradeVersion(contracts.oracle.address);
  await setTx.wait();

  const { deployer, alice } = await getNamedAccounts();

  return {
    ...contracts,
    deployer: await setupUser(deployer, contracts),
    alice: await setupUser(alice, contracts),
  };
});

describe("Oracle", function () {
  it("Should be initialized", async function () {
    const { oracle } = await setup();
    expect(await oracle.getPChainBalance()).to.equal(0);
  });

  it("Should update the balance", async function () {
    const { oracle } = await setup();
    const setBalanceTx = await oracle.setPChainBalance(1000);
    await setBalanceTx.wait();
    expect(await oracle.getPChainBalance()).to.equal(1000);
  });

  it("Should not allow unprivledged accounts to update balance", async function () {
    const { alice } = await setup();
    await expect(alice.oracle.setPChainBalance(1000)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should implement pausable", async function () {
    const { oracle } = await setup();
    const tx = await oracle.pause();
    await tx.wait();
    expect(await oracle.paused()).to.be.true;
    await expect(oracle.setPChainBalance(1000)).to.be.revertedWith("Pausable: paused");
  });
});

// function ETH(value) {
//   return web3.utils.toWei(value + "", "ether");
// }
