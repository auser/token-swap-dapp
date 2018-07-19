import React from 'react';
import CsvParse from '@vtex/react-csv-parse';

import withContracts from '../../hocs/withContracts';
import PendingTransferTable from './pendingTransferTable';

const dummyData = [
  {
    address: '0x5624888514fb843C6bD08e516645D2638a1C0896',
    amount: '1234.4321',
  },
  {
    address: '0x9226B7DF5BA9940d6e4e421F3D05Ba79C30D04FB',
    amount: '987.789878987',
  },
  {
    address: '0x027A4ceB91465934586BcCB7479BaACF47200839',
    amount: '500.123456789012',
  },
  {
    address: '0x302E75559cB159Bee5C4e16B2A834F17e1039bFB',
    amount: '10333444.555666',
  },
];

export class BulkTransfer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pendingTransfers: dummyData,
      pendingTransactions: {},
    };
  }

  componentWillMount() {
    console.log(this.props);
  }

  handleData = data => {
    console.log('data --->', JSON.stringify(data, null, 2));
  };

  handleError = err => {
    console.log('error ->');
  };

  handleSingleTransaction = (pendingTransaction) => {
    console.log('handling single transaction ->', pendingTransaction)
  };

  render() {
    const keys = ['address', 'amount'];
    const {pendingTransfers} = this.state;

    return (
      <div className="bulk-transfer">
        <h5>Bulk transfer</h5>
        <div className="input">
          <CsvParse
            keys={keys}
            onDataUploaded={this.handleData}
            onError={this.handleError}
            render={onChange => <input type="file" onChange={onChange} />}
          />
        </div>
        {Object.keys(pendingTransfers).length > 0 && (
          <PendingTransferTable
            handleSingleTransaction={this.handleSingleTransaction}
            pendingTransfers={pendingTransfers}
          />
        )}
      </div>
    );
  }
}

export default withContracts(BulkTransfer);
