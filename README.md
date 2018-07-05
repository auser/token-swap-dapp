# token-swap-dapp

[![npm][npm-img]][npm-url]
[![build][build-img]][build-url]
[![dependencies][dependencies-img]][dependencies-url]
[![license][license-img]][license-url]

> Swippin' and swappin' the foreigns

Dapp and example [Solidity contracts][solidity] demonstrating a straight-forward
token swap.  Useful framework for controlled and secure token upgrades.

## Installation

1. Clone this repo.
```bash
$ clone github.com/auser/token-swap-dapp
```

2. Install dependencies.
```bash
$ cd token-swap-dapp && npm install
```

3. Run the development console.
```bash
$ truffle develop
```

4. Compile and migrate the smart contracts. Note inside the development console we don't preface commands with `truffle`.
```javascript
compile
migrate
```

5. Run the webpack server for front-end hot reloading (outside the development console). Smart contract changes must be manually recompiled and migrated.
```javascript
// Serves the front-end on http://localhost:3000
npm run start
```

6. Truffle can run tests written in Solidity or JavaScript against your smart contracts. Note the command varies slightly if you're in or outside of the development console.
```javascript
// If inside the development console.
test

// If outside the development console..
truffle test
```

7. Jest is included for testing React components. Compile your contracts before running Jest, or you may receive some file not found errors.
```javascript
// Run Jest outside of the development console for front-end component tests.
npm run test
```

8. To build the application for production, use the build command. A production build will be in the build_webpack folder.
```javascript
npm run build
```

## FAQ

* __How do I use this with the EthereumJS TestRPC?__

    It's as easy as modifying the config file! [Check out our documentation on adding network configurations](http://truffleframework.com/docs/advanced/configuration#networks). Depending on the port you're using, you'll also need to update line 24 of `src/utils/getWeb3.js`.

* __Why is there both a truffle.js file and a truffle-config.js file?__

    `truffle-config.js` is a copy of `truffle.js` for compatibility with Windows development environments. Feel free to it if it's irrelevant to your platform.

* __Where is my production build?__

    The production build will be in the build_webpack folder. This is because Truffle outputs contract compilations to the build folder.

* __Where can I find more documentation?__

    This box is a marriage of [Truffle](http://truffleframework.com/) and a React setup created with [create-react-app](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md). Either one would be a great place to start!

## About

Originally designed for and utilized by [Shopin][shopin] for their
token swap in a collaboration between [Shishito][shishito] and [Hanzo][hanzo].

## License

[MIT][license-url]

[hanzo]:            https://hanzo.ai
[shishito]:         https://shishi.to

[solidity]:         solidity.readthedocs.io
[truffle]:          http://truffleframework.com/
[tests]:            https://github.com/auser/token-swap-dapp/tree/master/test

[build-img]:        https://img.shields.io/travis/auser/token-swap-dapp.svg
[build-url]:        https://travis-ci.org/auser/token-swap-dapp
[dependencies-img]: https://david-dm.org/auser/token-swap-dapp.svg
[dependencies-url]: https://david-dm.org/auser/token-swap-dapp
[downloads-img]:    https://img.shields.io/npm/dm/token-swap-dapp.svg
[downloads-url]:    http://badge.fury.io/js/token-swap-dapp
[license-img]:      https://img.shields.io/npm/l/token-swap-dapp.svg
[license-url]:      https://github.com/auser/token-swap-dapp/blob/master/LICENSE
[npm-img]:          https://img.shields.io/npm/v/token-swap-dapp.svg
[npm-url]:          https://www.npmjs.com/package/token-swap-dapp
