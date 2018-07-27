const logger = require ('../lib/logger');
const ShopinToken = artifacts.require ('ShopinToken');
const OriginalToken = artifacts.require ('OriginalToken');
const SwapController = artifacts.require ('SwapController');
const SwapContract = artifacts.require ('SwapContract');
const SwapFactory = artifacts.require ('SwapFactory');

const originalTokenAddress = '';
const TOKEN_OWNER = process.env.TOKEN_OWNER; // || '0xF10507c5A8352a3Cb2AA4Ed59Dd0D839596e2f3B';
const SHOPIN_TOKEN_ADDRESS = process.env.SHOPIN_TOKEN_ADDRESS;
const SWAP_CONTROLLER_ADDRESS = process.env.SWAP_CONTROLLER_ADDRESS;

// NAME TO OWNER
const CURRENT_SYNDICATES = [
  '0xaed12d9d3ae3fa1a335af61a4afec649004d42a9',
  '0xd8a4071da78daafa7285e3a6877ccc5c64a948a3',
  '0xa3031866640d995668ae8d5b3df46161fa81a486',
  '0x71386e17c0a2fb70b966d228de715f8e62583098',
  '0xa5dd50a4ee801ebea9144577b8d08114a5df96ce',
  '0x606074a7ee8bb1e2c7327ace0b4247e483b8e85d',
  '0x149682fe383b0f9417390e9c60006361138273fb',
  '0x6d9b60cf2fcf936c58c84bb1675d9743b6d6d293',
  '0x241b095a9df5955428a42f65a0eb7b01fe599542',
  '0x65f5e5ed457947c4224533ccc8ba551844269e14',
];

module.exports = function (deployer, network, [owner]) {
  owner = TOKEN_OWNER || owner;
  deployer.then (async function () {
    logger.info (`Redeploying swap contracts for original owners`);

    const controller = await (SWAP_CONTROLLER_ADDRESS
      ? SwapController.at (SWAP_CONTROLLER_ADDRESS)
      : SwapController.deployed ());

    logger.info (`Using controller at: ${controller.address}`);

    const swapFactory = await SwapFactory.deployed ();
    logger.info (`Using swap factory at: ${swapFactory.address}`);

    for (let originalOwnerAddr of CURRENT_SYNDICATES) {
      logger.info (`Adding ${originalOwnerAddr} to controller whitelist`);
      let res = await controller.addToWhitelist (originalOwnerAddr, {
        from: owner,
      });
      logger.info (`Whitelisted address: ${originalOwnerAddr}, tx: ${res.tx}`);

      await swapFactory.insertContract (originalOwnerAddr, {from: owner});
      const [
        found,
        idx,
      ] = await swapFactory.contractIndexForName (originalOwnerAddr, {
        from: owner,
      });
      const newSwapContractAddr = await swapFactory.getContractAtIndex (idx);
      const newSwapContract = await SwapContract.at (newSwapContractAddr[1]);

      logger.info (`Deployed new Swap Contract for ${originalOwnerAddr}`);
      await newSwapContract.transferOwnership (originalOwnerAddr, {
        from: owner,
      });
    }
  });
};
