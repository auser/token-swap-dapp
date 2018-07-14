import {combineReducers} from 'redux'

import {web3Reducer} from './reducers/web3'
import {contractsReducer} from './reducers/contracts'
import {syndicateReducer} from './reducers/syndicates'

export default combineReducers({
  web3: web3Reducer,
  contracts: contractsReducer,
  syndicates: syndicateReducer
})