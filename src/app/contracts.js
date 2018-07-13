import ERC20 from '../../build/contracts/ERC20.json';
import SwapFactory from '../../build/contracts/SwapFactory.json';
import SwapContract from '../../build/contracts/SwapContract.json';
import SwapController from '../../build/contracts/SwapController.json';
import getWeb3 from '../utils/getWeb3';
import ShopinToken from '../../build/contracts/ShopinToken.json'

const contract = require ('truffle-contract');
const networks = require('../../truffle').networks
const NODE_ENV = process.env.NODE_ENV

export const Errors = {
  INCORRECT_NETWORK: 1
}

export const detectNetwork = (web3) => new Promise((resolve, reject) => {
  web3.version.getNetwork((err, netId) => {
      err ? reject(err) : resolve(netId);
  })
})

export const isOnRightNetwork = (web3) => new Promise((resolve, reject) => {
  detectNetwork(web3).then(net_id => {
    if (NODE_ENV === 'development') {
      net_id !== '1' && net_id !== '3' ? resolve() : reject()
    } else if (NODE_ENV === 'production') {
      net_id === '1' ? resolve() : reject()
    } else if (NODE_ENV === 'ropsten') {
      net_id === networks['ropsten'] ? resolve() : reject()
    }
  })
})

export const loadContracts = () =>
  new Promise ((resolve, reject) => {

    getWeb3.then (({web3}) => {
      const factoryDef = contract (SwapFactory);
      const controllerDef = contract (SwapController);
      const swapContractDef = contract (SwapContract);
      const tokenContractDef = contract (ERC20);
      const newtokenDef = contract(ShopinToken)

      factoryDef.setProvider (web3.currentProvider);
      controllerDef.setProvider (web3.currentProvider);
      swapContractDef.setProvider (web3.currentProvider);
      tokenContractDef.setProvider (web3.currentProvider);
      newtokenDef.setProvider(web3.currentProvider);

      // Get accounts.
      web3.eth.getAccounts (async (error, accounts) => {
        if (error) {
          reject (error);
        }

        isOnRightNetwork(web3)
        .then(() => {
          Promise.all([
            controllerDef.at (
              process.env.REACT_APP_CONTROLLER_ADDRESS
            ),
            factoryDef.at (process.env.REACT_APP_FACTORY_ADDRESS),
            tokenContractDef.at (
              process.env.REACT_APP_TOKEN_ADDRESS
            ),
            newtokenDef.at(
              process.env.REACT_APP_NEW_TOKEN_ADDRESS
            )
          ]).then(([controller, factory, token, newToken]) => {
            return {
              accounts,
              controller,
              factory,
              token,
              newToken,
              SwapContract: swapContractDef,
              web3,
            }
          })
        .then(resolve)
        .catch(reject)
        })
        .catch(() => reject(Errors.INCORRECT_NETWORK))
      });
    });
  });

export default loadContracts;
