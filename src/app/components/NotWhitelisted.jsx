import React from 'react';

export class WhitelistedInstructions extends React.Component {
  render () {
    return (
      <div className="App">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Welcome</h1>
            <p>
              If you are a syndicate lead, please ensure that your active
              address in MetaMask is whitelisted and that it is connected to Mainnet.
            </p>

            <p>
              If you are a member of a syndicate, contact your group for
              instructions on how to claim your new SHOPIN Tokens.
            </p>

            <button
              className="pure-button"
              disabled={this.props.checkingIfWhitelisted}
              onClick={this.props.checkWhitelisted}>
              {this.props.checkingIfWhitelisted ? 'Checking...' : 'Check account'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default WhitelistedInstructions;
