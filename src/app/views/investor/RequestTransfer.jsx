import React from 'react';

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
    const {web3, token} = this.props;
    this.setState ({transactionHash: value}, () => {
      web3.eth.getTransactionReceipt (value, (err, obj) => {
        if (obj) {
          token.Transfer (
            {},
            {
              fromBlock: obj.blockNumber,
              toBlock: obj.blockNumber + 1,
            },
            (err, res) => {
              if (!err) {
                const {args} = res;
                const fromAddress = args.from;
                const amount = args.value.toNumber ();
                this.setState ({amount, fromAddress, transactionHash: value});
              }
            }
          );
        } else {
          this.setState ({amount: 0});
        }
      });
    });
  };

  render () {
    return (
      <div className="pure-u-1-1">
        <h1>Request a token transfer</h1>
        <p>
          In order to receive SHOPIN tokens, you'll need to send your SHOP tokens to the following Ethereum address:
        </p>

        <p>
          <code>
            {this.props.accounts[0]}
          </code>
        </p>

        <p>
          Fill in your transaction hash from the transfer of your SHOP tokens here:
        </p>

        <div className="pure-u-1-1">
          <form onSubmit={this.handleSubmit}>
            <div className="pure-u-1-1">
              <input
                onChange={this.onUpdated}
                ref={r => (this.inputRef = r)}
                style={{width: '100%', padding: 10}}
                placeholder={'Your transaction hash, i.e. 0x...'}
              />
            </div>

            <p>
              <input
                value={`Claim ${this.state.amount} SHOPIN tokens`}
                type="submit"
                disabled={this.state.amount === 0}
                className="pure-button"
              />
            </p>
          </form>
        </div>
      </div>
    );
  }
}

export default RequestTransfer;
