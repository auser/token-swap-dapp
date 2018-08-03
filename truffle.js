require ('babel-register');
require ('babel-polyfill');

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

const Wallet = require ('ethereumjs-wallet');
const WalletProvider = require ('truffle-wallet-provider');
const Web3 = require ('web3');
const web3 = new Web3 ();

let secrets = {};
try {
  secrets = require ('./secrets');
} catch (err) {}

const INFURA = process.env.INFURA || secrets.infura;
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY || secrets.mainnet;
const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY || secrets.ropsten;

var mainnetPrivateKey = new Buffer (MAINNET_PRIVATE_KEY, 'hex');
var mainnetWallet = Wallet.fromPrivateKey (mainnetPrivateKey);
var mainnetProvider = new WalletProvider (
  mainnetWallet,
  `https://mainnet.infura.io/${INFURA}`
);

var ropstenPrivateKey = new Buffer (ROPSTEN_PRIVATE_KEY, 'hex');
var ropstenWallet = Wallet.fromPrivateKey (ropstenPrivateKey);
var ropstenProvider = new WalletProvider (
  ropstenWallet,
  `https://ropsten.infura.io/${INFURA}`
);

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
    },
    mainnet: {
      network_id: 1,
      provider: mainnetProvider,
      // gas: 1000000,
      // gasPrice: 10000000000,
      from: '0x099d22626b2e80aa7c98942ef44527ead59b5a2f',
      // gasPrice: web3.toWei ('100', 'shannon'),
      // gas: 4712388

      // gas: 7900000,
      // gasPrice: web3.toWei ('100', 'gwei'),
    },
    ropsten: {
      network_id: 3,
      provider: ropstenProvider,
      gas: 4500000,
      gasPrice: web3.toWei ('100', 'gwei'),
    },
  },
  mocha: {
    reporter: 'spec',
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};
