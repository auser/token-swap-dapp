pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract OriginalToken is MintableToken {
    string public constant name = "Original Token";
    string public constant symbol = "OG";
    uint8 public constant decimals = 18;
}
