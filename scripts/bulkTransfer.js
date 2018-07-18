#!/usr/bin/env node

const fs = require ('fs');
const path = require ('path');
const truffleContract = require ('truffle-contract');
const Web3 = require ('web3');
const BigNumber = require ('bignumber.js');
const csvjson = require ('csvjson');
const Promise = require ('bluebird');

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

const INFURA = process.env.INFURA || secrets.infura;

const networks = {
  development: 'http://localhost:8545',
  ropsten: `https://ropsten.infura.io/${INFURA}`,
  mainnet: `https://mainnet.infura.io/${INFURA}`,
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
    default: 1000,
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
      return await instance.transfer (address, amount, {from: owner});
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
