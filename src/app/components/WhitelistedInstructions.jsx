import React from 'react';
import {Link} from 'react-router-dom';

const CreateContractInstance = ({checkWhitelisted, deploying, accounts, onCreate}) => (
  <div className="pure-u-1-1">
    <h3>Deploy a contract for your syndicate</h3>
    <p>
      Deploy a Token Swap Smart Contract for your syndicate to enable members
      of your group to claim their SHOPIN tokens. After deploying your unique swap
      contract, make sure to share your unique URL so that members of your group
      can claim their new SHOPIN Tokens.
    </p>
    {deploying ?
      <span>Deploying</span> :
      <button
      className="pure-button"
      disabled={deploying}
      onClick={onCreate}>
      Deploy Swap Contract
      </button>
    }
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
    <h2>Token swap contract deployed</h2>

    <p>
      Please ensure that members of your group visit your unique
      <Link to={`/${instanceId}`}>DApp URL</Link> to claim their
      SHOPIN Tokens. After verifying the return of your syndicate
      participants’ SHOP tokens, Shopin will enable the distribution
      of SHOPIN Tokens to your group.
    </p>
    <p>
      Thank you for your patience while we verify transactions and ensure the
      integrity of the Shopin community.
    </p>

    <h3>Link for your syndicate:</h3>
    <code>
      <Link to={`/${instanceId}`}>
        https://swap.shopin.com/{instanceId}
      </Link>
    </code>

    <h3>Distribute SHOPIN tokens:</h3>
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
      deploying: false
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
          deploying: false
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
    this.setState({
      deploying: true
    }, async () => {
      await factory.insertContract (`${accounts[0]}`, {from: accounts[0]});
      await this.afterContractCreation ();
    })
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
                  deploying={this.state.deploying}
                />}
          </div>
        </div>
      </div>
    );
  }
}

export default WhitelistedInstructions;
