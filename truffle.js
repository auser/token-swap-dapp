require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require("truffle-hdwallet-provider");

let secrets = {}
try {
  secrets = require('./secrets')
} catch(err) {}

const mnemonic = process.env.MNEMONIC || secrets.mnemonic;
const infura = process.env.INFURA || secrets.infura

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
    },
    production: {
      provider: function() {
        return new HDWalletProvider(mnemonic, `https://mainnet.infura.io/${infura}`, 0)
      },
      gas: 4700000,
      network_id: 1
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, `https://ropsten.infura.io/${infura}`, 0)
      },
      network_id: 3
    },
  },
  mocha: {
    reporter: 'spec'
  }
};
