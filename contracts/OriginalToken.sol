pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract OriginalToken is StandardToken, Ownable {
    using SafeMath for uint256;

    string public constant name = "Shopin Token (Original)"; // solium-disable-line uppercase
    string public constant symbol = "SHOP"; // solium-disable-line uppercase
    uint8 public constant decimals = 9; // solium-disable-line uppercase

    constructor(
        uint256 _totalSupply
    )
        Ownable()
        public
    {
        require(_totalSupply > 0);

        totalSupply_ = _totalSupply;
        balances[msg.sender] = totalSupply_;
        emit Transfer(0x0, msg.sender, totalSupply_);
    }

    function bulkAssign(
        address[] _investorWallets,
        uint256[] _investorAmounts
    )
        external
        onlyOwner
    {
        require(_investorWallets.length > 0 && _investorWallets.length == _investorAmounts.length);

        uint256 i;
        for (i = 0; i < _investorWallets.length; i++) {
            require(_investorWallets[i] != address(0)); // ensure no zero address
            require(_investorAmounts[i] > 0); // cannot assign zero amount to an investor
        }

        // Token distribution
        for (i = 0; i < _investorWallets.length; i++) {
            // subtract the current investor tokens from total investor reserves
            // set the balance for the current investor
            // balances[msg.sender] = balances[msg.sender].sub(_investorAmounts[i]);
            // balances[_investorWallets[i]] = balances[_investorWallets[i]].add(_investorAmounts[i]);
            super.transfer(_investorWallets[i], _investorAmounts[i]);
            // emit Transfer(0x0, _investorWallets[i], _investorAmounts[i]);
        }
    }
}
