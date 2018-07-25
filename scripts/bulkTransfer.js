#!/usr/bin/env node

const fs = require ('fs');
const path = require ('path');
const truffleContract = require ('truffle-contract');
const Web3 = require ('web3');
const BigNumber = require ('bignumber.js');
const csvjson = require ('csvjson');
const Promise = require ('bluebird');
const tx = require ('ethereumjs-tx');

const getTransactionReceiptMined = require ('../lib/getTransactionReceiptMined');
const logger = require ('../lib/logger');
const NODE_ENV = process.env.NODE_ENV || 'development';

const contractsDir = path.join (
  path.resolve (__dirname),
  '..',
  'build',
  'contracts'
);

const ShopinToken = require (path.join (contractsDir, 'ShopinToken.json'));

let secrets = {};
try {
  secrets = require ('../secrets');
} catch (err) {}

const truffleConfig = require ('../truffle');
const INFURA = process.env.INFURA || secrets.infura;

const networks = {
  development: 'http://localhost:8545',
  ropsten: `https://ropsten.infura.io/${INFURA}`,
  mainnet: `https://mainnet.infura.io/${INFURA}`,
};

const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY || secrets.mainnet;
const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY || secrets.ropsten;

const privateKeys = {
  ropsten: new Buffer (ROPSTEN_PRIVATE_KEY, 'hex'),
  mainnet: new Buffer (MAINNET_PRIVATE_KEY, 'hex'),
};

const contract = truffleContract (ShopinToken);
const argv = require ('yargs')
  .option ('csvfile', {
    alias: 'f',
    demandOption: true,
    describe: 'csv file ([address], [token])',
  })
  .option ('owner', {
    alias: 'o',
    demandOption: true,
    describe: 'owner account',
  })
  .option ('tokenAddress', {
    alias: 't',
    demandOption: true,
    describe: 'token address',
  })
  .option ('network', {
    alias: 'n',
    describe: 'network to run on',
    default: 'development',
  })
  .option ('sleepTime', {
    alias: 's',
    describe: 'sleep time between distributions (in ms)',
    default: 2000,
    number: true,
  })
  .option ('force', {
    describe: 'force send tokens (regardless of current balance)',
    default: false,
  })
  .option ('outfile', {
    alias: 'w',
    describe: 'Write output',
    default: 'bulkTransfer.log',
  })
  .help ().argv;

const provider = new Web3.providers.HttpProvider (networks[argv.network]);
contract.setProvider (provider);

const networkName = argv.network !== 'mainnet' && argv.network !== 'ropsten'
  ? 'development'
  : argv.network;

const networkConfig = truffleConfig.networks[networkName];
const web3 = new Web3 (provider);

const owner = argv.owner;
const data = fs.readFileSync (argv.csvfile, {encoding: 'utf-8'});
const opts = {};
const investorArr = csvjson.toObject (data, opts);

logger.info (`
Bulk transfer
  Running on network: ${networks[argv.network]}
  Running over ${investorArr.length} transfers
  Contract: ${argv.tokenAddress}
  Token owner: ${owner}
`);

const calculateAmount = num => new BigNumber (num) * 10 ** 18;
const promiseTimeout = ms =>
  new Promise (resolve => {
    setTimeout (() => resolve (), ms);
  });

