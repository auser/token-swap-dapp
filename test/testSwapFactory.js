const fs = require ('fs');
const path = require ('path');
const BigNumber = require ('bignumber.js');

const th = require ('./testHelper');
const should = th.should ();
const async = require ('async');

const NewToken = artifacts.require ('NewToken');
const OriginalToken = artifacts.require('OriginalToken');
const SwapContract = artifacts.require ('SwapContract');
const SwapContractFactory = artifacts.require('SwapContractFactory');

const totalSupply_ = 15e8 * 10 ** 18;
const unlockTime_ =  +new Date() + 30;

contract (
  'Transfer contract factory',
  async (
    [owner, syndicate, investor1, investor2, investor3, investor4]
  ) => {
    let tok;
    let totalSupply;
    let transferContract;
    let originalToken;
    let factory;

    before (async () => await th.advanceBlock ());
    beforeEach ('initialize token and contract', async () => {
      // this.timeout (0); // disable timeout
      try {
        tok = await NewToken.new (totalSupply_, unlockTime_, {from: owner});
        originalToken = await OriginalToken.new(totalSupply_, {from: owner});
        factory = await SwapContractFactory.new(originalToken.address, owner, {from: syndicate});
      } catch(e) {
        console.log('e ->', e)
      }
    });

    it('sets the token creator as the owner of the token', async() =>{
      let contractOwner = await factory.owner();
      contractOwner.should.equal(syndicate);
    });

    it('does not allow invalid token address', async() =>{
      await th.assertThrows(SwapContractFactory.new(0, owner, {from: syndicate}));
    });
    it('does not allow invalid token owner address', async() =>{
      await th.assertThrows(SwapContractFactory.new(originalToken.address, 0, {from: syndicate}));
    });

    context('subcontracts', async () => {
      let contract;
      beforeEach(async () => {
        await factory.insertContract("hello");
        const [name, addr] = await factory.getContractAtIndex(0);
        contract = SwapContract.at(addr);
      })

      it('con insert a new contract with unique name', async () => {
        const count = await factory.getContractCount();
        count.should.be.bignumber.equal(1);
      });

      it('does not allow a new contract with same name', async () => {
        await th.assertThrows(factory.insertContract("hello"))
      });

      it('creates subcontracts owned by msg.sender', async () => {
        const owner = await contract.owner();
        owner.should.equal(owner);
      })

      it('can check if a constract exists', async () => {
        (await factory.isContract(0)).should.be.true;
        (await factory.isContract(1)).should.be.false;
      })

      it('can get a contract by its name', async () => {
        const name = 'bob contract'
        const one = await factory.insertContract(name);
        const evt = await factory.contractByNameExists(name);

        evt.should.be.true;
      })

      it('can remove a contract', async () => {
        const evt = await factory.removeContract(0, {from: syndicate});
        (await factory.getContractCount()).should.be.bignumber.equal(0);

        const log = th.findEventLogs(evt, 'ContractRemoved');
        log.args.index.should.be.bignumber.equal(0);
      })

      it('can update a contract name', async () => {
        await factory.updateContractName(0, 'hello world', {from: owner});
        const [name, addr] = await factory.getContractAtIndex(0);
        name.should.equal('hello world')
      })

    })
})
