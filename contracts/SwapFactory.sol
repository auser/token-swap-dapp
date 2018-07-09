pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./SwapContract.sol";

contract SwapFactory is Ownable {

  address public tokenAddress;
  address public controllerAddress;
  address public tokenOwner;

  // index of created contracts
  struct SwapContractStruct {
    address contractAddress;
    uint index;
    string name;
  }

  mapping (uint => SwapContractStruct) private contractStructs;
  uint[] private contractIndex;

  event ContractCreated(uint index, string name);
  event ContractRemoved(uint index);
  event ContractUpdated(uint index, string name);

  /**
   * @dev constructor
   */
  constructor(
    address _tokenAddress,
    address _controllerAddress,
    address _tokenOwner
  )
    Ownable()
    public
  {
    require(_tokenAddress != address(0));
    require(_controllerAddress != address(0));
    require(_tokenOwner != address(0));

    tokenAddress = _tokenAddress;
    controllerAddress = _controllerAddress;
    tokenOwner = _tokenOwner;
  }

  // Contract creation functions

  /**
   * @dev check if a contract is actually a contract set in the contract
   * @param _contractIndex the index of the contractStructs list
   * @return bool is a contract or not
   */
  function isContract(uint _contractIndex)
    public
    constant
    returns (bool)
  {
    if (contractIndex.length == 0) return false;
    return contractStructs[_contractIndex].index == _contractIndex;
  }

  /**
   * @dev add a contract to the list
   *  and deploy the new contract on the blockchain
   * @param name string of the name of the contract
   * @return index uint of the index in the list of the contract
   */
  function insertContract(
    string name
  )
    public
    returns (uint index)
  {
    require(!contractByNameExists(name));
    uint _contractIndex = getContractCount();
    require(!isContract(_contractIndex));

    SwapContract c = new SwapContract(
      tokenAddress,
      controllerAddress,
      tokenOwner
    );
    c.transferOwnership(msg.sender);
    contractStructs[_contractIndex].name = name;
    contractStructs[_contractIndex].index = contractIndex.push(_contractIndex) - 1;
    contractStructs[_contractIndex].contractAddress = c;

    emit ContractCreated(contractStructs[_contractIndex].index, contractStructs[_contractIndex].name);
    return contractStructs[_contractIndex].index;
  }

  /**
   * @dev delete a contract from the list
   * @param _contractIndex the uint index in the contract list
   * @return index uint of the index deleted
   */
  function removeContract(
    uint _contractIndex
  )
    onlyOwner
    public
    returns (uint index)
  {
    require(isContract(_contractIndex));
    uint rowToDelete = contractStructs[_contractIndex].index;
    uint keyToMove = contractIndex[contractIndex.length - 1];
    contractIndex[_contractIndex] = keyToMove;
    contractStructs[keyToMove].index = rowToDelete;
    contractIndex.length--;

    emit ContractRemoved(rowToDelete);
    return rowToDelete;
  }

  /**
   * @dev get a contract in the contract list
   * @param _contractIndex uint of the contract instance
   * @return (string, address, uint) details of the contract
   */
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

  /**
   * @dev update the name of the contract in the contract list
   * @param _contractIndex uint index of the contract in the list
   * @param newName string of the new name of the contract
   */
  function updateContractName(
    uint _contractIndex,
    string newName
  )
    public
    returns (bool success)
  {
    require(isContract(_contractIndex));
    require(!contractByNameExists(newName));

    contractStructs[_contractIndex].name = newName;
    emit ContractUpdated(_contractIndex, contractStructs[_contractIndex].name);
    return true;
  }

  /**
   * @dev get the total count of contracts in the contract
   * @return contractCount uint of the number of contracts
   */
  function getContractCount()
    public
    constant
    returns (uint contractCount)
  {
    return contractIndex.length;
  }

  /**
   * @dev does a contract by its name already exist in the contract
   * @param name string of the name to check
   * @return bool if the contract exists in the contract
   */
  function contractByNameExists(
    string name
  )
    public
    view
    returns (bool)
  {
    if (contractIndex.length == 0) return false;
    for (uint i = 0; i < contractIndex.length; i++) {
      if (stringToUint(contractStructs[i].name) == stringToUint(name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @dev contract index for the name
   * @param name string the name of the contract
   * @return (found, index) if the contract was found and the index
   */
  function contractIndexForName(string name)
    public
    view
    returns (bool found, uint index)
  {
    if(contractIndex.length == 0) return (false, 0);
    for (uint i = 0; i < contractIndex.length; i++) {
      if (stringToUint(contractStructs[i].name) == stringToUint(name)) {
        return (true, i);
      }
    }
    return (false, 0);
  }

  /**
   * @dev get the contract by index
   * @param _contractIndex uint of the index of the contract
   * @return (string, address, uint) details of the contract
   */
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
   * @param s string to turn into uint
   * @return uint result of the string into uint
   */
  function stringToUint(string s) public pure returns (bytes32 result) {
    bytes memory b = bytes(s);
    result = keccak256(b);
  }
}
