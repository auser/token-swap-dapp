var ganache = require('ganache-cli')

module.exports = ganache.server({
  debug: true,
  default_balance_ether: 1000,
  accounts: new Array(20).fill(0).map(() => ({balance: 1e24})),
  mnemonic: 'lock clay engine pen escape web language boss base road vague extra',
  noVMErrorsOnRPCResponse: true
})
