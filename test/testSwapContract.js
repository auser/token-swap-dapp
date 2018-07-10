const fs = require ('fs');
const path = require ('path');
const BigNumber = require ('bignumber.js');
const Web3 = require('web3')

const th = require ('./lib/testHelper');
const should = th.should ();
const async = require ('async');

const ShopinToken = artifacts.require ('ShopinToken');
const OriginalToken = artifacts.require('OriginalToken');
const SwapContract = artifacts.require ('SwapContract');
const SwapController = artifacts.require ('SwapController');

const totalSupply_ = 15e8 * 10 ** 18;
const unlockTime_ =  +new Date() + 30;

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")) // Hardcoded development port

contract (
  'Transfer contract',
  async ([
    owner, syndicate, controllerAddress, investor1, investor2, investor3, investor4,
    tx1, tx2, tx3, tx4, tx5, tx6, tx7, tx8, tx9, tx10, tx11, tx12, tx13, tx14, tx15
  ]) => {
    let tok;
    let totalSupply;
    let transferContract;
    let originalToken;
    let controller;

    before (async () => await th.advanceBlock ());
    beforeEach ('initialize token and contract', async () => {
      // this.timeout (0); // disable timeout
      try {
        tok = await ShopinToken.new (totalSupply_, unlockTime_, {from: owner});
        originalToken = await OriginalToken.new(totalSupply_, {from: owner});
        controller = await SwapController.new();
        transferContract = await SwapContract.new (
          tok.address, controller.address, owner, {from: syndicate});
      } catch(e) {
        console.log('e ->', e)
      }
    });

    it('sets the token creator as the owner of the token', async() =>{
      let contractOwner = await transferContract.owner();
      contractOwner.should.equal(syndicate);
    });
    it('does not allow invalid token address', async() =>{
      await th.assertThrows(SwapContract.new(0, controllerAddress, owner, {from: syndicate}));
    });
    it('does not allow invalid controller address', async() =>{
      await th.assertThrows(SwapContract.new(tok.address, 0, owner, {from: syndicate}));
    });
    it('does not allow invalid owner address', async () => {
      await th.assertThrows(SwapContract.new(tok.address, controllerAddress, 0, {from: syndicate}))
    })
    it('sets the token address from the parameter list', async () => {
      let tokenAddress = await transferContract.tokenAddress();
      tokenAddress.should.equal(tok.address);
    })
    it('sets the controller token address', async () => {
      let controllerAddress = await transferContract.getControllerTokenAddress();
      controllerAddress.should.equal(controllerAddress);
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
          investor1, tx1, 100, {from: investor1}
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
            investor1, tx2, 100, {from: investor1}
          );
        })
        it('stores the transfer request', async () => {
          const len = await transferContract.getTransferRequestCount();
          len.should.be.bignumber.equal(1);
        })

        it('can retrieve the transfer request amount', async () => {
          const amount = await transferContract.getTransferRequestAmount(0);
          amount.should.be.bignumber.equal(100);
        })
        it('can retrieve the transfer request address', async () => {
          const addr = await transferContract.getTransferRequestInvestor(0);
          addr.should.equal(investor1);
        })

        it('can retrieve the controller token address', async () => {
          const addr = await transferContract.getControllerTokenAddress();
          addr.should.equal(controller.address);
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

        it('reject transfer request if request for transaction has already been created', async () => {
          await transferContract.requestTransfer(investor4, tx3, 200, {from: investor4})
          await th.assertThrows(
            transferContract.requestTransfer(investor4, tx3, 200, {from: investor4})
          )
        })

        context('executeTransfers', async () => {
          beforeEach(async () => {
            await controller.enableSwap();
            await tok.transfer(transferContract.address, 1e4);
            await tok.addToWhitelist(transferContract.address);
            await transferContract.requestTransfer(investor2, tx5, 100, {from: investor2});
            await transferContract.requestTransfer(investor3, tx6, 200, {from: investor3});
          })

          it('the contract holds 1e4 tokens', async () => {
            const contractBalance = await tok.balanceOf(transferContract.address);
            contractBalance.should.be.bignumber.equal(1e4);
          })

          it('handles the shopin token in request', async () => {
            const tokAddress = await transferContract.getTokenAddress();
            tokAddress.should.be.equal(tok.address);
          })

          it('can call executeTransfers() and complete all transfers', async () => {
            await transferContract.executeTransfers({
              from: owner
            });
          })

          it('does not transfer tokens if user is blacklisted', async () => {
            await transferContract.requestTransfer(investor4, tx7, 200, {from: investor4});
            await controller.addToBlacklist(investor4);
            let balance = await tok.balanceOf(investor4);
            await transferContract.executeTransfers({
              from: owner
            });
            balance.should.be.bignumber.equal(0)
            await controller.removeFromBlacklist(investor4);
          })

          it('actually transfers tokens', async () => {
            let requestor = await transferContract.getTransferRequestInvestor(1);
            let originalBalance = await tok.balanceOf(requestor);
            await transferContract.executeTransfers({from: owner});
            let requestedAmount = await transferContract.getTransferRequestAmount(1);
            let requestorBalance = await tok.balanceOf(requestor);
            requestorBalance.should.be.bignumber.equal(originalBalance.toNumber() + requestedAmount.toNumber());
          })

          it('records the completed status after transfers have been executed', async () => {
            await transferContract.executeTransfers({from: owner});
            const count = await transferContract.getTransferRequestCount();
            count.should.be.bignumber.equal(3);
            let completed;
            completed = await transferContract.getTransferRequestCompleted(0);
            completed.should.be.true;
            completed = await transferContract.getTransferRequestCompleted(1);
            completed.should.be.true;
            completed = await transferContract.getTransferRequestCompleted(2);
            completed.should.be.true;
          })

          it('should be idempotent', async () => {
            let requestor = await transferContract.getTransferRequestInvestor(1);
            await transferContract.executeTransfers({
              from: owner
            });

            let requestorBalance = await tok.balanceOf(requestor);
            await transferContract.executeTransfers({
              from: owner
            });
            let finalBalance = await tok.balanceOf(requestor);
            finalBalance.should.be.bignumber.equal(requestorBalance)
          })
        })

        context('requestTransfers', async () => {
          beforeEach (async () => {
            transferContract = await SwapContract.new(tok.address, controller.address, owner, {from: syndicate})
          })

          it('should allow bulk transfer requests', async () => {
            await transferContract.requestTransfers([investor1, investor2, investor3], [tx9,  tx10, tx11], [100, 200, 300], {from: owner})
            const len = await transferContract.getTransferRequestCount();
            len.should.be.bignumber.equal(3);
          })

          it('should disallow bulk requests with zero amounts', async () => {
            await th.assertThrows(
              transferContract.requestTransfers([investor1, investor2, investor3], [tx12, tx13, tx14], [0, 500, 600], {from: owner})
            )
          })

          it('should disallow bulk requests with zero addresses', async () => {
            await th.assertThrows(
              transferContract.requestTransfers([investor1, investor2, investor3], [tx12, tx13, tx14], [0, 500, 600], {from: owner})
            )
          })

          it('should disallow bulk requests when addresses.length != amounts.length', async () => {
            await th.assertThrows(
              transferContract.requestTransfers([investor1, investor2, investor3], [tx12, tx13, tx14], [100, 500], {from: owner})
            )
          })
        })
      })
    })
  })
