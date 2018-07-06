var ganache = require("ganache-cli");

module.exports = ganache.server({
  accounts: new Array(10).fill(0).map((n, suffix) => ({
    secretKey: '0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b750120' + suffix,
    balance: 1e24})),
  noVMErrorsOnRPCResponse: true
});
