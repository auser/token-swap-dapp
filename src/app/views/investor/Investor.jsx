import React from 'react';
// import { Link } from 'react-router-dom'
import Loading from '../../components/Loading';
import PrintReceipt from '../../components/PrintReceipt';
import RequestTransfer from './RequestTransfer';

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
    <h1>Thank you for claiming your SHOPIN Tokens</h1>
    <p>The transaction ID for your Swap Request is:</p>
    <code>{props.completedTxId}</code>
    <PrintReceipt transaction={props.completedTransaction} {...props} />
  </div>
);

const ErrorCreatingTransfer = props => (
  <div className='pure-u-1-1'>
    <h3>Error creating transfer request. Try again</h3>
    <button onClick={props.resetErrors}>
      Try again
    </button>
  </div>
)

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
    const {match, factory} = this.props;
    const {id} = match.params;
    factory
      .contractIndexForName (id)
      .then (([contractFound, contractIndex]) => {
        this.setState (
          {
            loaded: true,
            contractFound,
            contractIndex,
          },
          () => this.loadContract ()
        );
      })
      .catch (() => this.setState ({loaded: false}));
  }

  loadContract = async () => {
    const {factory} = this.props;
    const {contractIndex} = this.state;
    const contract = await factory.getContractAtIndex (contractIndex);
    const contractAddress = contract[1];
    this.setState ({
      contractAddress,
    });
  };

  onRequestTransfer = async req => {
    const contract = this.props.SwapContract.at (this.state.contractAddress);
    try {
      const evt = await contract.requestTransfer (
        req.fromAddress,
        req.transactionHash,
        req.amount.toNumber(),
        {from: this.props.accounts[0]}
      );

      this.setState ({
        completed: true,
        completedTxId: evt.tx,
        completedTransaction: {
          ...req,
          amount: req.amount.toNumber(),
          transactionHash: evt.tx,
          toAddress: this.state.contractAddress,
        },
      });
    } catch (err) {
      console.log('error occurred requesting transfer', err, req)
      this.setState ({error: err});
    }
  };

  onRequestTransfers = async (amounts, txs, fromAddresses) => {
    const contract = this.props.SwapContract.at (this.state.contractAddress);

    try {
      const evt = await contract.requestTransfers (amounts, txs, fromAddresses);

      this.setState ({
        completed: true,
        completedTxId: evt.tx,
        completedTransactions: {},
      });
    } catch (err) {
      console.error (err);
      this.setState ({error: err});
    }
  };

  resetErrors = () => this.setState({error: null})

  render () {
    const {
      loaded,
      completed,
      completedTxId,
      completedTransaction,
      contractFound,
      error,
    } = this.state;
    const {match} = this.props;
    const {id} = match.params;

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
            ? <ErrorCreatingTransfer resetErrors={this.resetErrors}  />
            : <RequestTransfer
                onRequestTransfer={this.onRequestTransfer}
                submitToAddress={id}
                {...this.props}
              />}
        </div>
      </div>
    );
  }
}

export default Investor;
