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

    event AddedToWhitelist(address indexed _addr);
    event RemovedFromWhitelist(address indexed _addr);
    event AddedToBlacklist(address indexed _addr);
    event RemovedFromBlacklist(address indexed _addr);

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
        return swapEnabled() && !isBlacklisted(addr);
    }

    function addToWhitelist(address addr) public onlyOwner returns (bool) {
        whitelist.addToWhitelist(addr);
        emit AddedToWhitelist(addr);
        return true;
    }

    function removeFromWhitelist(address addr) public onlyOwner returns (bool) {
        whitelist.removeFromWhitelist(addr);
        emit RemovedFromWhitelist(addr);
        return true;
    }

    function isWhitelisted(address addr) public view returns (bool) {
        return whitelist.isWhitelisted(addr);
    }

    function addToBlacklist(address addr) public onlyOwner returns (bool) {
        blacklist.addToBlacklist(addr);
        emit AddedToBlacklist(addr);
        return true;
    }

    function removeFromBlacklist(address addr) public onlyOwner returns (bool) {
        blacklist.removeFromBlacklist(addr);
        emit RemovedFromBlacklist(addr);
        return true;
    }

    function isBlacklisted(address addr) public view returns (bool) {
        return blacklist.isBlacklisted(addr);
    }
}
