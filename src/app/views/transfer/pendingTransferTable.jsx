import React from 'react';

export const PendingTransferTable = ({
  pendingTransfers,
  handleSingleTransaction,
}) => {
  const handleTxn = (txn, evt) => {
    evt.preventDefault()
    handleSingleTransaction(txn)
  }
  return (
    <div className="pending-transfers">
      <h3>Pending transfers</h3>
      <table className="pure-table">
        <thead>
          <tr>
            <th />
            <th>Address</th>
            <th># of tokens</th>
          </tr>
        </thead>
        <tbody>
          {pendingTransfers.map(txn => {
            const {address, amount} = txn;
            return (
              <tr key={address}>
                <td>
                  <button onClick={handleTxn.bind(txn)}>
                    transfer
                  </button>
                </td>
                <td>{address}</td>
                <td>{amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PendingTransferTable;
