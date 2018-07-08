const exec = require('executive')
const path = require('path')

const CONTRACTS_PATH = path.join(path.resolve(__dirname), '../../token-crowdsale')

;(async () => {
  // Run truffle migrations
  const {stdout} = await exec('truffle migrate --reset --network development', {cwd: CONTRACTS_PATH})

  // Set env variables for dapp
  const controller = /SwapController: (\w+)/.exec(stdout)[1]
  const factory    = /SwapFactory: (\w+)/.exec(stdout)[1]
  const original   = /OriginalToken: (\w+)/.exec(stdout)[1]
  const newToken   = /ShopinToken: (\w+)/.exec(stdout)[1]

  console.log(`
    OriginalToken:  ${original}
    ShopinToken:    ${newToken}
    SwapController: ${controller}
    SwapFactory:    ${factory}
  `)

  // Update environment for dapp
  process.env.REACT_APP_CONTROLLER_ADDRESS = controller
  process.env.REACT_APP_FACTORY_ADDRESS    = factory
  process.env.REACT_APP_TOKEN_ADDRESS      = original

  // Start server
  require('./start')
})().catch(err => {
    console.error(err)
})
