const logger = require ('../lib/logger')
const ShopinToken = artifacts.require ('ShopinToken')
const OriginalToken = artifacts.require('OriginalToken')
const SwapController = artifacts.require('SwapController');
const SwapContract = artifacts.require('SwapContract')
const SwapFactory = artifacts.require('SwapFactory')

const originalTokenAddress = '';
const TOKEN_OWNER = '0xF10507c5A8352a3Cb2AA4Ed59Dd0D839596e2f3B';

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
    logger.info (`Deploying transfer contract for original owner`);

    const INITIAL_SUPPLY = 15e8 * (10 ** 9);
    const originalToken = await deployer.deploy(OriginalToken, INITIAL_SUPPLY, {from: owner});
    const originalTokenAddress = require('../lib/originalToken');

    logger.info(`Deploying Swap controller...`)
    await ShopinToken.deployed()

    logger.info(`Deployed original token for testing to ${OriginalToken.address}`);

    await deployer.deploy(SwapController, {from: owner})
    logger.info(`Deployed controller to ${SwapController.address}`)

    // Transfer ownership of contract to final owner
    let controller = await SwapController.deployed()
    let res = await controller.transferOwnership(TOKEN_OWNER, {from: owner});
    logger.info(`SwapController owner changed to: ${TOKEN_OWNER}, tx: ${res.tx})`);

    try {
      logger.info(`
        Deploying SwapController with argument values:
        TokenAddress: ${ShopinToken.address}
        Controller address: ${SwapController.address}
        owner: ${owner}
      `)
      await deployer.deploy (SwapContract, ShopinToken.address, SwapController.address, owner, {
        from: owner,
      });
    } catch (e) {
      logger.error(`SwapController error ${e}`)
    }
    logger.info(`Deployed swap contract to ${SwapContract.address}`)

    try {
      logger.info(`
        Deploying SwapFactory with argument values:
        TokenAddress: ${ShopinToken.address}
        Controller address: ${SwapController.address}
        owner: ${owner}
      `)
      await deployer.deploy (SwapFactory, ShopinToken.address, SwapController.address, owner, {
        from: owner,
      });

      // Transfer ownership of contract to final owner
      let factory = await SwapFactory.deployed()
      let res = await factory.transferOwnership(TOKEN_OWNER, {from: owner});
      logger.info(`SwapFactory owner changed to: ${TOKEN_OWNER}, tx: ${res.tx})`);

    } catch (e) {
      logger.error(`SwapFactory error ${e}`)
    }
    logger.info (`Deployed factory to address: ${SwapFactory.address}`);
  })
};
