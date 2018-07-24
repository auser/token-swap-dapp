import React from 'react';
import {confirmTransferDetails} from '../../../utils/confirmTransferDetails'

const tdStyle = {
  fontSize: 12
}
const RequestTokenItem = ({transaction, idx}) => (
  <tr className={idx % 2 === 0 && 'pure-table-odd'}>
    <td style={{}}>
      <i style={{
        color: 'green',
        backgroundColor: 'white',
      }} className="fas fa-check-circle"></i>
    </td>
    <td style={tdStyle}>
      {transaction.fromAddress}
    </td>
    <td style={tdStyle}>
      {transaction.toAddress}
    </td>
    <td style={tdStyle}>
      {transaction.amount.toNumber()}
    </td>
  </tr>
);

const extractTransactionHash = (web3, token) => (value) => {
  return new Promise((resolve, reject) => {

  web3.eth.getTransaction (value, (err, obj) => {
    if (err) {
      return reject(err);
    } else {
      if (!obj) {
        return reject("Invalid transaction hash")
      } else {
        token.Transfer (
          {},
            {
              fromBlock: obj.blockNumber,
              toBlock: obj.blockNumber + 1,
            },
            (err, res) => {
              if (err) return reject(err);
              const fromAddress = res.args.from;
              const toAddress = res.args.to;
              const amount = res.args.value.toNumber ();
              resolve({hash: value, fromAddress, amount, toAddress})
            }
          );
      }
    }
  })
  })
}

// TODO: Add memoization, maybe?
export class BulkRequestTokens extends React.Component {
  constructor (props) {
    super (props);

    const {web3, token} = this.props;
    this.extractTransactionHash = extractTransactionHash(web3, token);

    this.state = {
      transactionObjects: [],
    };
  }

  checkTransactionHash = async (txHash) => {
    try {
      const {accounts, web3} = this.props
      if (txHash.length === 0) return null;
      return await confirmTransferDetails(txHash, accounts[0], web3);
    } catch(e) {
      console.log('error ->', e);
      return null;
    }
  }

  onTextareaChange = async evt => {
    const value = evt.target.value;
    if (value.length === 0) {
      this.setState ({transactionObjects: []});
    } else {
      const out = value.split ('\n')
        .unique()
        .map(this.checkTransactionHash)
      await Promise.all(out)
      .then(res => {
        return res.filter(v => v);
      }).then(transactionObjects => {
        this.setState({transactionObjects})
      })
    }
  };

  handleSubmit = evt => {
    evt.preventDefault ();
    const {transactionObjects} = this.state;

    const txAddresses = transactionObjects.map(tx => tx.transactionHash)
    const amounts = transactionObjects.map(tx => tx.amount.toNumber());
    const participants = transactionObjects.map(tx => tx.fromAddress)

    this.props.onRequestTransfers (amounts, txAddresses, participants);
  };


  render () {
    const {transactionObjects} = this.state;
    return (
      <div className="pure-u-1-1">
        <h1>Claim SHOPIN Tokens</h1>
        <p>
          In order to receive SHOPIN Tokens, you'll need to send your SHOP Tokens to the following Ethereum address:
        </p>

        <p>
          <code>
            {this.props.accounts[0]}
          </code>
        </p>

        <p>
          Fill in your transaction hash from the transfer of your SHOP Tokens here:
        </p>

        <form style={{
          marginBottom: 20,
        }} className="pure-g" onSubmit={this.handleSubmit}>
        <div className="pure-u-1-1">
        <textarea
          onChange={this.onTextareaChange}
          className="pure-input-1-2"
          style={{width: '100%', padding: 10, marginBottom: 20}}
          placeholder="Enter your transaction hashes"
        />
        </div>
        <div className="pure-u-1-1">
        <input
            value={`Submit ${transactionObjects.length} SHOPIN Token requests`}
            type="submit"
            disabled={this.state.amount === 0}
            className="pure-button"
          />
        </div>
        </form>

        <table className="pure-table pure-table-bordered">
          <thead>
            <tr>
              <th></th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactionObjects.map ((t, idx) => (
              <RequestTokenItem key={t.transactionHash} idx={idx} transaction={t} />
            ))}
          </tbody>
        </table>

      </div>
    );
  }
}

export default BulkRequestTokens;