(async function () {
  let instance = await contract.at (argv.tokenAddress);

  const sendRawTransfer = async (i, address, amount) => {
    if (networkName === 'development') {
      return instance.transfer (address, amount, {from: owner});
    } else {
      const latestBlock = await web3.eth.getBlock ('latest');
      const latestNonce = await web3.eth.getTransactionCount (owner);

      const data = instance.contract.transfer.getData (address, amount, {
        from: owner,
      });
      // from: owner,
      const gasPrice = web3.eth.gasPrice;
      const gasLimit = web3.eth.getBlock ('latest').gasLimit;
      const gasPriceHex = web3.toHex (networkConfig.gasPrice);
      const gasLimitHex = web3.toHex (gasLimit);

      return new Promise ((resolve, reject) => {
        const estimatedGas = web3.eth.estimateGas ({to: address, data: data});
        console.log ('estimated', estimatedGas);

        const opts = {
          gas: estimatedGas * 10.101,
          gasLimit: gasLimitHex,
          gasPrice: gasPriceHex,
          to: argv.tokenAddress,
          from: owner,
          value: web3.toHex (0),
          chainId: web3.toHex (web3.version.network),
          nonce: latestNonce + 1,
          data: data,
        };
        console.log (opts);
        const transaction = new tx (opts);

        transaction.sign (privateKeys[networkName]);
        const serializedTxn = transaction.serialize ().toString ('hex');
        // const rawTxnHash = web3.sha3 (serializedKey, {encoding: 'hex'});
        web3.eth.sendRawTransaction ('0x' + serializedTxn, (err, res) => {
          if (err) {
            return reject (err);
          } else {
            return resolve (res);
          }
          // err ? reject (err) : resolve (res);
        });
      });
    }
  };

  const awaitConsensus = async function (txhash) {
    return getTransactionReceiptMined (web3, txhash, {
      interval: 500,
      ensureNotUncle: false,
    });
    // const deferred = Promise.pending ();
    // const filter = web3.eth.filter ('latest');
    // filter.watch (async (err, res) => {
    //   console.log ('watch ', err, res);
    //   web3.eth.getTransactionReceipt (txhash, (err, receipt) => {
    //     console.log ('get transaction receipt', err, receipt);
    //     if (receipt && receipt.transactionHash == txhash) {
    //       filter.stopWatching ();
    //       deferred.resolve (receipt);
    //     }
    //   });
    // });
    // deferred.promise.timeout (60000).catch (err => {
    //   console.error ('Oh no! We could not get the block mined');
    //   process.exit (1);
    // });
    // return deferred.promise;
    // return new Promise ((resolve, reject) => {
    //   web3.eth.getTransactionReceipt (txhash, async (err, res) => {
    //     console.log ('err, err', err, res);
    //     await promiseTimeout (argv.sleepTime);
    //     err || !res ? awaitConsensus (txhash).then (resolve) : resolve (res);
    //   });
    // });
  };

  const currentBalance = async (addr, i) => {
    try {
      const balance = await instance.balanceOf (addr);
      return new BigNumber (balance);
    } catch (e) {
      console.error ('ERROR loading balance: ', e);
    }
  };

  const distributeFn = async (obj, i) => {
    let {address, amount} = obj;
    const currBal = await currentBalance (address, i);
    if (currBal.isEqualTo (amount) || argv.force) {
      logger.info (`${i}: ${address} balance already set ${currBal}`);
      return Promise.resolve ();
    } else {
      amount = amount || 0;
      logger.info (`${i}: assigning token values to ${address}: ${amount}`);
      // return await instance.transfer (address, amount, {from: owner});
      return await sendRawTransfer (i, address, amount);
    }
  };

  logger.info (`Running ${investorArr.length} transactions`);
  const obj = await Promise.reduce (
    investorArr,
    async (acc, obj, i) => {
      const tokens = new BigNumber (acc[obj['address']] || 0);
      return {
        ...acc,
        [obj['address']]: tokens + obj['amount'],
      };
    },
    {}
  )
    .then (obj => {
      return Object.keys (obj).reduce ((acc, investor) => {
        return acc.concat ({
          address: investor,
          amount: calculateAmount (obj[investor]),
        });
      }, []);
    })
    .then (arr => {
      return Promise.mapSeries (
        arr,
        async (item, i) => {
          const res = await distributeFn (item, i);
          if (res) {
            await promiseTimeout (argv.sleepTime);
            await awaitConsensus (res);
          }
          console.log (res);
          return res;
        },
        {concurrency: 1}
      ).then (results => {
        fs.writeFileSync (argv.outfile, JSON.stringify (results, null, 2), {
          encoding: 'utf-8',
        });
        logger.info (`Done!`);
      });
    });
  // return await runNext (obj) (0);
  // const promises = Object.keys (obj).map (async (addr, i) => {
  //   return await distributePromise (addr, obj[addr], i);
  // });
  // console.log (promises);
  // return await Promise.all (promises);
}) ();

//contract.setProvider(provider)
