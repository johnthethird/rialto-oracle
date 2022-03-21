// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import {DSTestPlus} from './utils/DSTestPlus.sol';

import '../EternalStorage.sol';
import '../Oracle.sol';

contract OracleTest is DSTestPlus {
  address oracleUpdater;
  bytes32 key;
  EternalStorage es;
  Oracle oracle;

  function setUp() public {
    oracleUpdater = address(0xDEADBEEF);

    es = new EternalStorage();
    oracle = new Oracle(address(es));
    oracle.transferOwnership(oracleUpdater);
    es.upgradeVersion(address(oracle));
  }

  function testOracle() public {
    hevm.prank(oracleUpdater); // Impersonate an address
    oracle.setPChainBalance(1);
    assertEq(oracle.getPChainBalance(), 1);
  }

  function testPause() public {
    hevm.startPrank(oracleUpdater); // Impersonate an address
    oracle.pause();
    hevm.expectRevert('Pausable: paused');
    oracle.setPChainBalance(1);
  }

  function testFailOracle() public {
    oracle.setPChainBalance(1);
  }
}
