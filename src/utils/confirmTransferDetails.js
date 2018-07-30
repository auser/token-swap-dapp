import BigNumber from 'bignumber.js'
import util from 'ethereumjs-util'

export const confirmTransferDetails = (value, submitToAddress, web3, tokenDecimals = 18) => new Promise((resolve, reject) => {
  try {
    if (value.length <= 0) {
      return reject('Transaction hash must be longer than 0');
    }
    web3.eth.getTransaction(value, (err, hash) => {
      if (!hash) return reject(err);
      const input = hash.input;
      const fromAddress = hash.from;
      const evtSha = web3.sha3('transfer(address,uint256)');
      // Get the transaction calling function (first 8 bytes)
      const callingFn = input.slice(2, 10);
      const evtShaFirst = evtSha.slice(2, 10);

      // if the transfer function was called
      if (callingFn !== evtShaFirst) {
        return reject(`Not a transfer() function`);
      }

      const toHex = new Buffer(input.slice(11, 75), 'hex');
      const toAddress = util.bufferToHex(toHex).toLowerCase();

      if (toAddress.indexOf(submitToAddress.slice(2).toLowerCase()) < 0) {
        console.log(submitToAddress.slice(2), toAddress);
        // we did submitted to the wrong address
        return reject(`Submitted to different address`);
      } else {
        const valueHex = new Buffer(input.slice(76), 'hex');
        const amount = new BigNumber(util.bufferToInt(valueHex) / Math.pow(10, tokenDecimals));

        const realToAddress = '0x' + toAddress.slice(25, -1);
        const details = {
          amount,
          fromAddress, 
          toAddress: realToAddress,
          transactionHash: value
        };
        return resolve(details);
      }
    });
  } catch (e) {
    reject(e);
  }
})
