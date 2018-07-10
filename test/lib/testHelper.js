import abi from 'ethereumjs-abi';
import shortid from 'shortid';
import {assert} from 'chai';
const BigNumber = web3.BigNumber;

const should = require ('chai')
  .use (require ('chai-as-promised'))
  .use (require ('chai-bignumber') (BigNumber))
  .should ();

// BigNumber.config({ ERRORS: false, ROUNDING_MODE: BigNumber.ROUND_UP })

export const duration = {
  seconds: function (val) {
    return val;
  },
  minutes: function (val) {
    return val * this.seconds (60);
  },
  hours: function (val) {
    return val * this.minutes (60);
  },
  days: function (val) {
    return val * this.hours (24);
  },
  weeks: function (val) {
    return val * this.days (7);
  },
  years: function (val) {
    return val * this.days (365);
  },
};

const latestTime = () => web3.eth.getBlock ('latest').timestamp;

const increaseTime = duration => {
  const id = Date.now ();

  return new Promise ((resolve, reject) => {
    web3.currentProvider.sendAsync (
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [duration],
        id: id,
      },
      err1 => {
        if (err1) return reject (err1);

        web3.currentProvider.sendAsync (
          {
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: id + 1,
          },
          (err2, res) => {
            return err2 ? reject (err2) : resolve (res);
          }
        );
      }
    );
  });
};

const increaseTimeTo = target => {
  let now = latestTime ();
  if (target < now) throw Error (`Cannot increase to time in the past`);
  let diff = target - now;
  return increaseTime (diff);
};

const evmScript = {
  // Encodes an array of actions ({ to: address, calldata: bytes}) into the EVM call script format
  // Sets spec id 1 = 0x00000001 and
  // Concatenates per call [ 20 bytes (address) ] + [ 4 bytes (uint32: calldata length) ] + [ calldataLength bytes (payload) ]
  encodeCallScript: actions => {
    return actions.reduce ((script, {to, calldata}) => {
      const addr = abi.rawEncode (['address'], [to]).toString ('hex');
      const length = abi
        .rawEncode (['uint256'], [(calldata.length - 2) / 2])
        .toString ('hex');

      // Remove 12 first 0s of padding for addr and 28 0s for uint32
      return script + addr.slice (24) + length.slice (56) + calldata.slice (2);
    }, '0x00000001'); // spec 1
  },

  encodeDelegate: addr => '0x00000002' + addr.slice (2), // remove 0x from addr
  encodeDeploy: contract => '0x00000003' + contract.binary.slice (2),
};

module.exports = Object.assign ({}, evmScript, {
  // convert to ether
  ether (n) {
    return new web3.BigNumber (web3.toWei (n, 'ether'));
  },

  // should
  should () {
    return should;
  },

  duration,

  latestTime,
  increaseTime,
  increaseTimeTo,

  // advance a single block
  advanceBlock () {
    return new Promise ((resolve, reject) => {
      web3.currentProvider.sendAsync (
        {
          jsonrpc: '2.0',
          method: 'evm_mine',
          id: Date.now (),
        },
        (err, res) => (err ? reject (err) : resolve (res))
      );
    });
  },

  // Advance to the block n
  async advanceToBlock (n) {
    if (web3.eth.blockNumber > n) {
      throw Error (`block number ${n} in the past`);
    }

    while (web3.eth.blockNumber < n) {
      await advanceBlock ();
    }
  },

  // Get the balance of an account
  web3GetBalance (account) {
    return new Promise ((resolve, reject) => {
      web3.eth.getBalance (account, (err, res) => {
        return err ? reject (err) : resolve (res);
      });
    });
  },

  // Get a random string
  getRandomString (_len) {
    const len = _len || 7;
    let randStr = '';
    while (randStr.length < len) {
      randStr += shortid.generate ().replace (/_/g, '').toLowerCase ();
    }
    return randStr.slice (0, len);
  },

  findEventLogs: (txResult, eventName) => {
    return txResult.logs.find (log => log.event === eventName);
  },

  // assert throws
  async assertThrows (promise, msg='some test') {
    try {
      await promise;
    } catch (error) {
      // TODO: Check jump destination to destinguish between a throw
      //       and an actual invalid jump.
      const invalidOpcode = error.message.search ('invalid opcode') >= 0;
      // TODO: When we contract A calls contract B, and B throws, instead
      //       of an 'invalid jump', we get an 'out of gas' error. How do
      //       we distinguish this from an actual out of gas event? (The
      //       testrpc log actually show an 'invalid jump' event.)
      const outOfGas = error.message.search ('out of gas') >= 0;
      const revert = error.message.search ('revert') >= 0;
      assert (
        invalidOpcode || outOfGas || revert,
        "Expected throw, got '" + error + "' instead"
      );
      return;
    }

    console.log (`${msg}`);
    assert.fail('Expected throw but not received');
  },

  async isReverted (asyncBlock) {
    try {
      await asyncBlock ();
    } catch (error) {
      assert.isAbove (
        error.message.search ('revert'),
        -1,
        'Error containing "revert" must be returned'
      );
      return;
    }

    assert.fail ('Expected an error containing revert, but received no error.');
  },
});
