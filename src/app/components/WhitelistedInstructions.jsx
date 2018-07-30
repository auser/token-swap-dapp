import React from 'react';
import BigNumber from 'bignumber.js'

// import Checkmark from '../../components/Checkmark'
//import confirmFor from '../../utils/requireConfirmations'
import Error from '../components/Error'

const CreateContractInstance = ({checkWhitelisted, error, deploying, accounts, onCreate}) => (
  <div className="pure-u-1-1">
    <h3>Step 1. Deploy a contract for your syndicate</h3>
    <p>
      Deploy a Token Swap Smart Contract for your syndicate to enable members
      of your group to claim their SHOPIN Tokens. After deploying your unique swap
      contract, please ask your syndicate members to send their SHOP tokens to your Ethereum address displayed below:
    </p>
      <button
      className="pure-button"
      disabled={deploying && !error}
      onClick={onCreate}>
      {deploying ? 'Deploying...' : 'Deploy Swap Contract'}
      </button>
      {
        error && <Error error={error} />
      }

    <h3>Step 2. Your Ethereum address</h3>
    <p>Send this Ethereum address to your syndicate members asking them to return their SHOP tokens to this address:</p>
    <code>{accounts[0]}</code>
  </div>
);

const ExistingInstance = ({instanceId, onExecuteTransfers, hasInstance, canWeSwap, handleSwap, swapping, swapped, pendingTransferRequestCount}) => (
  <div className="pure-u-1-1">
    <h2>Token Swap Contract deployed</h2>
    <p>
      Please ensure that members of your group send their SHOP tokens to the following address to claim their SHOPIN Tokens.
Once Shopin has received the SHOP tokens, Shopin will enable the automatic distribution of the SHOPIN tokens below.
    </p>
    <p>
      Thank you for your patience while we verify transactions and ensure the
      integrity of the Shopin community.
    </p>

    <h3>Ask your participants to send their SHOP tokens to the following address:</h3>
    <code>
      {instanceId}
          </code>

      <h3>Step 3. Distribute SHOPIN Tokens:</h3>
          <p>Once Shopin has received the SHOP tokens and verified the new transactions are valid, we'll contact you via email and let you know SHOPIN tokens are ready to be distributed.</p>
    <p>Once all of your SHOP tokens have been collected, we'll send you the new SHOPIN tokens and the button below will be enabled:</p>
    <button
      disabled={pendingTransferRequestCount <= 0 || !canWeSwap || swapping}
      onClick={onExecuteTransfers}
      className="pure-button swap-button">
        Execute {pendingTransferRequestCount} swap requests
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
      .then (hasInstance => {
        this.setState ({
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
          return addr
        } catch (e) {}
      }).then(this.canWeSwap)
      .then(this.getNumberOfPendingTransferRequests)
      .catch (() => false);
  };

  getTotalAmountRequested = async (acc) => {
    const contract = await this.getContract()
    const count = await contract.getTransferRequestCount({from: acc});
    let sum = 0;
    for (let i = 0; i < count; i++) {
      try {
        const amountRequested = await contract.getTransferRequestAmount(i, {from: acc})
        sum += amountRequested.toNumber();
      } catch (e) {
        console.log('e ->', e)
      }
    }

    return new BigNumber(sum.toPrecision(16));
  }

  canWeSwap = (contractAddr) => {
    const {newToken, controller, accounts} = this.props;

    Promise.all([
      controller.canSwap(accounts[0], {from: accounts[0]}),
      newToken.balanceOf(contractAddr, {from: accounts[0]}),
      this.getTotalAmountRequested(accounts[0])
    ]).then(([canSwap, balance, totalRequested]) => {
      let b = (canSwap && new BigNumber(balance).toPrecision(16) >= totalRequested);
      this.setState({ready: true, canWeSwap: b})
    }).catch(() => {
      this.setState({
        canWeSwap: false,
        ready: true,
      })
    })
  }

  getNumberOfPendingTransferRequests = async () => {
    const {accounts} = this.props;
    const contract = await this.getContract()
    const count = await contract.getTransferRequestCount({from: accounts[0]})
    let promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(contract.getTransferRequestCompleted(i, {from: accounts[0]}))
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
      deploying: true,
      error: null
    }, async () => {
      try {

      await factory.insertContract (accounts[0], {from: accounts[0]});
        /* await confirmFor(res.transactionHash, web3, 2) */
      await this.afterContractCreation ();
      } catch (e) {
        this.setState({
          deploying: false,
          error: e
        })
      }
    })
  };

  getContractAddress = async () => {
    const {accounts, factory} = this.props
    const [found, swapIdx] = await this.props.factory.contractIndexForName(accounts[0]) // eslint-disable-line no-unused-vars

    const [name, swapAddr, idx] = await factory.getContractAtIndex(swapIdx) // eslint-disable-line no-unused-vars
    this.setState({
contractAddress: swapAddr
    })
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
