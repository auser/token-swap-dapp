import Promise from 'bluebird';

export const confirmFor = (hashTx, web3, confirmations=8) => new Promise((resolve, reject) => {
  const filterId = web3.eth.filter('latest', () => {}).watch((err, res) => {
    if (!err) {
      web3.eth.getTransaction(hashTx, (err, hsh) => {
        if (err) {
          filterId.stopWatching();
          reject(err);
          return err;
        } else {
          console.log('hsh -->', hsh, res);
          if (hsh && (res.blockNumber - hsh.blockNumber) >= confirmations) {
            filterId.stopWatching();
            resolve();
          }
        }
      });
    }
  });
})

export default confirmFor;
