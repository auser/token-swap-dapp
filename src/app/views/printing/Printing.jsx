import React from 'react';

import PrintReceipt from '../../components/PrintReceipt'

export class Printing extends React.Component {
  render() {
    const transaction = {
      transactionHash: 'some hash',
      fromAddress: 'hello world',
      toAddress: 'some address',
      amount: 250,
      date: new Date().toString()
    };

    return (
      <PrintReceipt transaction={transaction} />
    )
  }
}

export default Printing;
