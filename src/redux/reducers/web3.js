import * as constants from '../constants'

const initialState = {
  checkingForWeb3: true,
  web3: null,
  checkingNetwork: true,
  validNetwork: false,
  currentNetwork: '0',
  accounts: null,
  metamaskUnlocked: true,
  hasMetamaskInstalled: false,
  hasLoadedAccounts: false,
}
export const web3Reducer = (state = initialState, action) => {
  switch (action.type) {
    case constants.WEB3_LOAD_WEB3:
      return {
        ...state,
        checkingForWeb3: true,
      }
    case constants.WEB3_LOADING_COMPLETE:
      return {
        ...state,
        checkingForWeb3: false,
        web3: action.payload,
        hasMetamaskInstalled: true,
      }
    case constants.WEB3_NOT_INSTALLED:
      return {
        ...state,
        checkingForWeb3: false,
        hasMetamaskInstalled: false
      }
    case constants.WEB3_LOAD_ACCOUNTS:
      return {
        ...state,
        hasLoadedAcconts: false,
        accounts: []
      }
    case constants.WEB3_LOAD_ACCOUNTS_COMPLETE:
      return {
        ...state,
        accounts: action.payload,
        currentAccount: action.payload[0],
        hasLoadedAccounts: true,
        // metamaskUnlocked: true
      }
    case constants.WEB3_LOAD_ACCOUNTS_ERROR:
      return {
        ...state,
        hasLoadedAccounts: false,
        loadAccountsError: action.payload,
      }
    case constants.WEB3_LOAD_ACCOUNTS_NEEDS_UNLOCK:
      return {
        ...state,
        metamaskUnlocked: false
      }
    case constants.WEB3_CHECKING_NETWORK:
      return {
        ...state,
        checkingNetwork: true
      }
    case constants.WEB3_VALID_NETWORK:
      return {
        ...state,
        currentNetworkId: action.payload,
        checkingNetwork: false,
        validNetwork: true
      }
    case constants.WEB3_INVALID_NETWORK:
      return {
        ...state,
        currentNetworkId: action.payload,
        checkingNetwork: false,
        validNetwork: false
      }
    default:
      return state
  }
}

export default web3Reducer