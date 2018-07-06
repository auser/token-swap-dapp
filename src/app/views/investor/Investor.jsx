import React from 'react'
// import { Link } from 'react-router-dom'
import Loading from '../../components/Loading'

const InvalidAddress = () => (
  <div className="pure-u-1-1">
    <h1>Invalid address</h1>
    <p>
      Check with your group for the exact url.
    </p>
  </div>
)

const RequestTransfer = ({ onRequestTransfer }) => {
  return (
    <div className="pure-u-1-1">
      <h1>Request a token transfer</h1>
      <p>
        In order to get your exchange of the new tokens, you'll need to register your address. You can do so by clicking on the button below:
      </p>
      <button onClick={onRequestTransfer}>
        Request token transfer
      </button>
    </div>
  )
}

export class Investor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      contractFound: false,
      contractIndex: null
    }
  }

  componentWillMount() {
    const {match, factory} = this.props;
    const {id} = match.params;
    factory.contractIndexForName(id)
    .then(([contractFound, contractIndex]) => {
      this.setState({
        loaded: true,
        contractFound,
        contractIndex
      }, () => this.loadContract())
    })
    .catch(() => this.setState({loaded: false}))
  }

  loadContract = async () => {
    const {factory} = this.props
    const {contractIndex} = this.state
    const contract = await factory.getContractAtIndex(contractIndex)
    const contractAddress = contract[1]
    this.setState({
      contractAddress
    })
  }

  onRequestTransfer = async () => {
    const {accounts} = this.props;
    const contract = this.props.SwapContract.at(this.state.contractAddress)
    // TODO: Check balance of original shopin tokens
    // and request the transfer with that amount
    const amount = 100
    // console.log('account ->', accounts[0])
    // const evt = await contract.requestTransfer(amount, {from: accounts[0]})
    // console.log('contract ->', evt)
  }

  render() {
    const {loaded, contractFound} = this.state;

    if (!loaded) return <Loading />
    if (!contractFound) return <InvalidAddress />
    
    return (
      <div className="pure-g">
        <div className="pure-u-1-1">
          <h1>Investor view</h1>
          <RequestTransfer onRequestTransfer={this.onRequestTransfer} />
        </div>
      </div>
    )
  }
}

export default Investor