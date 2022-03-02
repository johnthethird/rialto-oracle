//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EternalStorage is Ownable {
  address public latestVersion;

  string private constant ERROR_LATESTVERSION = "only latestVersion can call update this contract";

  mapping(bytes32 => address) AddressStorage;
  mapping(bytes32 => bool) BooleanStorage;
  mapping(bytes32 => bytes) BytesStorage;
  mapping(bytes32 => int256) IntStorage;
  mapping(bytes32 => string) StringStorage;
  mapping(bytes32 => uint256) UIntStorage;

  modifier onlyLatestVersion() {
    require(msg.sender == latestVersion, ERROR_LATESTVERSION);
    _;
  }

  function upgradeVersion(address _newVersion) public onlyOwner {
    latestVersion = _newVersion;
  }

  function getAddressValue(bytes32 record) public view returns (address) {
    return AddressStorage[record];
  }

  function getBooleanValue(bytes32 record) public view returns (bool) {
    return BooleanStorage[record];
  }

  function getBytesValue(bytes32 record) public view returns (bytes memory) {
    return BytesStorage[record];
  }

  function getIntValue(bytes32 record) public view returns (int256) {
    return IntStorage[record];
  }

  function getStringValue(bytes32 record) public view returns (string memory) {
    return StringStorage[record];
  }

  function getUIntValue(bytes32 record) public view returns (uint256) {
    return UIntStorage[record];
  }

  function setAddressValue(bytes32 record, address value) public onlyLatestVersion {
    AddressStorage[record] = value;
  }

  function setBooleanValue(bytes32 record, bool value) public onlyLatestVersion {
    BooleanStorage[record] = value;
  }

  function setBytesValue(bytes32 record, bytes memory value) public onlyLatestVersion {
    BytesStorage[record] = value;
  }

  function setIntValue(bytes32 record, int256 value) public onlyLatestVersion {
    IntStorage[record] = value;
  }

  function setStringValue(bytes32 record, string memory value) public onlyLatestVersion {
    StringStorage[record] = value;
  }

  function setUIntValue(bytes32 record, uint256 value) public onlyLatestVersion {
    UIntStorage[record] = value;
  }

  function deleteUint(bytes32 _key) public onlyLatestVersion {
    delete UIntStorage[_key];
  }

  function deleteString(bytes32 _key) public onlyLatestVersion {
    delete StringStorage[_key];
  }

  function deleteAddress(bytes32 _key) public onlyLatestVersion {
    delete AddressStorage[_key];
  }

  function deleteBytes(bytes32 _key) public onlyLatestVersion {
    delete BytesStorage[_key];
  }

  function deleteBool(bytes32 _key) public onlyLatestVersion {
    delete BooleanStorage[_key];
  }

  function deleteInt(bytes32 _key) public onlyLatestVersion {
    delete IntStorage[_key];
  }
}
