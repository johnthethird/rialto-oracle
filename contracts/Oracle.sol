//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./EternalStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Oracle is Ownable, Pausable {
  address public eternalStorage;

  bytes32 private constant pChainBalanceKey = keccak256(abi.encodePacked("pchainbalance"));

  event PChainBalanceChanged(uint256 _value);

  constructor(address _eternalStorage) {
    eternalStorage = _eternalStorage;
  }

  function getPChainBalance() public view returns (uint256) {
    return EternalStorage(eternalStorage).getUIntValue(pChainBalanceKey);
  }

  function setPChainBalance(uint256 _value) public onlyOwner whenNotPaused {
    EternalStorage(eternalStorage).setUIntValue(pChainBalanceKey, _value);
    emit PChainBalanceChanged(_value);
  }

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }
}
