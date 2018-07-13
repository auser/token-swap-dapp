import React from 'react'
import {connect} from 'react-redux'
import Loading from '../components/Loading'
import IncorrectNetwork from '../components/IncorrectNetwork'
import * as actions from '../../redux/actions'

export const withWeb3 = Wrapped => {
  class Wrapper extends React.Component {
    componentDidMount() {
      const {interval} = this.props;
      this.intervalId = setInterval(
        this.collectWeb3Data,
        interval || 1000
      )
    }
    componentWillUnmount() {
      clearInterval(this.intervalId)
    }

    collectWeb3Data = async () => {
      const {loadWeb3, web3, loadWeb3Account} = this.props
      if (!web3.loaded) {
        return loadWeb3()
      } else {
        // Web3 has been loaded...
        loadWeb3Account()
      }
    }

    render() {
      const {web3} = this.props

      if (!web3.loaded) {
        return (<Loading />)
      }

      if (!web3.correctNetwork) {
        return (
          <IncorrectNetwork />
        )
      }

      if (!web3.metamaskUnlocked) {
        return (
          <div className="unlockMetamask">
            <h2>Unlock metamask</h2>
          </div>
        )
      }

      return (
        <div className="web3-wrapper">
          <Wrapped {...this.props} />
        </div>
      )
    }
  }

  const mapStateToProps = (state) => ({
    accounts: state.accounts,
    web3: state.web3
  })
  const mapDispatchToProps = (dispatch) => ({
    loadWeb3: () => dispatch(actions.loadWeb3()),
    loadWeb3Account: () => dispatch(actions.loadWeb3Account())
  })
  return connect(mapStateToProps, mapDispatchToProps)(Wrapper)
}

export default withWeb3