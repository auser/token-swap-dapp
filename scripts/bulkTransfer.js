#!/usr/bin/env node

const fs = require ('fs');
const path = require ('path');
const truffleContract = require ('truffle-contract');
const Web3 = require ('web3');
const BigNumber = require ('bignumber.js');
const csvjson = require ('csvjson');
const Promise = require ('bluebird');
const tx = require ('ethereumjs-tx');

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
  ropsten: `https://ropsten.infura.io/v3/${INFURA}`,
  mainnet: `https://mainnet.infura.io/v3/${INFURA}`,
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

  const sendRawTransfer = async (to, amount) => {
    if (networkName === 'development') {
      return instance.transfer (address, amount, {from: owner});
    } else {
      const data = instance.contract.transfer.getData (to, amount, {
        from: owner,
      });
      const opts = {
        from: owner,
        gasLimit: web3.toHex (networkConfig.gas || 800000),
        gasPrice: web3.toHex (networkConfig.gasPrice || 20000000000),
        to: argv.tokenAddress,
        value: web3.toHex (0),
        chainId: web3.toHex (web3.version.network),
        nonce: web3.toHex (web3.eth.getTransactionCount (owner) + 1),
        data,
      };
      const transaction = new tx (opts);

      transaction.sign (privateKeys[networkName]);
      const serializedKey = transaction.serialize ().toString ('hex');
      return new Promise ((resolve, reject) => {
        web3.eth.sendRawTransaction ('0x' + serializedKey, (err, res) => {
          err ? reject (err) : resolve (res);
        });
      });
    }
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
      return Promise.resolve (currBal);
    } else {
      amount = amount || 0;
      logger.info (`${i}: assigning token values to ${address}: ${amount}`);
      // return await instance.transfer (address, amount, {from: owner});
      return await sendRawTransfer (address, amount);
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
      return Promise.map (
        arr,
        async (item, i) => {
          await promiseTimeout (argv.sleepTime);
          return await distributeFn (item, i);
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
