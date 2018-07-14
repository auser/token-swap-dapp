import React from 'react'
import {connect} from 'react-redux'
import Loading from '../components/Loading'
import IncorrectNetwork from '../components/IncorrectNetwork'
import UnlockMetamask from '../components/UnlockMetamask'
import InstallMetamask from '../components/InstallMetamask'
import * as actions from '../../redux/actions'

export const withWeb3 = Wrapped => {
  class Wrapper extends React.Component {

    componentDidMount() {
      const {updateInterval} = this.props
      this.intervalId = setInterval(
        this.collectWeb3Data,
        updateInterval || 1000
      )
    }
    componentWillUnmount() {
      clearInterval(this.intervalId)
    }

    collectWeb3Data = async () => {
      const {
        loadWeb3, web3, loadWeb3Account,
        hasMetamaskInstalled,
        checkNetwork,
        requiredNetwork,
        currentAccount, setAccount, hasLoadedAccounts,
        checkingNetwork
      } = this.props

      if (!web3.web3) {
        return loadWeb3();
      } else {
        if (hasMetamaskInstalled) {

          if (!checkingNetwork) checkNetwork(requiredNetwork)

          if (!hasLoadedAccounts) {
            loadWeb3Account()
          } else {
            if (web3.accounts.length === 0) {
              console.log('no accounts', web3.accounts)
            } else {
              if (web3.accounts[0] !== currentAccount) {
                setAccount(web3.accounts[0]);
              }
            }
            // const [account] = accounts;
            // const recentlyChangedAccount = account && account !== currentAccount
            // const recentlyLoggedOut = !account && currentAccount

            // if (recentlyChangedAccount || recentlyLoggedOut) {
            //   setAccount(account)
            // }
          }
        }
      }
    }

    render() {
      const {
        web3,
        hasMetamaskInstalled,
        checkingForWeb3,
        validNetwork,
        checkingNetwork,
      } = this.props

      if (checkingForWeb3) {
        return (<Loading />)
      }

      if (!hasMetamaskInstalled) {
        return (
          <InstallMetamask />
        )
      }

      if (checkingNetwork && !validNetwork) {
        return (
          <IncorrectNetwork />
        )
      }

      if (!web3.metamaskUnlocked) {
        return (
          <UnlockMetamask />
        )
      }

      return (
        <div className="web3-wrapper">
          <Wrapped {...this.props} />
        </div>
      )
    }
  }

  const mapStateToProps = ({web3}) => ({
    web3,
    currentAccount: web3.currentAccount,
    checkingForWeb3: web3.checkingForWeb3,
    hasMetamaskInstalled: web3.hasMetamaskInstalled,
    validNetwork: web3.validNetwork,
    hasLoadedAccounts: web3.hasLoadedAccounts,
  })
  const mapDispatchToProps = (dispatch) => ({
    loadWeb3: () => dispatch(actions.loadWeb3()),
    loadWeb3Account: () => dispatch(actions.loadWeb3Account()),
    checkNetwork: (n) => dispatch(actions.checkNetwork(n)),
    setAccount: () => dispatch(actions.setAccount()),
  })
  return connect(mapStateToProps, mapDispatchToProps)(Wrapper)
}

export default withWeb3