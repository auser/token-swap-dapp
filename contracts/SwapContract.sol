pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract SwapContract is Ownable {
    using SafeMath for uint256;
    address public tokenOwner;
    address public tokenAddress;

    struct TransferRequest {
        address investor;
        uint256 amount;
        bool approved;
        uint index;
    }

    uint _numRequests;
    mapping (uint => TransferRequest) _requests;

    event RequestToTransfer(uint numRequests);

    /**
     * @dev only the token owner and owner of the contract
     *  can execute with this modifier
     */
    modifier onlyTokenOwner() {
        require(
            msg.sender == tokenOwner ||
            msg.sender == owner
        );
        _;
    }

    /**
     * @dev constructor
     * @param _tokenAddress address of the swap controller contract
     * @param _tokenOwner address of the owner of the token
     */
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

    /**
     * @dev main function for creating transfer requests
     * @param _amount uint amount of tokens requested in swap
     * @return bool success boolean
     */
    function requestTransfer(
      uint _amount
    )
      public
      returns (bool)
    {
      uint _requestId = _numRequests++;
      TransferRequest memory req = TransferRequest(
        msg.sender, // investor
        _amount,
        false,
        _requestId
      );
      _requests[_requestId] = req;
      // emit
      emit RequestToTransfer(_numRequests);
      return true;
    }

    /**
     * @dev get the token owner address
     * @return address of the token owner
     */
    function getTokenOwnerAddress()
      public
      view
      returns (address)
    {
      return tokenOwner;
    }

    /**
     * @dev get controller token address
     * @return address of the original token address
     */
    function getControllerTokenAddress()
      public
      view
      returns (address)
    {
      return tokenAddress;
    }

    /**
     * @dev get transfer request amount for a transfer request
     * @param idx index of the transfer request in the list
     * @return uint the amount requested in the transfer
     */
    function getTransferRequestAmount(
      uint idx
    )
      onlyTokenOwner
      public
      view
      returns (uint256)
    {
      return _requests[idx].amount;
    }

    /**
     * @dev get the transfer request investor address
     * @param idx the index of the transfer request in the list
     * @return address the address of the investor
     */
    function getTransferRequestInvestor(
      uint idx
    )
      onlyTokenOwner
      public
      view
      returns (address)
    {
      return _requests[idx].investor;
    }

    /**
     * @dev get the number of all transfer requests
     * @return uint the amount of transfer requests
     */
    function getTransferRequestCount()
      onlyTokenOwner
      public
      view
      returns (uint)
    {
      return _numRequests;
    }
}
