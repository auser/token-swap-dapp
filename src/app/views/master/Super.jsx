import React from 'react';
import {Link} from 'react-router-dom';
import Promise from 'bluebird';

import Checkmark from '../../components/Checkmark';

const TokenFactoryContract = ({
  tokenBalance,
  tokenContract,
  deployedContractAddr,
  contractAddr,
  updateTokenRequests,
}) => {
  const transferRequests = tokenContract ? tokenContract.transferRequests : [];
  const balances = !!tokenContract ? tokenContract.balances : 0;
  const total = transferRequests.reduce ((acc, tr) => {
    const newAmount = tr.completed ? 0 : tr.amount.toNumber ();
    return acc + newAmount;
  }, 0);

  console.log ('tokenContract ---->', tokenContract);
  return (
    <div className="pure-u-1-1">
      <h4>
        Syndicate address: <Link to={`/${contractAddr}`}>{contractAddr}</Link>
      </h4>
      <h4>Contract address: {deployedContractAddr}</h4>
      <h4>Pending tokens tokens requested: {total / Math.pow (10, 18)}</h4>
      <h4>
        New token current balance:
        {' '}
        {(balances ? balances.toNumber () : 0).toLocaleString ()}
      </h4>
      <button className="pure-btn" onClick={updateTokenRequests}>Update</button>
      <table className="pure-table pure-table-bordered">
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
          {transferRequests.map ((tr, idx) => {
            return (
              <tr
                key={tr.index}
                className={['pure-row', idx % 2 === 1 && 'pure-row-odd'].join (
                  ' '
                )}
              >
                <td>{tr.investor}</td>
                <td>{tr.amount.toNumber () / Math.pow (10, 18)}</td>
                <td>{tr.originalTokenBalance.toNumber ()}</td>
                <td>
                  {tr.newTokenBalance.toNumber ().toLocaleString ()}
                </td>
                <td className="checkbox">{tr.completed && <Checkmark />}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export class Super extends React.Component {
  constructor (props) {
    super (props);

    this.filters = [];

    this.state = {
      tokenFactoryContracts: {},
      tokenFactoryTransferRequests: {},
      tokenBalances: {},
      tokenFactoryAddressCount: 0,
    };
  }

  isOwner = async () => {
    const {accounts, controller, history} = this.props;
    const owner = await controller.owner ();

    if (accounts[0] !== owner) {
      history.replace ('/');
      // console.log('RENABLE isOwner in Super view')
    }
  };

  componentDidMount () {
    this.timeoutId = setTimeout (() => {
      this.isOwner ().then (this.updateTokenFactories);
    });
  }

  componentWillUnmount () {
    if (this.timeoutId) clearTimeout (this.timeoutId);

    this.filters.forEach (f => f.stopWatching ());
  }

  updateTokenFactories = async () => {
    const {factory} = this.props;

    const count = await factory.getContractCount ();
    this.setState (
      {
        tokenFactoryAddressCount: count.toNumber (),
      },
      () => this.listFactoryContracts ()
    );
  };

  // .then (this.getBalancesForContracts)
  listFactoryContracts = async () => {
    const {factory} = this.props;
    const {tokenFactoryAddressCount} = this.state;

    let tokenFactoryContracts = {};
    for (let i = 0; i < tokenFactoryAddressCount; i++) {
      const [name, address, _] = await factory.getContractAtIndex (i);
      tokenFactoryContracts[name] = address;
    }
    this.setState (
      {
        tokenFactoryContracts,
      },
      () => {
        // this.listAllSwapContractTransferRequests ();
      }
    );
  };

  getBalancesForContracts = async () => {
    const {tokenFactoryContracts} = this.state;

    Promise.reduce (
      Object.keys (tokenFactoryContracts),
      async (acc, name) => {
        const balance = await this.getBalancesForContract (
          tokenFactoryContracts[name]
        );
        return {
          ...acc,
          [name]: balance,
        };
      },
      {}
    ).then (tokenBalances => {
      this.setState ({
        tokenBalances,
      });
    });
  };

  getBalancesForContract = async name => {
    const {tokenFactoryContracts} = this.state;
    const {newToken} = this.props;
    const balance = await newToken.balanceOf (tokenFactoryContracts[name]);
    return balance;
  };

  listAllSwapContractTransferRequests = async () => {
    try {
      const {tokenFactoryContracts} = this.state;
      let swapContractTransferRequests = await Promise.reduce (
        Object.keys (tokenFactoryContracts),
        async (acc, addr) => {
          const obj = await this.listSwapContractTransferRequests (
            tokenFactoryContracts[addr]
          );
          return {
            ...acc,
            [addr]: obj,
          };
        },
        {}
      );
      this.setState ({
        tokenFactoryTransferRequests: swapContractTransferRequests,
      });
    } catch (e) {
      console.log ('error ->', e);
    }
  };

  updateTokenRequests = async addr => {
    console.log ('addr ->', addr);
    const {tokenFactoryContracts, tokenFactoryTransferRequests} = this.state;
    Promise.all ([
      this.listSwapContractTransferRequests (tokenFactoryContracts[addr]),
      this.getBalancesForContract (addr),
    ]).then (([a, b]) => {
      const newTokenFactoryTransferRequests = {
        ...tokenFactoryTransferRequests,
        [addr]: {
          transferRequests: a,
          balances: b,
        },
      };
      this.setState ({
        tokenFactoryTransferRequests: newTokenFactoryTransferRequests,
      });
    });
  };

  // UNUSED for now
  watchForParticipants = address => {
    const {token} = this.props;
    return token
      .Transfer ({fromBlock: 0, toBlock: 'latest'}, () => {})
      .watch ((err, res) => {
        if (!err && !!res) {
          console.log ('watch callback', err, res);
        }
      });
  };

  listSwapContractTransferRequests = async address => {
    const {newToken, token, SwapContract, accounts} = this.props;
    /* const {tokenFactoryContracts} = this.state; */

    const contract = await SwapContract.at (address);
    const trCountBigNumber = await contract.getTransferRequestCount ({
      from: accounts[0],
    });
    const trCount = trCountBigNumber.toNumber ();
    let promises = [];
    /* this.filters.push(this.watchForParticipants(address)) */
    for (let i = 0; i < trCount; i++) {
      promises.push (
        new Promise (async (resolve, reject) => {
          // fetch transfer request
          try {
            const [investor, amount, completed] = await Promise.all ([
              contract.getTransferRequestInvestor (i, {from: accounts[0]}),
              contract.getTransferRequestAmount (i, {from: accounts[0]}),
              contract.getTransferRequestCompleted (i, {from: accounts[0]}),
            ]);
            const [origBalance, newBalance] = await Promise.all ([
              token.balanceOf (investor, {from: accounts[0]}),
              newToken.balanceOf (investor, {from: accounts[0]}),
            ]);
            resolve ({
              index: i,
              investor,
              amount,
              completed,
              originalTokenBalance: origBalance,
              newTokenBalance: newBalance,
            });
          } catch (e) {
            console.log ('error in listSwapContractTransferRequests ->', e);
            reject (e);
          }
        })
      );
    }
    return Promise.all (promises)
      .then (res => {
        return res.filter (i => !!i);
      })
      .catch (err => {
        console.log ('error occurred', err);
        this.setState ({error: err});
      });
  };

  render () {
    const {
      tokenBalances,
      tokenFactoryContracts,
      tokenFactoryAddressCount,
      tokenFactoryTransferRequests,
    } = this.state;

    return (
      <div className="super master">
        <button onClick={this.updateTokenFactories}>
          Refresh token factories
        </button>
        <h1>Number of contracts {tokenFactoryAddressCount}</h1>
        {Object.keys (tokenFactoryContracts).map (contractAddr => {
          return (
            <TokenFactoryContract
              key={contractAddr}
              contractAddr={contractAddr}
              deployedContractAddr={tokenFactoryContracts[contractAddr]}
              tokenBalance={tokenBalances[contractAddr]}
              updateTokenRequests={() =>
                this.updateTokenRequests (contractAddr)}
              tokenContract={tokenFactoryTransferRequests[contractAddr]}
            />
          );
        })}

      </div>
    );
  }
}

export default Super;
