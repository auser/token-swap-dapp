pragma solidity 0.4.24;

import "hanzo-solidity/contracts/Blacklist.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract SwapController is Blacklist, Pausable {
    event SwapEnabled();
    event SwapDisabled();

    constructor() public {
        owner = msg.sender;
    }

    function swapEnabled() public view onlyOwner returns (bool) {
        return !paused;
    }

    function enableSwap() public onlyOwner {
        unpause();
        emit SwapEnabled();
    }

    function disableSwap() public onlyOwner {
        pause();
        emit SwapDisabled();
    }

    function canSwap(address addr) public view returns (bool) {
        return swapEnabled() && !isBlacklisted(addr);
    }
}
