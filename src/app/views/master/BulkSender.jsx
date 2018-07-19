import React from 'react';
import CSVReader from 'react-csv-reader';
import isControllerOwner from '../../hocs/isControllerOwner';
import BigNumber from 'bignumber.js';
import Promise from 'bluebird';

// const dummyData = {
// '0x6bb323e5f348bfdb041efbc6e528a4493f1fba1d': 42100,
// '0xc2245cd9f6cb71858be9412bcaa2e8d7d2656b6f': 20393444,
// '0x44e0aa002e3d9491a879f1b472d8f66de8f7195f': 977336,
// '0x2c191947c8583d7dbf47a470a51aee9cf8e8b1a5': 15171,
// '0x4a466600029457f87aa25c56dd30b16056ae983e': 835,
// '0x22212bbbc23002f5500ec17f2b142aec98b9a3f3': 239,
// '0x45ba7667b903c9b039c332e8b7b0c0be9f489e13': 350100,
// '0xa6ca5b7a4064f5ecb3c60322c3af0f845b5b381a': 350100,
// };

function calculateAmount (amount) {
  return new BigNumber (amount) * 10 ** 18;
}

const ProcessingTransactions = ({processingTransactions, currentBalances}) => {
  return (
    <div className="processing">
      <h1>Processing</h1>
      <table className="pure-table processing-table">
        <thead>
          <tr>
            <th>Address</th>
            <th>etherscan address</th>
            <th>etherscan tx</th>
            <th>Amount sending</th>
            <th>current balance</th>
            <th>confirmations</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys (processingTransactions).map (rawKey => {
            const key = rawKey.toLowerCase ();
            const {logs, confirmations} = processingTransactions[rawKey];
            const log = logs[0];
            const escanLink = `https://etherscan.io/address/${log.args.to}`;
            const escanTx = `https://etherscan.io/tx/${processingTransactions[rawKey].tx}`;
            const currentBalance = currentBalances[key];
            return (
              <tr key={key}>
                <td>{key}</td>
                <td><a href={escanLink}>etherscan addr</a></td>
                <td><a href={escanTx}>etherscan tx</a></td>
                <td>{log.args.value.toNumber ()}</td>
                <td>{currentBalance}</td>
                <td>{confirmations}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export class BulkSender extends React.Component {
  constructor (props) {
    super (props);

    this.state = {
      // unprocessedData: dummyData,
      unprocessedData: [],
      processingTransactions: {},
      processedData: {},
      processingData: {},
      failedData: {},
      currentBalances: {},
      completed: false,
    };
  }

  handleDataLoaded = async data => {
    const unprocessedData = data
      .slice (1, data.length) // get rid of header row
      .filter (i => i[0] !== '')
      .reduce ((acc, x) => {
        return {
          ...acc,
          [x[0]]: (acc[x[0]] || 0) + parseFloat (x[1], 10),
        };
      }, {});

    window.unprocessedData = unprocessedData;

    this.setState ({
      unprocessedData,
    });
  };

  handleError = async err => {
    console.log ('err ->', err);
  };

  sendTokens = async evt => {
    evt.preventDefault ();
    this.setState ({
      completed: false,
      processingData: {},
    });
    const {accounts, newToken} = this.props;
    const {unprocessedData} = this.state;

    let processingData = {};
    let processingTransactions = {};
    // let batch = web3.createBatch ();

    Object.keys (unprocessedData).map (async key => {
      const currentBalance = await newToken.balanceOf (key);
      processingData[key] = calculateAmount (unprocessedData[key]);
      if (currentBalance === processingData[key]) {
        console.log ('Not sending as the token numbers have already been sent');
        this.pollTransactions ();
      } else {
        newToken
          .transfer (key, processingData[key], {
            from: accounts[0],
            gasPrice: 35 * 10 ** 9,
          })
          .then (tx => {
            processingTransactions[key] = {...tx, status: 'processing'};
          })
          .catch (err => {
            console.log ('Not adding transaction?', err);
            // processingTransactions[key] = {
            //   logs: [
            //     {
            //       args: {
            //         from: accounts[0],
            //         to: key,
            //         value: new BigNumber (processingData[key]),
            //       },
            //     },
            //   ],
            //   status: 'aborted',
            // };
          })
          .then (() => {
            this.setState (
              {
                processingTransactions,
                processingData,
              },
              this.pollTransactions
            );
          });
      }
    });

    // this.setState (
    //   {
    //     unprocessedData: {},
    //     processingData,
    //     failedData,
    //   },
    //   this.pollTransactions
    // );
  };

  updateCurrentBalances = async () => {
    const {newToken} = this.props;
    const {processingTransactions} = this.state;
    let newBalances = {};
    const promises = Object.keys (processingTransactions).map (async txHash => {
      return new Promise ((resolve, reject) => {
        const txn = processingTransactions[txHash];
        const log = txn.logs[0];
        const toAddr = log.args.to;
        newToken
          .balanceOf (toAddr)
          .then (newBalance => {
            newBalances[toAddr.toLowerCase ()] = newBalance.toNumber ();
          })
          .then (resolve)
          .catch (reject);
      });
    });
    return Promise.all (promises).then (() => {
      this.setState ({
        currentBalances: newBalances,
      });
    });
    // let newBalances = await Promise.reduce (async (acc, key) => {
    //   const newBalance = await newToken.balanceOf (key);
    //   return {
    //     ...acc,
    //     [key]: newBalance,
    //   };
    // }, {});
    // console.log ('newBalances ->', newBalances);
  };

  updateCheckTransactions = async () => {
    const {processingTransactions} = this.state;
    const {web3} = this.props;
    const promises = Object.keys (processingTransactions).map (key => {
      const txn = processingTransactions[key];
      const blockHash = txn.tx;
      return new Promise ((resolve, reject) => {
        web3.eth.getTransactionReceipt (
          blockHash,
          async (err, resolvedReceipt) => {
            try {
              if (err) {
                return resolve ();
              }
              web3.eth.getBlock (resolvedReceipt.blockNumber, (err, block) => {
                web3.eth.getBlock ('latest', (err, currentBlock) => {
                  let confirmations = currentBlock.number - block.number;
                  confirmations = confirmations < 0 ? 0 : confirmations;
                  processingTransactions[key].confirmations = confirmations;
                  this.setState (
                    {
                      processingTransactions: processingTransactions,
                    },
                    resolve
                  );
                });
              });
            } catch (e) {
              reject (e);
            }
            // resolve (receipt);
          }
        );
      });
    });

    return Promise.all (promises);
  };

  pollTransactions = async () => {
    if (this.timeoutId) clearTimeout (this.timeoutId);
    const {processingTransactions} = this.state;
    if (Object.keys (processingTransactions).length <= 0) {
      // Done!
      console.log ('done');
      this.setState ({
        completed: true,
      });
    } else {
      await this.updateCurrentBalances ();
      await this.updateCheckTransactions ();
      this.timeoutId = setTimeout (this.pollTransactions, 1000);
    }
  };

  componentWillUnmount () {
    if (this.timeoutId) clearTimeout (this.timeoutId);
  }

  render () {
    const {
      unprocessedData,
      processingTransactions,
      currentBalances,
      processingData,
    } = this.state;

    return (
      <div className="bulk-sender">
        <h2>Transfer SHOPIN</h2>

        <div className="box">
          <CSVReader
            cssClass="csv-input"
            onFileLoaded={this.handleDataLoaded}
            onError={this.handleError}
            inputId="ObiWan"
          />
        </div>

        {Object.keys (unprocessedData).length > 0 &&
          <form onSubmit={this.sendTokens}>
            <table className="pure-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Tokens</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys (unprocessedData).map ((key, idx) => {
                  return (
                    <tr key={key} className={idx % 2 === 0 && 'pure-table-odd'}>
                      <td>{key}</td>
                      <td>{unprocessedData[key]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button className="pure-button">
              Send tokens
            </button>
          </form>}

        {Object.keys (processingData).length > 0 &&
          <div className="processing">
            <ProcessingTransactions
              processingTransactions={processingTransactions}
              currentBalances={currentBalances}
            />
          </div>}
      </div>
    );
  }
}

export default isControllerOwner (BulkSender);
