#!/usr/bin/env node

const fs = require ('fs');
const path = require ('path');
const truffleContract = require ('truffle-contract');
const Web3 = require ('web3');
const BigNumber = require ('bignumber.js');
const csvjson = require ('csvjson');

const contractsDir = path.join (
  path.resolve (__dirname),
  '..',
  'build',
  'contracts'
);

const ShopinToken = require (path.join (contractsDir, 'ShopinToken.json'));

let secrets = {};
try {
  secrets = require ('./secrets');
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
  .help ().argv;

const provider = new Web3.providers.HttpProvider (networks[argv.network]);
contract.setProvider (provider);

const owner = argv.owner;
const data = fs.readFileSync (argv.csvfile, {encoding: 'utf-8'});
const opts = {};
const investorArr = csvjson.toObject (data, opts);

const calculateAmount = num => new BigNumber (num) * 10 ** 18;

contract.at (argv.tokenAddress).then (async instance => {
  const res = await Promise.all (
    investorArr.map (async obj => {
      const addr = obj['address'];
      const tokens = calculateAmount (obj['amount']);
      return await instance.transfer (obj['address'], tokens, {from: owner});
    })
  );

  console.log ('res ->', res);
});

//contract.setProvider(provider)
