// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import {DSTestPlus} from './utils/DSTestPlus.sol';
import '../EternalStorage.sol';

contract EternalStorageTest is DSTestPlus {
  address zeroAddress;
  address storageUpdater;
  bytes32 key;
  EternalStorage es;

  function setUp() public {
    zeroAddress = address(0x0);
    storageUpdater = address(0xDEADBEEF);
    key = keccak256('key');
    es = new EternalStorage();
  }

  function testEternalStorage() public {
    assertEq(es.latestVersion(), zeroAddress);
    es.upgradeVersion(storageUpdater);
    assertEq(es.latestVersion(), storageUpdater);
    hevm.prank(storageUpdater); // Impersonate an address
    es.setIntValue(key, 1);
    assertEq(es.getIntValue(key), 1);
  }

  // Accepting params will fuzz the test
  function testEternalStorageFuzz(int256 i) public {
    assertEq(es.latestVersion(), zeroAddress);
    es.upgradeVersion(storageUpdater);
    assertEq(es.latestVersion(), storageUpdater);
    hevm.prank(storageUpdater); // Impersonate an address
    es.setIntValue(key, i);
    assertEq(es.getIntValue(key), i);
  }

  // A test named *Fail* is expected to fail
  function testFailEternalStorage() public {
    es.setIntValue(key, 1);
  }

  // Or use expectRevert
  function testEternalStorageRevert() public {
    hevm.expectRevert('only latestVersion can call update this contract');
    es.setIntValue(key, 1);
  }
}
