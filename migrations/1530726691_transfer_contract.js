const csv = require ('csv')
const logger = require ('../lib/logger')
const Token = artifacts.require ('ShopinToken')
const OriginalToken = artifacts.require('OriginalToken')
const SwapController = artifacts.require('SwapController');
const SwapContract = artifacts.require('SwapContract')

const originalTokenAddress = ''

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
  logger.info (`Deploying transfer contract for original owner`);

  const INITIAL_SUPPLY = 15e8 * (10 ** 9);
  const originalToken = await deployer.deploy(OriginalToken, INITIAL_SUPPLY, {from: owner});
  const originalTokenAddress = require('../lib/originalToken');

  const controllerContract = await deployer.deploy(SwapController, {from: owner})
  const token = await Token.deployed()
  const tokenAddress = token.address;

  logger.info(`Deployed original token for testing to ${OriginalToken.address}`);
  logger.info(`Deployed controller to ${controllerContract.address}`)

  await deployer.deploy (SwapContract, tokenAddress, controllerContract.address, owner, {
    from: owner,
  });
  logger.info (`Deployed token to address: ${SwapContract.address}`);
};
