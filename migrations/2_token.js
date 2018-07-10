const logger = require ('../lib/logger');
const Token  = artifacts.require ('ShopinToken');

const TOKEN_DECIMAL  = 10 ** 18;
const INITIAL_SUPPLY = 15e8 * TOKEN_DECIMAL;
const UNLOCK_TIME    = 1535731140000;
const TOKEN_ADDR1    = process.env.TOKEN_ADDR1 || '0xA83bD95AecB5264348EE1867f9dC7577BEae16F1';
const TOKEN_ADDR2    = process.env.TOKEN_ADDR2 || '0x9422350F207EEAAc902FA4f8a41354aA1f0504c9';
const TOKEN_OWNER    = process.env.TOKEN_OWNER || '0xF10507c5A8352a3Cb2AA4Ed59Dd0D839596e2f3B';
const DISTR_ADDR     = process.env.DISTR_ADDR  || '0x302E75559cB159Bee5C4e16B2A834F17e1039bFB';

const DISTRIBUTION = {
  [TOKEN_ADDR1]: 622031472 * TOKEN_DECIMAL,
  [TOKEN_ADDR2]: 500000000 * TOKEN_DECIMAL,
  [TOKEN_OWNER]: 377968528 * TOKEN_DECIMAL,
  [DISTR_ADDR]:  0,
}

module.exports = function(deployer, network, [
    owner,
    investor1,
    investor2,
    investor3,
    teamWallet,
    networkWallet,
    ethFoundationWallet,
  ]
) {
  deployer.then(async function() {
    // const investorWallets = [investor1, investor2, investor3];
    // const investorAmounts = [1e3, 1e3, 1.5e4];

    /**
      address[] _investorWallets,
      uint256[] _investorAmounts,
      address _teamWallet,
      address _networkWallet,
      uint256 _totalSupply
     */
    logger.info(`Deploying token at initial supply of: ${INITIAL_SUPPLY}`);
    await deployer.deploy(Token, INITIAL_SUPPLY, UNLOCK_TIME, {
      from: owner,
    });
    logger.info(`Deployed token to address: ${Token.address}`);

    // Get an instance of ShopinToken
    const token = await Token.deployed()

    // Distribute tokens and whitelist each distribution address
    for (let addr in DISTRIBUTION) {
      let amount = DISTRIBUTION[addr]

      if (amount) {
        let res = await token.transfer(addr, amount, {from: owner});
        logger.info(`Transferred ${amount} SHOPIN to ${addr}, tx: ${res.tx}`);
      }

      let res = await token.addToWhitelist(addr, {from: owner});
      logger.info(`Whitelisted address: ${addr}, tx: ${res.tx}`);
    }

    // Transfer ownership of contract to final owner
    let res = await token.transferOwnership(TOKEN_OWNER, {from: owner});
    logger.info(`ShopinToken owner changed to: ${TOKEN_OWNER}, tx: ${res.tx})`);
  })
};
