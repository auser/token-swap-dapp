import React from 'react';
import {Link} from 'react-router-dom';

// import Checkmark from '../../components/Checkmark'

const CreateContractInstance = ({checkWhitelisted, error, deploying, accounts, onCreate}) => (
  <div className="pure-u-1-1">
    <h3>Deploy a contract for your syndicate</h3>
    <p>
      Deploy a Token Swap Smart Contract for your syndicate to enable members
      of your group to claim their SHOPIN Tokens. After deploying your unique swap
      contract, make sure to share your unique URL so that members of your group
      can claim their new SHOPIN Tokens.
    </p>
    {deploying && !error ?
      <span>Deploying</span> :
      <button
      className="pure-button"
      disabled={deploying && !error}
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

const ExistingInstance = ({instanceId, onExecuteTransfers, hasInstance, canWeSwap, handleSwap, swapping, swapped, pendingTransferRequestCount}) => (
  <div className="pure-u-1-1">
    <h2>Token Swap Contract deployed</h2>
    <p>
      Please ensure that members of your group visit your
      unique <Link to={`/${instanceId}`}>DApp URL</Link> to claim their
      SHOPIN Tokens. After verifying the return of your syndicate
      participants’ SHOP Tokens, Shopin will enable the distribution
      of SHOPIN Tokens to your group.
    </p>
    <p>
      Thank you for your patience while we verify transactions and ensure the
      integrity of the Shopin community.
    </p>

    <h3>Link for your syndicate:</h3>
    <code>
      <Link to={`/${instanceId}`}>
        { `${location.protocol}//${location.hostname}/${instanceId}` }
      </Link>
    </code>

    <h3>Distribute SHOPIN Tokens:</h3>
    <button
      disabled={pendingTransferRequestCount <= 0 || !canWeSwap || swapping}
      onClick={onExecuteTransfers}
      className="pure-button swap-button">
        Swap {pendingTransferRequestCount} Tokens
    </button>
    {swapped && <div>Success</div>}
  </div>
);

export class WhitelistedInstructions extends React.Component {
  constructor (props) {
    super (props);

    this.state = {
      ready: false,
      hasInstance: false,
      deploying: false,
      canWeSwap: false,
      contractAddress: '',
      swapping: false,
      swapped: false
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
      .then (hasInstance => {
        this.setState ({
          ready: true,
          hasInstance,
          deploying: false
        })
      }
      ).then(async () => {
        try {
          const addr = await this.getContractAddress()
          this.setState({
            contractAddress: addr
          })
        } catch (e) {}
      }).then(this.canWeSwap)
      .then(this.getNumberOfPendingTransferRequests)
  };

  canWeSwap = () => {
    const {controller, accounts} = this.props;

    controller.canSwap(accounts[0])
    .then(b => {
      this.setState({
        canWeSwap: b
      })
    }).catch(() => {
      this.setState({
        canWeSwap: false
      })
    })
  }

  getNumberOfPendingTransferRequests = async () => {
    const contract = await this.getContract()
    const count = await contract.getTransferRequestCount()
    let promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(contract.getTransferRequestCompleted(i))
    }
    const res = await Promise.all(promises)
    // only count incomplete swaps
    const sum = res.reduce((acc, complete) => complete ? acc : acc + 1, 0)
    this.setState({
      pendingTransferRequestCount: sum
    })
  }

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
      try {

      await factory.insertContract (`${accounts[0]}`, {from: accounts[0]});
      await this.afterContractCreation ();
      } catch (e) {
        this.setState({
          error: e
        })
      }
    })
  };

  getContractAddress = async () => {
    const {accounts, factory} = this.props
    const [found, swapIdx] = await this.props.factory.contractIndexForName(accounts[0]) // eslint-disable-line no-unused-vars

    const [name, swapAddr, idx] = await factory.getContractAtIndex(swapIdx) // eslint-disable-line no-unused-vars
    return swapAddr
  }

  getContract = async () => {
    const swapAddr = await this.getContractAddress()
    const contract = await this.props.SwapContract.at(swapAddr)
    return contract;
  }

  onExecuteTransfers = async (evt) => {
    evt.preventDefault()
    this.setState({
      swapped: false,
      swapping: true
    }, async () => {
      const {accounts} = this.props;
      const contract = await this.getContract()
      await contract.executeTransfers({from: accounts[0]})
      this.setState({
        swapped: true,
        swapping: false
      }, async () => {
        await this.getNumberOfPendingTransferRequests()
      })
    })
  }

  render() {
    const {accounts} = this.props;
    const {canWeSwap, swapping, swapped, pendingTransferRequestCount} = this.state;

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
                  swapping={swapping}
                  swapped={swapped}
                  pendingTransferRequestCount={pendingTransferRequestCount}
                  canWeSwap={canWeSwap} /> :
                <CreateContractInstance
                  accounts={accounts}
                  checkWhitelisted={this.props.checkWhitelisted}
                  onCreate={this.onCreateInstance}
                  deploying={this.state.deploying}
                  error={this.state.error}
                />}
          </div>
        </div>
      </div>
    );
  }
}

export default WhitelistedInstructions;
