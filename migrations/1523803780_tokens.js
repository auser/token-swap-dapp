const csv = require ('csv');
const logger = require ('../lib/logger');
const Token = artifacts.require ('ShopinToken');

module.exports = async function (
  deployer,
  network,
  [
    owner,
    investor1,
    investor2,
    investor3,
    teamWallet,
    networkWallet,
    ethFoundationWallet,
  ]
) {
  // Use deployer to state migration tasks.
  const INITIAL_SUPPLY = 15e8 * (10 ** 9);
  const UNLOCK_TIME = 1530528510151;

  // const investorWallets = [investor1, investor2, investor3];
  // const investorAmounts = [1e3, 1e3, 1.5e4];

  /**
    address[] _investorWallets,
    uint256[] _investorAmounts,
    address _teamWallet,
    address _networkWallet,
    uint256 _totalSupply
   */
  logger.info (`Deploying token at initial supply of: ${INITIAL_SUPPLY}`);
  await deployer.deploy (Token, INITIAL_SUPPLY, UNLOCK_TIME, {
    from: owner,
  });
  logger.info (`Deployed token to address: ${Token.address}`);
};
