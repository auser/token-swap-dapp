import SwapFactory from '../../build/contracts/SwapFactory.json';
import SwapController from '../../build/contracts/SwapController.json';
import getWeb3 from '../utils/getWeb3';

const contract = require ('truffle-contract');
const factoryDef = contract (SwapFactory);
const controllerDef = contract (SwapController)

const loadContracts = () => new Promise((resolve, reject) => {
  getWeb3.then(({web3}) => {
    factoryDef.setProvider (web3.currentProvider);
    controllerDef.setProvider(web3.currentProvider);

    // Get accounts.
    web3.eth.getAccounts (async (error, accounts) => {
      const [controller, factory] = await Promise.all([
        controllerDef.at(process.env.REACT_APP_CONTROLLER_ADDRESS),
        factoryDef.at(process.env.REACT_APP_FACTORY_ADDRESS)
      ])

      resolve({
        accounts,
        controller,
        factory,
        web3
      })
    })
  });
})

export default loadContracts