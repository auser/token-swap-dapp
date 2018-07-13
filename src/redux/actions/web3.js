import * as constants from '../constants'
// import getWeb3 from '../../utils/getWeb3'

const networks = require('../../../truffle').networks
const NODE_ENV = process.env.NODE_ENV

export const Errors = {
  INCORRECT_NETWORK: 1
}

const detectNetwork = (web3) => new Promise((resolve, reject) => {
  web3.version.getNetwork((err, netId) => {
      err ? reject(err) : resolve(netId);
  })
})

const isOnRightNetwork = (web3) => new Promise((resolve, reject) => {
  detectNetwork(web3).then(net_id => {
    if (NODE_ENV === 'development') {
      net_id !== '1' && net_id !== '3' ? resolve() : reject()
    } else if (NODE_ENV === 'production') {
      net_id === '1' ? resolve() : reject()
    } else if (NODE_ENV === 'ropsten') {
      net_id === networks['ropsten'] ? resolve() : reject()
    } else {
      reject()
    }
  })
})

const fetchWeb3 = async (localProvider = null) => {
  const Web3 = require('web3')
  let web3 = window.web3

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(localProvider || web3.currentProvider)

      return web3
    } else {
      // Fallback to localhost if no web3 injection. We've configured this to
      // use the development console's port by default.
      const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')

      web3 = new Web3(provider)

      return web3
    }
};

export const setWeb3 = web3 => ({
  type: constants.WEB3_GET_WEB3,
  payload: web3
})

export const setValidNetwork = bool => ({
  type: constants.WEB3_GET_NETWORK,
  payload: bool
})

export const setAccount = account => ({
  type: constants.WEB3_GET_ACCOUNT,
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
      try {
        await isOnRightNetwork(web3)
        dispatch({
          type: constants.WEB3_NETWORK_CORRECT
        })
      } catch (e) {
        dispatch({
          type: constants.WEB3_NETWORK_INCORRECT
        })
      }
    } else {
      dispatch({
        type: constants.WEB3_LOADING_ERROR
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