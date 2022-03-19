import { Oracle } from './typechain/Oracle.d';
import { EternalStorage } from './typechain/EternalStorage.d';
import 'dotenv/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-solhint';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import 'hardhat-spdx-license-identifier';
import '@typechain/hardhat';
import chalk from 'chalk';
import process from 'node:process';
import { HardhatUserConfig, task } from 'hardhat/config';
import { removeConsoleLog } from 'hardhat-preprocessor';

// When using the hardhat network, you may choose to fork Fuji or Avalanche Mainnet
// This will allow you to debug contracts using the hardhat network while keeping the current network state
// To enable forking, set env var FORK=fuji|mainnet then run `npx hardhat node` or `npx hardhat test`
// For more information go to the hardhat guide
// https://hardhat.org/hardhat-network/
// https://hardhat.org/guides/mainnet-forking.html
function forkingData() {
  var url: string = '',
    blockNumber: number = 0;
  const f = process.env.FORK;
  if (!f) return;

  if (f == 'fuji') {
    url = 'https://api.avax-test.network/ext/bc/C/rpc';
    // blockNumber: 7476190,
  }

  if (f == 'mainnet') {
    url = 'https://api.avax.network/ext/bc/C/rpc';
    // blockNumber: 7476190,
  }
  const cfg = { url };
  blockNumber && ((cfg as any).blockNumber = blockNumber);
  console.log(`Forking ${f}:`, cfg);
  return cfg;
}

const accounts = {
  mnemonic: process.env.MNEMONIC || 'test test test test test test test test test test test junk',
};

task('accounts', 'Prints the list of accounts', async (taskArgs, { ethers }) => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// npx hardhat --network fuji balance --account 0xe757FdF984e0e4F3B5cC2F049Dc4A3b228A10421
task('balance', 'Prints account balance')
  .addParam('account', "The account's address")
  .setAction(async (taskArgs, { ethers }) => {
    const account = ethers.utils.getAddress(taskArgs.account);
    const balance = await ethers.provider.getBalance(account);

    console.log(ethers.utils.formatEther(balance), 'AVAX');
  });

task('verifyall', 'Verify all contracts on snowtrace').setAction(async (taskArgs, { run, deployments }) => {
  const allDeployments = await deployments.all();
  // EternalStorage
  await run('verify:verify', { address: allDeployments.EternalStorage.address });
  // Now do Oracle, which takes the EternalStorage address as an argument
  await run('verify:verify', {
    address: allDeployments.Oracle.address,
    constructorArguments: [allDeployments.EternalStorage.address],
  });
});

task('info', 'Info from all contracts').setAction(async (taskArgs, { ethers, deployments }) => {
  const eternalStorage = await ethers.getContractAt(
    'EternalStorage',
    (
      await deployments.get('EternalStorage')
    ).address,
  );
  const latestVersion = await eternalStorage.latestVersion();
  const oracle = await ethers.getContractAt('Oracle', (await deployments.get('Oracle')).address);
  const bal = await oracle.getPChainBalance();
  const paused = await oracle.paused();

  console.log(chalk`
    {green ⌲ EternalStorage} at ${eternalStorage.address}
      Accepts writes from {green Oracle} at ${latestVersion}
    {green ⌲ Oracle} at ${oracle.address}
      P-Chain Balance: {yellow ${bal}}
      Paused: {yellow ${paused}}
  `);
});

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      // 0 means the first key from the HD mnemonic
      default: 0,
      // fuji: "0x123...",
    },
    alice: {
      default: 1,
    },
    bob: {
      default: 2,
    },
    carol: {
      default: 3,
    },
  },
  networks: {
    hardhat: {
      // chainId: !forkingData ? 43112 : undefined, //Only specify a chainId if we are not forking
      // chainId: 42113,
      gasPrice: 125000000000,
      // throwOnTransactionFailures: false,
      loggingEnabled: true,
      forking: forkingData(),
    },
    localhost: {
      saveDeployments: true,
      tags: ['local'],
    },
    fuji: {
      chainId: 43113,
      gas: 2100000,
      gasPrice: 25000000000,
      loggingEnabled: true,
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      accounts,
    },
    avash: {
      url: 'http://localhost:9650/ext/bc/C/rpc',
      gasPrice: 25000000000,
      chainId: 43112,
      accounts: [
        '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
        '0x7b4198529994b0dc604278c99d153cfd069d594753d471171a1d102a10438e07',
        '0x15614556be13730e9e8d6eacc1603143e7b96987429df8726384c2ec4502ef6e',
        '0x31b571bf6894a248831ff937bb49f7754509fe93bbd2517c9c73c4144c0e97dc',
        '0x6934bef917e01692b789da754a0eae31a8536eb465e7bff752ea291dad88c675',
        '0xe700bdbdbc279b808b1ec45f8c2370e4616d3a02c336e68d85d4668e08f53cff',
        '0xbbc2865b76ba28016bc2255c7504d000e046ae01934b04c694592a6276988630',
        '0xcdbfd34f687ced8c6968854f8a99ae47712c4f4183b78dcc4a903d1bfe8cbf60',
        '0x86f78c5416151fe3546dece84fda4b4b1e36089f2dbc48496faf3a950f16157c',
        '0x750839e9dbbd2a0910efe40f50b2f3b2f2f59f5580bb4b83bd8c1201cf9a010a',
      ],
    },
  },
  etherscan: {
    apiKey: {
      avalanche: process.env.SNOWTRACE_API_KEY,
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY,
    },
  },
  preprocess: {
    eachLine: removeConsoleLog((bre) => bre.network.name !== 'hardhat' && bre.network.name !== 'localhost'),
  },
  external: process.env.HARDHAT_FORK
    ? {
        deployments: {
          // process.env.HARDHAT_FORK will specify the network that the fork is made from.
          // these lines allow it to fetch the deployments from the network being forked from both for node and deploy task
          hardhat: ['deployments/' + process.env.HARDHAT_FORK],
          localhost: ['deployments/' + process.env.HARDHAT_FORK],
        },
      }
    : undefined,
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
export default config;
