import * as constants from '../constants'
// import getWeb3 from '../../utils/getWeb3'

export const Errors = {
  INCORRECT_NETWORK: 1
}

const fetchWeb3 = async (localProvider = null) => {
  let {web3} = window

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      const Web3 = require('web3')
      let provider = null;

      if (process.env.NODE_ENV === 'development') {
        provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')
      } else {
        provider = web3.currentProvider
      }
      // const Web3 = require('web3')
      // Use Mist/MetaMask's provider.
      return new Web3(provider)
    } else {
      return null
    }
};

export const setWeb3 = web3 => ({
  type: constants.WEB3_GET_WEB3,
  payload: web3
})


export const setAccount = account => ({
  type: constants.WEB3_SET_ACCOUNT,
  payload: account
})

export const loadWeb3 = () => async (dispatch, getState) => {
  dispatch({type: constants.WEB3_LOAD_WEB3})
  fetchWeb3().then(async web3 => {
    if (web3) {
      dispatch({
        type: constants.WEB3_LOADING_COMPLETE,
        payload: web3
      })
    } else {
      dispatch({
        type: constants.WEB3_NOT_INSTALLED
      })
    }
  })
}

export const loadWeb3Account = () => async (dispatch, getState) => {
  dispatch({type: constants.WEB3_LOAD_ACCOUNTS})
  const {web3} = getState()
  if (web3) {
    web3.web3.eth.getAccounts((err, accounts) => {
      if (accounts) {
        if (accounts.length === 0) {
          dispatch({
            type: constants.WEB3_LOAD_ACCOUNTS_NEEDS_UNLOCK
          })
        } else {
          dispatch({
            type: constants.WEB3_LOAD_ACCOUNTS_COMPLETE,
            payload: accounts
          })
        }
      } else {
        dispatch({
          type: constants.WEB3_LOAD_ACCOUNTS_ERROR
        })
      }
    })
  }
}

export const checkNetwork = (requiredNetwork = '1') => async (dispatch, getState) => {
  dispatch({type: constants.WEB3_CHECKING_NETWORK})
  const {web3} = getState();

  web3.web3.version.getNetwork((err, currentNetworkId) => {
    if (err) {
      dispatch({type: constants.WEB3_INVALID_NETWORK})
    } else {

      const changedNetwork = web3.currentNetworkId !== currentNetworkId;

      if (changedNetwork) {
        const onCorrectNetwork = requiredNetwork === '*' ?
          (currentNetworkId !== '1' && currentNetworkId !== '3') :
          requiredNetwork === currentNetworkId;

        if (onCorrectNetwork) {
          dispatch({
            type: constants.WEB3_VALID_NETWORK,
            payload: currentNetworkId
          })
        } else {
          dispatch({
            type: constants.WEB3_INVALID_NETWORK,
            payload: currentNetworkId
          })
        }
      }
    }
  })
}