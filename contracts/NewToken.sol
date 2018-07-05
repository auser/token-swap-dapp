pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract NewToken is MintableToken {
    string public constant name = "New Token";
    string public constant symbol = "NT";
    uint8 public constant decimals = 18;
}
