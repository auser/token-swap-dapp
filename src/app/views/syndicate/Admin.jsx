import React from 'react'

export class Admin extends React.Component {
  constructor(props) {
    super(props);

    this.contract = null

    this.state = {
      loaded: false,
      transferRequestCount: 0,
      transferRequests: []
    }
  }

  isOwnerViewing = async () => {
    const {match, history, accounts, factory, SwapContract} = this.props;
    const {id} = match.params;

    const [found, contractId] = await factory.contractIndexForName(id)
    if (!found) {
      // TODO: redirect away
      return history.replace(`/${id}`)
    }
    const resp = await factory.getContractAtIndex(contractId);
    const contract = SwapContract.at(resp[1])
    this.contract = contract
    const owner = await contract.getTokenOwnerAddress()
    let valid = accounts[0] === owner;

    if (!valid) {
      console.log('not valid...')
      return history.replace(`/${id}`)
    }
    this.setState({
      loaded: true
    })
  }

  handleUpdate = async () => {
    const count = await this.contract.getTransferRequestCount()
    let requests = []
    for (let i = 0; i < count; i++) {
      const values = await Promise.all([
        this.contract.getTransferRequestInvestor(i),
        this.contract.getTransferRequestAmount(i),
      ])
      const tr = {
        index: i,
        participant: values[0],
        amount: values[1].toNumber()
      }
      requests.push(tr);
    }
    this.setState({
      transferRequestCount: count,
      transferRequests: requests
    })
  }

  componentDidMount() {
    // Handle redirecting if not owner
    this.isOwnerViewing()
    // this.handleUpdate();
  }

  render() {
    const {transferRequests} = this.state;

    return (
      <div className="admin">
        <div className="pure-g">
          <div className="pure-u-1-2">
            <h1>Admin page</h1>
          </div>
          <div className="pure-u-1-2">
            <button
              className="pure-button"
              onClick={this.handleUpdate}
            >Reload requests</button>
          </div>
        </div>

        <div className="pure-u-1-1">
          <table className="pure-table">
            <thead>
              <tr>
                <th>Request number</th>
                <th>Particpant</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
            
            {transferRequests.map(tr => {
              return (
                <tr key={tr.index}>
                  <td>{tr.index}</td>
                  <td>{tr.participant}</td>
                  <td>{tr.amount}</td>
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Admin