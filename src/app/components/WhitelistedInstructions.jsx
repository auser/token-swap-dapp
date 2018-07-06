import React from 'react'

const CreateContractInstance = ({onCreate}) => (
  <div className="pure-u-1-1">
    <h1>Create an instance here</h1>
    <button onClick={onCreate}>Create an instance</button>
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
    this.contractNameExists()
  }

  render() {
    return (
      <div className="App">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Welcome to the token swap</h1>
            {
              this.state.hasInstance ?
                <p>You have an instance already</p> :
                <CreateContractInstance onCreate={this.onCreateInstance} />
            }
          </div>
        </div>
      </div>
    )
  }
}

export default WhitelistedInstructions