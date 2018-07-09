const exec = require('executive')
const path = require('path')

const CONTRACTS_PATH = path.join(path.resolve(__dirname), '../../token-crowdsale')
const trufflePath = path.join(CONTRACTS_PATH, './node_modules/.bin/truffle')

;(async () => {
  // Run truffle migrations
  const {stdout} = await exec(`${trufflePath} migrate --reset --network development`, {cwd: CONTRACTS_PATH, env: process.env})

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
  process.env.REACT_APP_NEW_TOKEN_ADDRESS  = newToken

  // Start server
  require('./start')
})().catch(err => {
    console.error(err)
})
