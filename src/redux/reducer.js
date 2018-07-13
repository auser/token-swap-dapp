import {combineReducers} from 'redux'

import {web3Reducer} from './reducers/web3'
import {contractsReducer} from './reducers/contracts'

export default combineReducers({
  web3: web3Reducer,
  contracts: contractsReducer,
})