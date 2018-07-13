import ERC20 from '../../../build/contracts/ERC20.json';
import SwapFactory from '../../../build/contracts/SwapFactory.json';
import SwapContract from '../../../build/contracts/SwapContract.json';
import SwapController from '../../../build/contracts/SwapController.json';
import ShopinToken from '../../../build/contracts/ShopinToken.json'

const contract = require ('truffle-contract');

import * as constants from '../constants'

// const factoryDef = contract (SwapFactory);
// const controllerDef = contract (SwapController);
// const swapContractDef = contract (SwapContract);
// const tokenContractDef = contract (ERC20);
// const newtokenDef = contract(ShopinToken)

// factoryDef.setProvider (web3.currentProvider);
// controllerDef.setProvider (web3.currentProvider);
// swapContractDef.setProvider (web3.currentProvider);
// tokenContractDef.setProvider (web3.currentProvider);
// newtokenDef.setProvider(web3.currentProvider);

const contractMap = {
  'factory': contract(SwapFactory),
  'controller': contract(SwapController),
  'swapContract': contract(SwapContract),
  'tokenContract': contract(ERC20),
  'newToken': contract(ShopinToken),
}

export const setContract = (name, contract) => ({
  type: constants.CONTRACT_LOADED,
  payload: {contract, name}
})

export const loadingContract = (name) => ({
  type: constants.CONTRACT_LOADING_CONTRACT,
  payload: {name}
})

export const fetchContract = (contractName) => async (dispatch, getState) => {
  // TODO: don't constantly load
  dispatch(loadingContract(contractName))

  const contract = contractMap[contractName]
  const deployed = await contract.deployed()
  dispatch(setContract(contractName, contract: deployed))
}