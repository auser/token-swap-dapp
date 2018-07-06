pragma solidity 0.4.24;

import "hanzo-solidity/contracts/Blacklist.sol";
import "hanzo-solidity/contracts/Whitelist.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract SwapController is Ownable, Pausable {
    Blacklist private blacklist;
    Whitelist private whitelist;

    event SwapEnabled();
    event SwapDisabled();

    constructor() public Ownable() {
        blacklist = new Blacklist();
        whitelist = new Whitelist();
        pause();
    }

    function swapEnabled() public view returns (bool) {
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
        return swapEnabled() && !blacklist.isBlacklisted(addr);
    }

    function addToWhitelist(address addr) public onlyOwner {
        whitelist.addToWhitelist(addr);
    }

    function removeFromWhitelist(address addr) public onlyOwner {
        whitelist.removeFromWhitelist(addr);
    }

    function isWhitelisted(address addr) public view returns (bool) {
        return whitelist.isWhitelisted(addr);
    }

    function addToBlacklist(address addr) public onlyOwner {
        blacklist.addToBlacklist(addr);
    }

    function removeFromBlacklist(address addr) public onlyOwner {
        blacklist.removeFromBlacklist(addr);
    }
}
