import React from 'react'
import CSVReader from 'react-csv-reader'
import isControllerOwner from '../../hocs/isControllerOwner'
import BigNumber from 'bignumber.js'

// const dummyData = {
//   "0x6bb323e5f348bfdb041efbc6e528a4493f1fba1d": 42100,
//   "0xc2245cd9f6cb71858be9412bcaa2e8d7d2656b6f": 20393444,
//   "0x44e0aa002e3d9491a879f1b472d8f66de8f7195f": 977336,
//   "0x2c191947c8583d7dbf47a470a51aee9cf8e8b1a5": 15171,
//   "0x4a466600029457f87aa25c56dd30b16056ae983e": 835,
//   "0x22212bbbc23002f5500ec17f2b142aec98b9a3f3": 239,
//   "0x45ba7667b903c9b039c332e8b7b0c0be9f489e13": 350100,
//   "0xa6ca5b7a4064f5ecb3c60322c3af0f845b5b381a": 350100
// }

function calculateAmount(amount) {
  return (new BigNumber(amount)).mul(10**18)
}

export class BulkSender extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // unprocessedData: dummyData,
      unprocessedData: {},
      processedData: {},
      failedData: {}
    }
  }

  handleDataLoaded = async (data) => {
    const unprocessedData = data
      .slice(1, data.length) // get rid of header row
      .filter(i => i[0] !== '')
      .reduce((acc, x) => {
        return {
          ...acc,
          [x[0]]: ((acc[x[0]] || 0) + parseFloat(x[1], 10))
        }
      }, {});

    window.unprocessedData = unprocessedData

    this.setState({
      unprocessedData
    })
  }

  handleError = async (err) => {
    console.log('err ->', err)
  }

  sendTokens = async (evt) => {
    evt.preventDefault()
    const {accounts, newToken, web3} = this.props
    const {unprocessedData} = this.state

    let processedData = {}
    let failedData = {}
    let batch = web3.createBatch()

    Object.keys(unprocessedData).map(async key => {
      console.log('sending ->', key)
      batch.add(newToken.transfer.request(key, calculateAmount(unprocessedData[key]), {from: accounts[0]}))
      processedData[key] = unprocessedData[key]
    })

    try {
      await batch.execute()
    } catch (e) {
      console.log('error ->', e);
    }

    this.setState({
      unprocessedData: {},
      processedData,
      failedData
    })
  }

  render() {
    const {unprocessedData} = this.state;

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

        {
          (Object.keys(unprocessedData).length > 0) && (
            <form onSubmit={this.sendTokens}>
              <table className="pure-table">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Tokens</th>
                  </tr>
                </thead>
                <tbody>
                {Object.keys(unprocessedData).map((key, idx) => {
                  return (
                    <tr key={key} className={idx % 2 === 0 && 'pure-table-odd'}>
                      <td>{key}</td>
                      <td>{unprocessedData[key]}</td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
              <button className="pure-button">
                Send tokens
              </button>
            </form>
          )
        }
      </div>
    )
  }
}

export default isControllerOwner(BulkSender)
