const th = require ('./lib/testHelper');
const should = th.should ();
const async = require ('async');

const SwapController = artifacts.require ('SwapController');

contract (
  'Swap Controller contract',
  async (
    [owner, syndicate, controllerAddress, investor1, investor2, investor3, investor4]
  ) => {
    let controller;

    before (async () => await th.advanceBlock ());
    beforeEach ('initialize token and contract', async () => {
      // this.timeout (0); // disable timeout
      try {
        controller = await SwapController.new({from: owner});
      } catch(e) {
        console.log('e ->', e)
      }
    })

    it('returns swapEnabled as false by default', async () => {
      let enabled = await controller.swapEnabled();
      enabled.should.be.equal(false)
    })

    it('allows us to unpause the swap enabling at any time', async () => {
      await controller.enableSwap();
      let enabled = await controller.swapEnabled();
      enabled.should.be.equal(true)
    })

    it('allows swapping when address is not blacklisted and unpaused', async () => {
      await controller.enableSwap();
      let canSwap = await controller.canSwap(investor1)
      canSwap.should.be.true
    })

    it('disallows swapping when address paused', async () => {
      await controller.enableSwap();
      await controller.disableSwap();
      (await controller.canSwap(investor1)).should.be.false
    })

    it('disallows swapping when address is blacklisted', async () => {
      await controller.enableSwap();
      await controller.addToBlacklist(investor1)
      let canSwap = await controller.canSwap(investor1)
      canSwap.should.be.false
    })

    it('allows swapping when address is removed from blacklist', async () => {
      await controller.enableSwap();
      await controller.addToBlacklist(investor1)
      await controller.removeFromBlacklist(investor1)
      let canSwap = await controller.canSwap(investor1)
      canSwap.should.be.true
    })

    it('has a whitelist', async () => {
      (await controller.isWhitelisted(investor1)).should.be.false;
      await controller.addToWhitelist(investor1);
      (await controller.isWhitelisted(investor1)).should.be.true;
    })

    it('can remove someone from the whitelist', async () => {
      (await controller.isWhitelisted(investor1)).should.be.false;
      await controller.addToWhitelist(investor1);
      await controller.removeFromWhitelist(investor1);
      (await controller.isWhitelisted(investor1)).should.be.false;
    })

    it('only allows the owner to add a whitelist', async () => {
      await th.assertThrows(
        controller.addToWhitelist(investor1, {from: investor2})
      )
    })
  })
