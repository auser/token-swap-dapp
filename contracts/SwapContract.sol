pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';

import "./SwapController.sol";


contract SwapContract is Ownable, Destructible  {
    using SafeMath for uint256;
    address public tokenOwner;
    address public tokenAddress;
    address public controllerTokenAddress;

    bool public reset = true;

    struct TransferRequest {
        address toAddress;
        address txAddress;
        uint256 amount;
        bool completed;
        uint index;
    }

    uint256 private constant decimalFactor = 10**uint256(18);
    uint _numRequests;
    mapping (uint => TransferRequest) _requests;

    event RequestToTransfer(uint numRequests, uint requestId, address investor,
                           uint256 amount);
    event TransferExecuted(uint idx, address indexed investor, uint256 amount);

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
     * @dev main function for creating transfer requests in bulk
     * @param _toAddresses address[] destination to send SHOPIN tokens
     * @param _txAddresses address[] addresses of SHOP transactions
     * @param _amounts uint[] amount of tokens requested in swap
     * @return bool success boolean
     */
    function requestTransfers(
      address[] _toAddresses,
      address[] _txAddresses,
      uint[] _amounts
    )
      public
      returns (bool)
    {
        // Both arrays must be same length
        require(_toAddresses.length == _txAddresses.length);
        require(_txAddresses.length == _amounts.length);

        // Perform each request
        for (uint256 i=0; i < _amounts.length; i++) {
            requestTransfer(_toAddresses[i], _txAddresses[i], _amounts[i]);
        }

        return true;
    }

    /**
     * @dev main function for creating transfer requests
     * @param _toAddress address destination to send SHOPIN tokens
     * @param _txAddress address address of SHOP transaction
     * @param _amount uint amount of tokens requested in swap
     * @return bool success boolean
     */
    function requestTransfer(
      address _toAddress,
      address _txAddress,
      uint _amount
    )
      public
      returns (bool)
    {
        // request cannot already exist for this transaction
        require(!requestTransferExists(_txAddress));
        // cannot request transfer of 0 SHOP tokens
        require(_amount > 0);
        // ensure no zero address
        require(_txAddress != address(0));

        uint _requestId = _numRequests++;
        TransferRequest memory req = TransferRequest(
            _toAddress,
            _txAddress,
            _amount,
            false,
            _requestId
        );
        _requests[_requestId] = req;
        // emit
        emit RequestToTransfer(_numRequests, _requestId, _txAddress, _amount);
        return true;
    }

    /**
     * @dev is address in list of transfer requests?
     * @param _txAddress addr address we're checking
     * @return bool if the address has already submitted a transfer request
     */
    function requestTransferExists(address _txAddress) public view returns (bool) {
        if (_numRequests == 0) {
            return false;
        }

        for (uint i=0; i<_numRequests; i++) {
            TransferRequest memory req = _requests[i];
            if (req.txAddress == _txAddress) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev can the transfer request get swapped?
     * @param req TransferRequest we're checking on
     * @return bool if the transfer request can be executed
     */
    function canSwap(TransferRequest req) internal view returns (bool) {
        SwapController controller = SwapController(controllerTokenAddress);
        return controller.canSwap(req.toAddress);
    }

    /**
     * @dev execute transfers for all unexecuted ones that can be swapped
     * @return boolean if the entire operation completed successfully or not
     */
    function executeTransfers()
        onlyTokenOwner
        public
        returns (bool)
    {
        if (_numRequests == 0) return false;
        uint numRequests = _numRequests;
        ERC20 token = ERC20(tokenAddress);
        for (uint i = 0; i < numRequests; i++) {
            TransferRequest storage req = _requests[i];
            if (!req.completed && canSwap(req)) {
                // Execute transfer
                token.transfer(req.toAddress, req.amount);
                emit TransferExecuted(i, req.toAddress, req.amount);
                _requests[i].completed = true;
            }
        }
        return true;
    }

    function withdrawAllTokens()
        onlyTokenOwner
        external
        returns (bool)
    {
        ERC20 token = ERC20(tokenAddress);
        uint256 balance = token.balanceOf(this);
        token.transfer(owner, balance);
    }

    function withdrawAllEth()
        onlyTokenOwner
        public
        returns (bool)
    {
        tokenOwner.transfer(address(this).balance);
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
      return _requests[idx].toAddress;
    }

    /**
     * @dev get the completed status of the transfer request
     * @param idx the index of the transfer request
     * @return bool the status of the completed transfer request
     */
    function getTransferRequestCompleted(
        uint idx
    )
        onlyTokenOwner
        public
        view
        returns (bool)
    {
        return _requests[idx].completed;
    }

    /**
     * @dev get the txaddress
     * @param idx the index of the transfer request
     * @return tx address
     */
    function getTransferRequestTxHash(
        uint idx
    )
        onlyTokenOwner
        public
        view
        returns (address)
    {
        return _requests[idx].txAddress;
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
