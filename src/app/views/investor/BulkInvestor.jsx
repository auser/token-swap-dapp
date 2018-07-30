import React from 'react';
// import { Link } from 'react-router-dom'
import Loading from '../../components/Loading';
import BulkRequestTokens from './BulkRequestTokens';
import Error from '../../components/Error';

const InvalidAddress = () => (
  <div className="pure-u-1-1">
    <h1>Invalid address</h1>
    <p>
      Check with your group for the exact url.
    </p>
  </div>
);

const Thanks = props => (
  <div className="pure-u-1-1">
    <h1>Thanks for submitting your requests for a token swap.</h1>
    <p>Your transaction ID is:</p>
    <pre>{props.completedTxId}</pre>
    <button onClick={() => window.location.reload()}>
      Submit some more
    </button>
  </div>
);

export class Investor extends React.Component {
  constructor (props) {
    super (props);

    this.state = {
      loaded: false,
      contractFound: false,
      contractIndex: null,
      completed: false,
      completedTxId: null,
      completedTransaction: null,
    };
  }

  componentWillMount () {
    this.loadContract().then(({contractFound, contractIndex, contractAddress}) => {
      this.setState (
        {
          loaded: true,
          contractFound,
          contractIndex,
          contractAddress,
        },
      )
    }).catch((e) => {
      console.log('error', e)
      this.setState({loaded: false})
    })
  }

  loadContract = async () => {
    const {id} = this.props.match.params;
    const {factory} = this.props;
    const contractIndex = await factory.contractIndexForName(id)
    const contract = await factory.getContractAtIndex (contractIndex[1]);
    const contractAddress = contract[1];
    this.setState ({
      contractAddress,
    });
    return {
      contractIndex: contractIndex[1], contractFound: contract, contractAddress
    }
  };

  onRequestTransfer = async req => {
    const contract = this.props.SwapContract.at (this.state.contractAddress);
    // TODO: Check balance of original shopin tokens
    // and request the transfer with that amount
    // console.log('account ->', accounts[0])
    try {
      const evt = await contract.requestTransfer (
        req.fromAddress,
        req.transactionHash,
        req.amount,
        {from: req.fromAddress}
      );

      this.setState ({
        completed: true,
        completedTxId: evt.tx,
        completedTransaction: {
          ...req,
          transactionHash: evt.tx,
          toAddress: this.state.contractAddress,
        },
      });
    } catch (err) {
      this.setState ({error: err});
    }
  };

  onRequestTransfers = async (amounts, txs, fromAddresses) => {
    console.log('onRequestTransfers -->', amounts, txs, fromAddresses)
    const {SwapContract, accounts} = this.props
    const {contractAddress} = this.state
    console.log('contractAddress --->', contractAddress)
    const contract = await SwapContract.at(contractAddress)
    console.log(contract)

    try {
      const evt = await contract.requestTransfers(fromAddresses, txs, amounts, {from: accounts[0]})

      console.log('evt ->', evt)

      this.setState({
        completed: true,
        completedTxId: evt.tx,
        completedTransactions: {

        }
      })
    } catch (err) {
      console.log("err ------------>",
                  err,
                  this.state.contractAddress,
                  fromAddresses,
                  txs,
                  amounts
      )
      this.setState({error: err})
    }
  };

  resetErrors = async () => this.setState({error: null})

  render () {
    const {
      loaded,
      completed,
      completedTxId,
      completedTransaction,
      contractFound,
      error,
    } = this.state;

    if (!loaded) return <Loading />;
    if (!contractFound) return <InvalidAddress />;
    if (completed) {
      return (
        <Thanks
          completed={completed}
          completedTxId={completedTxId}
          completedTransaction={completedTransaction}
        />
      );
    }

    return (
      <div className="pure-g">
        <div className="pure-u-1-1">
          {error
            ? (<div className="error">
                <h3>Unable to create transfer request</h3>
                <Error error={error} />
                <button className="pure-button" onClick={this.resetErrors}>Try again</button>
              </div>)
            : <BulkRequestTokens
                onRequestTransfers={this.onRequestTransfers}
                {...this.props}
              />}
        </div>
      </div>
    );
  }
}
// <RequestTransfer onRequestTransfer={this.onRequestTransfer} {...this.props} />

export default Investor;
