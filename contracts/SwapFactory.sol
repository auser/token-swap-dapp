pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./SwapContract.sol";

contract SwapContractFactory is Ownable {

  address public tokenAddress;
  address public tokenOwner;

  // index of created contracts
  struct SwapContractStruct {
    address contractAddress;
    uint index;
    string name;
  }

  mapping (uint => SwapContractStruct) private contractStructs;
  uint[] private contractIndex;

  event ContractCreated(uint index);
  event ContractDeleted(uint index);
  event ContractUpdated(uint index);

  constructor(
    address _tokenAddress,
    address _tokenOwner
  )
    Ownable()
    public
  {
    require(_tokenAddress != address(0));
    require(_tokenOwner != address(0));

    tokenAddress = _tokenAddress;
    tokenOwner = _tokenOwner;
  }

  // Contract creation functions
  function isContract(uint _contractIndex)
    public
    constant
    returns (bool)
  {
    if (contractIndex.length == 0) return false;
    return contractStructs[_contractIndex].index == _contractIndex;
  }

  function insertContract(
    string name
  )
    public
    returns (uint index)
  {
    uint _contractIndex = stringToUint(name);
    require(!isContract(_contractIndex));

    SwapContract c = new SwapContract(
      tokenAddress,
      tokenOwner
    );
    c.transferOwnership(msg.sender);
    contractStructs[_contractIndex].name = name;
    contractStructs[_contractIndex].index = contractIndex.push(_contractIndex) - 1;
    contractStructs[_contractIndex].contractAddress = c;

    emit ContractCreated(contractStructs[_contractIndex].index);
    return contractIndex.length - 1;
  }

  function deleteContract(
    uint _contractIndex
  )
    public
    returns (uint index)
  {
    require(isContract(_contractIndex));
    uint rowToDelete = contractStructs[_contractIndex].index;
    uint keyToMove = contractIndex[contractIndex.length - 1];
    contractIndex[_contractIndex] = keyToMove;
    contractStructs[keyToMove].index = rowToDelete;
    contractIndex.length--;

    emit ContractDeleted(rowToDelete);
    return rowToDelete;
  }

  function getContract(
    uint _contractIndex
  )
    public
    constant
    returns (string, address, uint)
  {
    require(isContract(_contractIndex));
    return (
      contractStructs[_contractIndex].name,
      contractStructs[_contractIndex].contractAddress,
      contractStructs[_contractIndex].index
    );
  }

  function updateContractName(
    uint _contractIndex,
    string newName
  )
    public
    returns (bool success)
  {
    require(isContract(_contractIndex));

    contractStructs[_contractIndex].name = newName;
    emit ContractUpdated(_contractIndex);
    return true;
  }

  function getContractCount()
    public
    constant
    returns (uint contractCount)
  {
    return contractIndex.length;
  }

  function getContractAtIndex(
    uint _contractIndex
  )
    public
    constant
    returns (string, address, uint)
  {

    SwapContractStruct storage tcs = contractStructs[contractIndex[_contractIndex]];
    return (
      tcs.name,
      tcs.contractAddress,
      tcs.index
    );
  }

  /**
   * @dev turn a string into a uint
   */
  function stringToUint(string s) public pure returns (uint result) {
    bytes memory b = bytes(s);
    uint i;
    result = 0;
    for (i = 0; i < b.length; i++) {
        uint c = uint(b[i]);
        if (c >= 48 && c <= 57) {
            result = result * 10 + (c - 48);
        }
    }
  }
}
