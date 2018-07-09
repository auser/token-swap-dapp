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
    <p>Your transaction ID is:</p>
    <pre>{props.completedTxId}</pre>
    <PrintReceipt transaction={props.completedTransaction} {...props} />
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
    // TODO: Check balance of original shopin tokens
    // and request the transfer with that amount
    // console.log('account ->', accounts[0])
    try {
      const evt = await contract.requestTransfer (
        req.amount,
        req.transactionHash,
        this.props.accounts[0],
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
    console.log ('request transfers here...');
    const contract = this.props.SwapContract.at(this.state.contractAddress)

    try {
      const evt = await contract.requestTransfers(amounts, txs, fromAddresses)

      this.setState({
        completed: true,
        completedTxId: evt.tx,
        completedTransactions: {

        }
      })
    } catch (err) {
      this.setState({error: err})
    }
  };

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
            ? <h3>Unable to create transfer request</h3>
: <RequestTransfer onRequestTransfer={this.onRequestTransfer} {...this.props} />
  }
        </div>
      </div>
    );
  }
}

export default Investor;
