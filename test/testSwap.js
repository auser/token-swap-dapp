const fs = require ('fs');
const path = require ('path');
const BigNumber = require ('bignumber.js');

const th = require ('./testHelper');
const should = th.should ();
const async = require ('async');

const NewToken = artifacts.require ('NewToken');
const OriginalToken = artifacts.require('OriginalToken');
const SwapContract = artifacts.require ('SwapContract');

const totalSupply_ = 15e8 * 10 ** 18;
const unlockTime_ =  +new Date() + 30;

contract (
  'Transfer contract',
  async (
    [owner, syndicate, investor1, investor2, investor3, investor4]
  ) => {
    let tok;
    let totalSupply;
    let transferContract;
    let originalToken;

    before (async () => await th.advanceBlock ());
    beforeEach ('initialize token and contract', async () => {
      // this.timeout (0); // disable timeout
      try {
        tok = await NewToken.new (totalSupply_, unlockTime_, {from: owner});
        originalToken = await OriginalToken.new(totalSupply_, {from: owner});
        transferContract = await SwapContract.new (originalToken.address, owner, {from: syndicate});
      } catch(e) {
        console.log('e ->', e)
      }
    });

    it('sets the token creator as the owner of the token', async() =>{
      let contractOwner = await transferContract.owner();
      contractOwner.should.equal(syndicate);
    });
    it('does not allow invalid token address', async() =>{
      await th.assertThrows(SwapContract.new(0, owner, {from: syndicate}));
    });
    it('does not allow invalid token owner address', async() =>{
      await th.assertThrows(SwapContract.new(originalToken.address, 0, {from: syndicate}));
    });
    it('sets the token address from the parameter list', async () => {
      let tokenAddress = await transferContract.tokenAddress();
      tokenAddress.should.equal(originalToken.address);
    })
    it('sets the token owner from the parameter', async () => {
      (await transferContract.tokenOwner()).should.equal(owner);
    })

    context('transfer', async () => {
      it('accepts a transfer from the new token', async () => {
        await tok.transfer(transferContract.address, 1e3);
        const balance = await tok.balanceOf(transferContract.address);
        balance.should.be.bignumber.equal(1e3);
      })
    })

    context('receive', async () => {
      beforeEach(async () => await tok.transfer(investor1, 1e4));
      it('calls Transfer on the token contract', async () => {
        const evt = await transferContract.requestTransfer(
          1e4, {from: investor1}
        );
        const log = th.findEventLogs(evt, 'RequestToTransfer');
        log.args.numRequests.should.be.bignumber.equal(1);
      });

      it('allows anyone to request token owner', async () => {
        (await Promise.all(
          [
            (await transferContract.getTokenOwnerAddress()),
            (await transferContract.getTokenOwnerAddress({from: investor2}))
          ]
        )).forEach(addr => {
          addr.should.equal(owner)
        });
      })

      context('after transfer request created', async () => {
        beforeEach(async () => {
          await transferContract.requestTransfer(
            1e4, {from: investor1}
          );
        })
        it('stores the transfer request', async () => {
          const len = await transferContract.getTransferRequestCount();
          len.should.be.bignumber.equal(1);
        })

        it('can retrieve the transfer request amount', async () => {
          const amount = await transferContract.getTransferRequestAmount(0);
          amount.should.be.bignumber.equal(1e4);
        })
        it('can retrieve the transfer request address', async () => {
          const addr = await transferContract.getTransferRequestInvestor(0);
          addr.should.equal(investor1);
        })

        it('can retrieve the controller token address', async () => {
          const addr = await transferContract.getControllerTokenAddress();
          addr.should.equal(originalToken.address);
        })

        it('allows contract owner to request count', async () => {
          const count = await transferContract.getTransferRequestCount({from: syndicate});
          count.should.be.bignumber.equal(1);
        })

        it('allows contract owner to request amount', async () => {
          await transferContract.getTransferRequestAmount(0);
        })
        it('allows contract owner to request investor address', async () => {
          await transferContract.getTransferRequestInvestor(0, {from: syndicate});
        })

        it('allows token owner to request token count', async () => {
          await th.assertThrows(
            transferContract.getTransferRequestCount({from: investor2})
          )
        })

        it('allows the token owner to request amount', async () => {
          await th.assertThrows(
            transferContract.getTransferRequestAmount(0, {from: investor2})
          )
        })


        it('rejects non-token owner to request investor address', async () => {
          await th.assertThrows(
            transferContract.getTransferRequestInvestor(0, {from: investor2})
          )
        })

      })
    })
  })
