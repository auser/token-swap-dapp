import ERC20 from '../../build/contracts/ERC20.json';
import SwapFactory from '../../build/contracts/SwapFactory.json';
import SwapContract from '../../build/contracts/SwapContract.json';
import SwapController from '../../build/contracts/SwapController.json';
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

export const loadContracts = (web3) =>
  new Promise ((resolve, reject) => {

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
  });

export default loadContracts;
