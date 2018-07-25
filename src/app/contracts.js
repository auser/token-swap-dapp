import ERC20 from '../../build/contracts/ERC20.json';
import SwapFactory from '../../build/contracts/SwapFactory.json';
import SwapContract from '../../build/contracts/SwapContract.json';
import SwapController from '../../build/contracts/SwapController.json';
import getWeb3 from '../utils/getWeb3';
import ShopinToken from '../../build/contracts/ShopinToken.json'

const contract = require ('truffle-contract');
const factoryDef = contract (SwapFactory);
const controllerDef = contract (SwapController);
const swapContractDef = contract (SwapContract);
const tokenContractDef = contract (ERC20);
const newtokenDef = contract(ShopinToken)

const loadContracts = () =>
  new Promise ((resolve, reject) => {
    getWeb3.then (({web3}) => {
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

        Promise.all([
          controllerDef.at(process.env.REACT_APP_CONTROLLER_ADDRESS),
          factoryDef.at(process.env.REACT_APP_FACTORY_ADDRESS),
          tokenContractDef.at(process.env.REACT_APP_TOKEN_ADDRESS),
          newtokenDef.at(process.env.REACT_APP_NEW_TOKEN_ADDRESS),
       ]).then(([controller, factory, token, newToken]) => {

        resolve ({
          accounts,
          controller,
          factory,
          token,
          newToken,
          SwapContract: swapContractDef,
          web3,
        });
        })
          .catch(reject)
      });
    });
  });

export default loadContracts;
