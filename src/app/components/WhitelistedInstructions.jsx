import React from 'react';
import {Link} from 'react-router-dom';

const CreateContractInstance = ({checkWhitelisted, accounts, onCreate}) => (
  <div className="pure-u-1-1">
    <h3>Deploy your collection contract</h3>
    <p>
      By deploying a smart contract for your syndicate your investors can particpate in the Shopin Token swap.
    </p>
    <button
      className="pure-button"
      onClick={onCreate}>
        Deploy Swap Contract
    </button>
    <button disabled
      className="pure-button"
      style={{marginLeft: '15px'}}
      onClick={onCreate}>
        Swap Tokens
    </button>
    <h3>Your account</h3>
    <code>{accounts[0]}</code>
  </div>
);

const ExistingInstance = ({instanceId, onExecuteTransfers, hasInstance, isReady}) => (
  <div className="pure-u-1-1">
    <h2>You have an instance</h2>
    <p>Send your investors to the following address</p>
    <pre>
      <code>
        <Link to={`/${instanceId}`}>
          /{instanceId}
        </Link>
      </code>
    </pre>
    <button
      disabled={!isReady}
      className="pure-button swap-button">
        Swap Tokens
    </button>
  </div>
);

export class WhitelistedInstructions extends React.Component {
  constructor (props) {
    super (props);

    this.state = {
      ready: false,
      hasInstance: false,
    };
  }

  componentWillMount() {
    this.contractNameExists()
    this.props.controller.swapEnabled().then(b => this.setState({swapEnabled: b}))
  }

  contractNameExists = async () => {
    const {accounts, factory} = this.props;

    factory
      .contractByNameExists (accounts[0])
      .then (value => value)
      .catch (() => false)
      .then (hasInstance =>
        this.setState ({
          ready: true,
          hasInstance,
        })
      );
  };

  afterContractCreation = async () => {
    await this.contractNameExists();
    if (!this.state.hasInstance) {
      setTimeout (this.afterContractCreation, 1000);
    }
  };

  onCreateInstance = async evt => {
    evt.preventDefault ();
    const {accounts, factory} = this.props;
    await factory.insertContract (`${accounts[0]}`, {from: accounts[0]});
    await this.afterContractCreation ();
  };

  onExecuteTransfers = async (evt) => {
    evt.preventDefault()
    const contract = this.props.SwapContract.at(this.state.contractAddress)
    await contract.executeTranser()
  }

  render() {
    const {accounts} = this.props;

    return (
      <div className="App">
        <div className="pure-g">
          <div className="pure-u-1-1">
            {
              this.state.hasInstance ?
                <ExistingInstance
                  instanceId={accounts[0]}
                  onExecuteTransfers={this.onExecuteTransfers}
                  hasInstance={this.props.hasInstance}
                  isReady={this.props.isReady} /> :
                <CreateContractInstance
                  accounts={accounts}
                  checkWhitelisted={this.props.checkWhitelisted}
                  onCreate={this.onCreateInstance}
                />}
          </div>
        </div>
      </div>
    );
  }
}

export default WhitelistedInstructions;
