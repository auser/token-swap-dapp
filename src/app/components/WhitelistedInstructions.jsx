import React from 'react'
import {Link} from 'react-router-dom'

const CreateContractInstance = ({onCreate}) => (
  <div className="pure-u-1-1">
    <p>By deploying a smart contract for your syndicate your investors can particpate in the Shopin Token swap.</p>
    <button className="pure-button" onClick={onCreate}>Deploy Swap Contract</button>
  </div>
)

const ExistingInstance = ({instanceId}) => (
  <div className="pure-u-1-1">
    <h2>You have an instance</h2>
    <p>Send your investors to the following address</p>
    <pre><code>
      <Link to={`/investor/${instanceId}`}>
        /investor/${instanceId}
      </Link>
    </code></pre>
  </div>
)

export class WhitelistedInstructions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      hasInstance: false
    }
  }

  componentWillMount() {
    this.contractNameExists()
  }

  contractNameExists = async () => {
    const {accounts, factory} = this.props;

    factory.contractByNameExists(accounts[0])
    .then(value => value)
    .catch(() => false)
    .then(hasInstance => this.setState({
      ready: true,
      hasInstance
    }))
  }

  onCreateInstance = async () => {
    const {accounts, factory} = this.props;
    await factory.insertContract(`${accounts[0]}`, {from: accounts[0]})
    await this.contractNameExists()
  }

  render() {
    const {accounts} = this.props;

    return (
      <div className="App">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <p>Welcome to the Shopin Token Swap Dapp.</p>
            {
              this.state.hasInstance ?
                <ExistingInstance instanceId={accounts[0]} /> :
                <CreateContractInstance onCreate={this.onCreateInstance} />
            }
          </div>
        </div>
      </div>
    )
  }
}

export default WhitelistedInstructions
