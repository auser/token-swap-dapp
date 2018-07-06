pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract SwapContract is Ownable {
    using SafeMath for uint256;
    address public tokenOwner;
    address public tokenAddress;
    address public controllerTokenAddress;

    struct TransferRequest {
        address investor;
        uint256 amount;
        bool approved;
        uint index;
    }

    uint256 private constant decimalFactor = 10**uint256(18);
    uint _numRequests;
    mapping (uint => TransferRequest) _requests;

    event RequestToTransfer(uint numRequests);
    event TransferExecuted(uint index, address indexed investor, uint256 amount);

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
      address _controllerTokenAddress,
      address _tokenOwner
    )
        Ownable()
        public
    {
      require(_tokenAddress != address(0));
      require(_controllerTokenAddress != address(0));
      require(_tokenOwner != address(0));

      tokenAddress = _tokenAddress;
      controllerTokenAddress = _controllerTokenAddress;
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

    function executeTransfers()
        onlyTokenOwner
        public
        returns (bool)
    {
        if (_numRequests == 0) return false;
        ERC20 token = ERC20(tokenAddress);
        uint numRequests = 1; //_numRequests;
        for (uint i = 0; i < numRequests; i++) {
            TransferRequest storage req = _requests[i];
            if (!req.approved) {
                // Execute transfer
                token.transfer(req.investor, req.amount);
                emit TransferExecuted(i, req.investor, req.amount);
                _requests[i].approved = true;
            }
        }
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
      return controllerTokenAddress;
    }

    function getTokenAddress()
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
     * @dev get the approval status of the transfer request
     * @param idx the index of the transfer request
     * @return bool the status of the approved transfer request
     */
    function getTransferRequestApproval(
        uint idx
    )
        onlyTokenOwner
        public
        view
        returns (bool)
    {
        return _requests[idx].approved;
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
