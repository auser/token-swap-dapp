const logger = require ('../lib/logger');
const ShopinToken = artifacts.require ('ShopinToken');
const OriginalToken = artifacts.require ('OriginalToken');
const SwapController = artifacts.require ('SwapController');
const SwapContract = artifacts.require ('SwapContract');
const SwapFactory = artifacts.require ('SwapFactory');

const originalTokenAddress = '';
const TOKEN_OWNER =
  process.env.TOKEN_OWNER || '0xF10507c5A8352a3Cb2AA4Ed59Dd0D839596e2f3B';

const OLD_TOKEN_ADDRESS =
  process.env.OLD_TOKEN_ADDRESS || require ('../lib/originalToken');
let SHOPIN_TOKEN_ADDRESS = process.env.SHOPIN_TOKEN_ADDRESS;
let SWAP_CONTROLLER_ADDRESS = process.env.SWAP_CONTROLLER_ADDRESS;
let SWAP_CONTRACT_ADDRESS = process.env.SWAP_CONTRACT_ADDRESS

module.exports = function (
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
  deployer.then (async function () {
    console.log('owner ------------------>', owner)
    
    logger.info (`Deploying transfer contract for original owner`);

    if (!SHOPIN_TOKEN_ADDRESS) {
      const INITIAL_SUPPLY = 15e8 * 10 ** 9;
      logger.info (`Deploying a new original token`);
      await deployer.deploy (OriginalToken, INITIAL_SUPPLY, {from: owner});
      SHOPIN_TOKEN_ADDRESS = OriginalToken.address;
    } else {
      logger.info (
        `Not deploying token since we set an address as: ${SHOPIN_TOKEN_ADDRESS}`
      );
    }

    logger.info (`Original token for testing to ${SHOPIN_TOKEN_ADDRESS}`);
    // logger.info (`Deploying Swap controller...`);
    // await ShopinToken.deployed ();

    if (!SWAP_CONTROLLER_ADDRESS) {
      await deployer.deploy (SwapController, {from: owner});
      logger.info (`Deployed controller to ${SwapController.address}`);

      // Transfer ownership of contract to final owner
      let controller = await SwapController.deployed ();
      SWAP_CONTROLLER_ADDRESS = SwapController.address;
      let res = await controller.transferOwnership (TOKEN_OWNER, {from: owner});
      logger.info (
        `SwapController owner changed to: ${TOKEN_OWNER}, tx: ${res.tx})`
      );
    } else {
      logger.info (
        `Not deploying SwapController since we set address as: ${SWAP_CONTROLLER_ADDRESS}`
      );
    }

    ///////////////////////////////////////////////////////////////////////////////
    if (!SWAP_CONTRACT_ADDRESS) {
      try {
        logger.info (`
          Deploying SwapController with argument values:
          TokenAddress: ${SHOPIN_TOKEN_ADDRESS}
          Controller address: ${SWAP_CONTROLLER_ADDRESS}
          owner: ${owner}
        `);
        await deployer.deploy (
          SwapContract,
          SHOPIN_TOKEN_ADDRESS,
          SWAP_CONTROLLER_ADDRESS,
          owner,
          {
            from: owner,
          }
        );
      } catch (e) {
        logger.error (`SwapContract error ${e}`);
      }
      logger.info (`Deployed swap contract to ${SwapContract.address}`);
    } else {
      logger.info(`Not deploying SwapContract as we have set address: ${SWAP_CONTRACT_ADDRESS}`)
    }

    try {
      logger.info (`
        Deploying SwapFactory with argument values:
        TokenAddress: ${SHOPIN_TOKEN_ADDRESS}
        Controller address: ${SWAP_CONTROLLER_ADDRESS}
        owner: ${owner}
      `);
      await deployer.deploy (
        SwapFactory,
        SHOPIN_TOKEN_ADDRESS,
        SWAP_CONTROLLER_ADDRESS,
        owner,
        {
          from: owner,
        }
      );

      // Transfer ownership of contract to final owner
      let factory = await SwapFactory.deployed ();
      let res = await factory.transferOwnership (TOKEN_OWNER, {from: owner});
      logger.info (
        `SwapFactory owner changed to: ${TOKEN_OWNER}, tx: ${res.tx})`
      );
    } catch (e) {
      logger.error (`SwapFactory error ${e}`);
    }
    logger.info (`Deployed factory to address: ${SwapFactory.address}`);
  });
};
