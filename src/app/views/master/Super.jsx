import React from 'react';
import Promise from 'bluebird'

import Checkmark from '../../components/Checkmark'

const TokenFactoryContract = ({contractAddr, transferRequests}) => {
  const total = transferRequests.reduce((acc, tr) => acc + tr.completed ? 0 : tr.amount.toNumber(), 0)
  return (
    <div className='pure-u-1-1'>
      <h4>Syndicate address: {contractAddr}</h4>
      <h4>Pending tokens tokens requested: {total}</h4>
      <table className='pure-table pure-table-bordered'>
      <thead>
        <tr>
          <th>Requester</th>
          <th>Amount</th>
          <th>Original token balance</th>
          <th>New token balance</th>
          <th>Completed</th>
        </tr>
      </thead>
      <tbody>
        {transferRequests.map((tr, idx) => {
          return (
            <tr 
              key={tr.index}
              className={["pure-row", idx % 2 === 1 && 'pure-row-odd'].join(' ')}>
              <td>{tr.investor}</td>
              <td>{tr.amount.toNumber()}</td>
              <td>{tr.originalTokenBalance.toNumber() / (10 ** 9)}</td>
              <td>{tr.newTokenBalance.toNumber() / 10 ** 9}</td>
              <td>{tr.completed && <Checkmark />}</td>
            </tr>
          )
        })}
      </tbody>
      </table>
    </div>
  )
}

export class Super extends React.Component {
  constructor (props) {
    super (props);

    this.state = {
      tokenFactoryContracts: {},
      tokenFactoryTransferRequests: {},
      tokenFactoryAddressCount: 0,
    };
  }

  isOwner = async () => {
    const {accounts, controller, history} = this.props;
    const owner = await controller.owner();

    if (accounts[0] !== owner) {
      history.replace('/')
      // console.log('RENABLE isOwner in Super view')
    }
  }

  componentDidMount () {
    this.isOwner().then(() => {
      this.updateTokenFactories()
    })
  }

  updateTokenFactories = async () => {
    const {factory} = this.props;

    const count = await factory.getContractCount ();
    this.setState ({
      tokenFactoryAddressCount: count.toNumber (),
    }, this.listFactoryContracts);
  };

  listFactoryContracts = async () => {
    const {factory, SwapContract} = this.props;
    const {tokenFactoryAddressCount} = this.state;

    let tokenFactoryContracts = {}
    for (let i = 0; i < tokenFactoryAddressCount; i++ ) {
      const [name, address, _] = await factory.getContractAtIndex(i);
      const contract = await SwapContract.at(address)
      tokenFactoryContracts[name] = contract
    }
    this.setState({
      tokenFactoryContracts
    }, () => {
      this.listAllSwapContractTransferRequests()
    })
  }

  listAllSwapContractTransferRequests = async () => {
    let swapContractTransferRequests = await Promise.reduce(Object.keys(this.state.tokenFactoryContracts), (async (acc, addr) => {
        const obj = await this.listSwapContractTransferRequests(addr)
        return {
          ...acc,
          [addr]: obj
        }
      }), {})
    this.setState({tokenFactoryTransferRequests: swapContractTransferRequests})
  }

  listSwapContractTransferRequests = async (address) => {
    const {newToken, token} = this.props
    const {tokenFactoryContracts} = this.state;
    const contract = tokenFactoryContracts[address]
    const trCountBigNumber = await contract.getTransferRequestCount()
    const trCount = trCountBigNumber.toNumber()
    let promises = []
    for (let i = 0; i < trCount; i++) {
      promises.push(new Promise(async (resolve, reject) => {

      // fetch transfer request
      try {
        const [investor, amount, completed] = await Promise.all([
          contract.getTransferRequestInvestor(i),
          contract.getTransferRequestAmount(i),
          contract.getTransferRequestCompleted(i),
        ])
        const [origBalance, newBalance] = await Promise.all([
          token.balanceOf(investor),
          newToken.balanceOf(investor),
        ])
        resolve({
          index: i,
          investor, amount, completed,
          originalTokenBalance: origBalance,
          newTokenBalance: newBalance,
        })
      } catch (e) {
        reject(e)
      }
      }))
    }
    return Promise.all(promises)
    .then(res => {
      return res.filter(i => !!i);
    })
    .catch(err => {
      console.log('error occurred', err)
      this.setState({error: err})
    })
  }

  render () {
    const {tokenFactoryAddressCount, tokenFactoryTransferRequests} = this.state;

    return (
      <div className="super master">
        <button onClick={this.updateTokenFactories}>
          Refresh token factories
        </button>
        <h1>Number of contracts {tokenFactoryAddressCount}</h1>
        {Object.keys(tokenFactoryTransferRequests).map(contractAddr => {
          return (
            <TokenFactoryContract 
              key={contractAddr}
              contractAddr={contractAddr}
              transferRequests={tokenFactoryTransferRequests[contractAddr]} />
          )
        })}
        
      </div>
    );
  }
}

export default Super;
