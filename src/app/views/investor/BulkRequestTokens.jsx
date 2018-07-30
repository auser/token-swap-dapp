import React from 'react';
import BigNumber from 'bignumber.js'
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
      {(transaction.amount.toNumber())}
    </td>
  </tr>
);

// TODO: Add memoization, maybe?
export class BulkRequestTokens extends React.Component {
  constructor (props) {
    super (props);

    this.state = {
      totalSum: new BigNumber(0),
      transactionObjects: [],
    };
  }

  checkTransactionHash = async (txHash) => {
    try {
      const {web3, match} = this.props

      const {id} = match.params
      if (txHash.length === 0) return null;
      const res = await confirmTransferDetails(txHash, id, web3, 9);
      return res;
    } catch(e) {
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
        return transactionObjects
      }).then(transactionObjects => {
        // 
        const totalSum = transactionObjects.reduce((acc, tx) => acc + tx.amount.toNumber(), 0)
        this.setState({totalSum})
      })
    }
  };

  handleSubmit = evt => {
    evt.preventDefault ();
    const {transactionObjects} = this.state;

    const txAddresses = transactionObjects.map(tx => tx.transactionHash)
    const amounts = transactionObjects.map(tx => tx.amount.toNumber() * Math.pow(10, 18));
    const participants = transactionObjects.map(tx => tx.fromAddress)

    console.log('handling request transfers --->', txAddresses, amounts, participants)

    this.props.onRequestTransfers (amounts, txAddresses, participants);
  };


  render () {
    const {id} = this.props.match.params
    const {transactionObjects} = this.state;
    return (
      <div className="pure-u-1-1">
        <h1>Claim SHOPIN Tokens</h1>
        <p>
          In order to receive SHOPIN Tokens, you'll need to send your SHOP Tokens to the following Ethereum address:
        </p>

        <p>
          <code>
            {id}
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
          placeholder="Enter your transaction hashes separated by newlines"
        />
        </div>
        <div className="pure-u-1-1">
        <input
            value={`Submit ${transactionObjects.length} SHOPIN Token requests`}
            type="submit"
            disabled={this.state.amount === 0 || transactionObjects.length === 0}
            className="pure-button"
          />
        </div>
        </form>

        <div className="pure-u-1-1">
          <p>Total tokens requested: {new BigNumber(this.state.totalSum).toNumber()}</p>
        </div>

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
