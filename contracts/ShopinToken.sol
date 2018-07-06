pragma solidity 0.4.24;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract ShopinToken is StandardToken, Ownable, Pausable {
    using SafeMath for uint256;

    string public constant name = "Shopin Token"; // solium-disable-line uppercase
    string public constant symbol = "SHOPIN"; // solium-disable-line uppercase
    uint8 public constant decimals = 18; // solium-disable-line uppercase

    mapping (address => bool) whitelist;
    mapping (address => bool) blacklist;

    uint private unlockTime;

    event AddedToWhitelist(address indexed _addr);
    event RemovedFromWhitelist(address indexed _addr);
    event AddedToBlacklist(address indexed _addr);
    event RemovedFromBlacklist(address indexed _addr);
    event SetNewUnlockTime(uint newUnlockTime);

    constructor(
        uint256 _totalSupply,
        uint256 _unlockTime
    )
        Ownable()
        public
    {
        require(_totalSupply > 0);
        require(_unlockTime > 0 && _unlockTime > now);

        totalSupply_ = _totalSupply;
        unlockTime = _unlockTime;
        balances[msg.sender] = totalSupply_;
        emit Transfer(0x0, msg.sender, totalSupply_);
    }

    modifier whenNotPausedOrInWhitelist() {
        require(
            !paused || isWhitelisted(msg.sender) || msg.sender == owner,
            "contract paused and sender is not in whitelist"
        );
        _;
    }

    /**
     * @dev Transfer a token to a specified address
     * transfer
     *
     * transfer conditions:
     *  - the msg.sender address must be valid
     *  - the msg.sender _cannot_ be on the blacklist
     *  - one of the three conditions can be met:
     *      - the token contract is unlocked entirely
     *      - the msg.sender is whitelisted
     *      - the msg.sender is the owner of the contract
     *
     * @param _to address to transfer to
     * @param _value amount to transfer
     */
    function transfer(
        address _to,
        uint _value
    )
        public
        whenNotPausedOrInWhitelist()
        returns (bool)
    {
        require(_to != address(0));
        require(msg.sender != address(0));

        require(!isBlacklisted(msg.sender));
        require(isUnlocked() ||
                isWhitelisted(msg.sender) ||
                msg.sender == owner);

        return super.transfer(_to, _value);

    }

    /**
     * @dev addToBlacklist
     * @param _addr the address to add the blacklist
     */
    function addToBlacklist(
        address _addr
    ) onlyOwner public returns (bool) {
        require(_addr != address(0));
        require(!isBlacklisted(_addr));

        blacklist[_addr] = true;
        emit AddedToBlacklist(_addr);
        return true;
    }

    /**
     * @dev remove from blacklist
     * @param _addr the address to remove from the blacklist
     */
    function removeFromBlacklist(
        address _addr
    ) onlyOwner public returns (bool) {
        require(_addr != address(0));
        require(isBlacklisted(_addr));

        blacklist[_addr] = false;
        emit RemovedFromBlacklist(_addr);
        return true;
    }

    /**
     * @dev addToWhitelist
     * @param _addr the address to add to the whitelist
     */
    function addToWhitelist(
        address _addr
    ) onlyOwner public returns (bool) {
        require(_addr != address(0));
        require(!isWhitelisted(_addr));

        whitelist[_addr] = true;
        emit AddedToWhitelist(_addr);
        return true;
    }

    /**
     * @dev remove an address from the whitelist
     * @param _addr address to remove from whitelist
     */
    function removeFromWhitelist(
        address _addr
    ) onlyOwner public returns (bool) {
        require(_addr != address(0));
        require(isWhitelisted(_addr));

        whitelist[_addr] = false;
        emit RemovedFromWhitelist(_addr);
        return true;
    }

    function isBlacklisted(address _addr)
        internal
        view
        returns (bool)
    {
        require(_addr != address(0));
        return blacklist[_addr];
    }

    /**
     * @dev isWhitelisted check if an address is on whitelist
     * @param _addr address to check if on whitelist
     */
    function isWhitelisted(address _addr)
        internal
        view
        returns (bool)
    {
        require(_addr != address(0));
        return whitelist[_addr];
    }

    /**
     * @dev get the unlock time
     */
    function getUnlockTime() public view returns (uint) {
        return unlockTime;
    }

    /**
     * @dev set a new unlock time
     */
    function setUnlockTime(uint newUnlockTime) onlyOwner public returns (bool)
    {
        unlockTime = newUnlockTime;
        emit SetNewUnlockTime(unlockTime);
    }

    /**
     * @dev is the contract unlocked or not
     */
    function isUnlocked() public view returns (bool) {
        return (getUnlockTime() >= now);
    }
}
