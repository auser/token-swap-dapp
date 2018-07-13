import * as constants from '../constants'

const initialState = {
  loaded: false,
  web3: null,
  correctNetwork: null,
  accounts: null,
  metamaskUnlocked: true
}
export const web3Reducer = (state = initialState, action) => {
  switch (action.type) {
    case constants.WEB3_GET_WEB3:
      return {
        ...state,
        web3: action.payload
      }
    case constants.WEB3_LOADING_COMPLETE:
      return {
        ...state,
        loaded: true,
        web3: action.payload
      }
    case constants.WEB3_LOADING_ERROR:
      return {
        ...state,
        loaded: false,
      }
    case constants.WEB3_LOAD_ACCOUNTS_COMPLETE:
      return {
        ...state,
        accounts: action.payload,
        metamaskUnlocked: true
      }
    case constants.WEB3_LOAD_ACCOUNTS_ERROR:
      return {
        ...state,
        loadAccountsError: action.payload
      }
    case constants.WEB3_LOAD_ACCOUNTS_NEEDS_UNLOCK:
      return {
        ...state,
        metamaskUnlocked: false
      }
    case constants.WEB3_NETWORK_CORRECT:
      return {
        ...state,
        correctNetwork: true
      }
    case constants.WEB3_NETWORK_INCORRECT:
      return {
        ...state,
        correctNetwork: false
      }
    default:
      return state
  }
}

export default web3Reducer