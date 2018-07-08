const exec = require('executive')
const path = require('path')

const CONTRACTS_PATH = path.join(path.resolve(__dirname), '../../token-crowdsale')

;(async () => {
  // Run truffle migrations
  const {stdout} = await exec('truffle migrate --reset --network development', {cwd: CONTRACTS_PATH})

  // Set env variables for dapp
  process.env.REACT_APP_CONTROLLER_ADDRESS = /SwapController: (\w+)/.exec(stdout)[1]
  process.env.REACT_APP_FACTORY_ADDRESS    = /SwapFactory: (\w+)/.exec(stdout)[1]
  process.env.REACT_APP_TOKEN_ADDRESS      = /OriginalToken: (\w+)/.exec(stdout)[1]

  // Start server
  console.log('')
  require('./start')
})().catch(err => {
    console.error(err)
})
