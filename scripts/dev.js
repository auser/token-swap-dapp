const exec = require('executive')
const path = require('path')

const CONTRACTS_PATH = path.join(path.resolve(__dirname), '../../token-crowdsale')

;(async () => {
  const {stdout} = await exec('truffle migrate --reset --network development', {cwd: CONTRACTS_PATH})

  process.env.REACT_APP_CONTROLLER_ADDRESS = /SwapController: (\w+)/.exec(stdout)[1]
  process.env.REACT_APP_FACTORY_ADDRESS    = /SwapFactory: (\w+)/.exec(stdout)[1]
  process.env.REACT_APP_TOKEN_ADDRESS      = /OriginalToken: (\w+)/.exec(stdout)[1]
  require('./start')
})().catch(err => {
    console.error(err)
})
