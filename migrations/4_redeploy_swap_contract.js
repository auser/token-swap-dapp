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
  '0xd1ffb42c9e31d84a0cdc51521544eac6ea7f8a31',
  '0xdff1ffc57f9a5813ae7d9360e9ea1f9dd22b81e9',
  '0x3c1a7aa5e65aec090548d2bf20dbbf5f3da376af',
  '0x123685f3b3c7550254f187ca3746db61e6a248fd',
  '0xD1a9FbFF6E98D755c45658076810Da10c697Fa0F',
  '0xc2245cd9f6cb71858be9412bcaa2e8d7d2656b6f',
  '0x4262a2edd9c9013f9eb18e68fd27a6d83cc102be',
  '0x9a8e674ac831ea92cfef6af954e1ef970c8e8e60',
  '0x5fdfcc97615e1920920d43f65cc4ae0657cb824c',
  '0xcd62cd0e96b2f0783394c019f6375c1f6521cb6a',
  '0xb1d92c842034b74360a57677bba0dcbb7acaadf2',
  '0x17797e25b62d22b3f73cbf029651bc739da08697',
  '0x4f03788f65256d79ed84581a406a7b49165abba4',
  '0x92fd6c1e5806018e91fe39553e4ba8cf3aecdbdf',
  '0x9a066ad67f38035558f4ae8d34a8d2e63056fbe9',
  '0x0f3bfa85cb05b330b84f64a3a3e3c804ede64697',
  '0x526bf98334679ea56eb3373d83d9a7db3974f9fd',
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
      const [existsAlready, index] = await swapFactory.contractIndexForName(originalOwnerAddr)
      if (existsAlready) {
        logger.info(`SwapContract for ${originalOwnerAddr} already exists`)
      } else {
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
    }
  });
};
