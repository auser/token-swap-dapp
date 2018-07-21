import React from 'react';
import util from 'ethereumjs-util'

window.util = util

export class RequestTransfer extends React.Component {
  constructor (props) {
    super (props);

    this.state = {
      transactionHash: '',
      amount: 0,
      fromAddress: null,
      toAddress: null,
    };
  }

  handleSubmit = evt => {
    evt.preventDefault ();
    this.props.onRequestTransfer (this.state);
  };

  onUpdated = evt => {
    const value = evt.target.value;
    const {web3, submitToAddress} = this.props;
    this.setState ({transactionHash: value}, () => {
      web3.eth.getTransaction(value, (err, hash) => {
        if (hash) {
          const input = hash.input;
          const fromAddress = hash.from
          const evtSha = web3.sha3('transfer(address,uint256)')
          const callingFn = input.slice(2, 10)
          const evtShaFirst = evtSha.slice(2, 10)

          // If the transfer function was called
          if (callingFn === evtShaFirst) {
            // const fromAddress = hash.from
            const toHex = new Buffer(input.slice(11, 75), 'hex')
            const toAddress = util.bufferToHex(toHex)
            if (toAddress.indexOf(submitToAddress.slice(2)) >= 0) {
            const valueHex = new Buffer(input.slice(-8), 'hex')
            const amount = util.bufferToInt(valueHex)

            this.setState ({amount, fromAddress, transactionHash: value});
            } else {
              this.setState({amount: 0})
            }
          } else {
            this.setState({amount: 0})
          }
        } else {
          this.setState({amount: 0})
        }
      })
    });
  };

  render () {
    const {submitToAddress} = this.props;

    return (
      <div className="pure-u-1-1">
        <h1>Claim SHOPIN Tokens</h1>
        <p>
          In order to receive SHOPIN Tokens, you'll need to send your SHOP Tokens to the following Ethereum address:
        </p>

        <p>
          <code>
            {submitToAddress}
          </code>
        </p>

        <p>
          Fill in your transaction hash from the transfer of your SHOP Tokens here:
        </p>

        <form className="pure-form" onSubmit={this.handleSubmit}>
          <p>
            <input
              onChange={this.onUpdated}
              ref={r => (this.inputRef = r)}
              style={{width: '100%', padding: 10}}
              placeholder={'Your transaction hash, i.e. 0x...'}
            />
          </p>

          <p>
            <button
              className="pure-button"
              type="submit"
              disabled={this.state.amount === 0}
            >
              Claim {this.state.amount} SHOPIN Tokens
            </button>
          </p>
        </form>
      </div>
    );
  }
}

export default RequestTransfer;
