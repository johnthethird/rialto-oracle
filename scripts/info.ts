import { EternalStorage } from './../typechain/EternalStorage.d';
import { Oracle } from './../typechain/Oracle.d';
import { BigNumber, Contract } from 'ethers';
import { ethers, deployments, getNamedAccounts } from 'hardhat';
import chalk from 'chalk';

// Gotta be a better incantation than this
const getC = async (name: string): Promise<Contract> =>
  await ethers.getContractAt(name, (await deployments.get(name)).address);

const main = async (): Promise<any> => {
  const { deployer } = await getNamedAccounts();

  const eternalStorage: EternalStorage = (await getC('EternalStorage')) as EternalStorage;
  const latestVersion: String = await eternalStorage.latestVersion();

  const oracle: Oracle = (await getC('Oracle')) as Oracle;
  const bal: BigNumber = await oracle.getPChainBalance();
  const paused: boolean = await oracle.paused();

  console.log(chalk`
    {green ⌲ EternalStorage} at ${eternalStorage.address}
      Accepts writes from {green Oracle} at ${latestVersion}
    {green ⌲ Oracle} at ${oracle.address}
      P-Chain Balance: {yellow ${bal}}
      Paused: {yellow ${paused}}
  `);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
