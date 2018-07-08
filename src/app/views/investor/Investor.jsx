import React from 'react'
// import { Link } from 'react-router-dom'
import Loading from '../../components/Loading'
import PrintReceipt from '../../components/PrintReceipt'

const InvalidAddress = () => (
  <div className="pure-u-1-1">
    <h1>Invalid address</h1>
    <p>
      Check with your group for the exact url.
    </p>
  </div>
)

const Thanks = (props) => (
  <div className="pure-u-1-1">
    <h1>Thanks for submitting your request for a token swap.</h1>
    <p>Your transaction ID is:</p>
    <pre>{props.completedTxId}</pre>
    <PrintReceipt transaction={props.completedTransaction} {...props} />
  </div>
)

class RequestTransfer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transactionHash: '',
      amount: 0,
      fromAddress: null,
      toAddress: null,
    }
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    this.props.onRequestTransfer(this.state);
  }

  onUpdated = (evt) => {
    const value = evt.target.value;
    const {web3, token} = this.props
    this.setState({transactionHash: value}, () => {
      web3.eth.getTransactionReceipt(value, (err, obj) => {

        if (obj) {
          token.Transfer({}, {
            fromBlock: obj.blockNumber,
            toBlock: obj.blockNumber + 1
          }, (err, res) => {
            if (!err) {
              const {args} = res
              const fromAddress = args.from;
              const amount = args.value.toNumber()
              this.setState({amount, fromAddress, transactionHash: value})
            }
          })
        } else {
          this.setState({amount: 0})
        }
      })
    })
  }


  render() {
    return (
      <div className="pure-u-1-1">
        <h1>Request a token transfer</h1>
        <p>
          In order to get your exchange of the new tokens, you'll need to register your address.
        </p>

        <p>
          Fill in your transaction hash from the transfer of your `SHOP` tokens here:
        </p>

        <div className="pure-u-1-1">
          <form onSubmit={this.handleSubmit}>
          <div className="pure-u-1-1">
            <input
              onChange={this.onUpdated}
              ref={r => this.inputRef = r}
              style={{width: '100%', padding: 10}}
              placeholder={'Your transaction hash, i.e. 0x...'}
              />
          </div>
          <div className="pure-u-1-1">
            We'll send {this.state.amount} SHOPIN tokens to your account {this.state.fromAddress}.
          </div>
          <div className="pure-u-1-1">
            <input
              value={`Request token transfer for ${this.state.amount} tokens`}
              type="submit"
              disabled={this.state.amount === 0}
              className="pure-button" />
          </div>
          </form>
        </div>
      </div>
    )
  }
}

export class Investor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      contractFound: false,
      contractIndex: null,
      completed: false,
      completedTxId: null,
      completedTransaction: null
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

  onRequestTransfer = async (req) => {
    const contract = this.props.SwapContract.at(this.state.contractAddress)
    // TODO: Check balance of original shopin tokens
    // and request the transfer with that amount
    // console.log('account ->', accounts[0])
    try {
      const evt = await contract.requestTransfer(req.amount, req.transactionHash, {from: req.fromAddress})

      this.setState({
        completed: true,
        completedTxId: evt.tx,
        completedTransaction: {
          ...req,
          transactionHash: evt.tx,
          toAddress: this.state.contractAddress,
        }
      })
    } catch (err) {
      this.setState({error: err})
    }
 }

  render() {
    const {loaded, completed, completedTxId, completedTransaction, contractFound, error} = this.state;

    if (!loaded) return <Loading />
    if (!contractFound) return <InvalidAddress />
      if (completed) {
        return <Thanks
            completed={completed}
            completedTxId={completedTxId}
            completedTransaction={completedTransaction} />
      }

    return (
      <div className="pure-g">
        <div className="pure-u-1-1">
          {
            error ?
            <h3>Unable to create transfer request</h3> :
            <RequestTransfer onRequestTransfer={this.onRequestTransfer} {...this.props} />
          }
        </div>
      </div>
    )
  }
}

export default Investor
