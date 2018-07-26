## Step one.

Launch contract, Dapp, browser, and the truffle console (in that order) by:

1. Running ganache
2. `TOKEN_OWNER='YOUR ADDRESS' npm run dev`
3. Open your web browser
4. **AFTER** npm run has finished, open the truffle console:

```bash
./node_modules/.bin/truffle console --network development
```

5. Take note of the addresses that are listed in the output as well as the line just above the paragraph where it says `Token Owner:`. We'll use those throughout.

Note: I use two browsers (Chrome and Brave) so I can keep the `owner` address open on a metamask instance in one browser and use the other to interact with the contract.

## Whitelist a contract address (with ETH).

1. Visit the browser at http://localhost:3000 (or swap.shopin.com) and ensure it says "Weclome"
1.1. Find an address with ETH in it (or import one from ganache).
2. In the `truffle` console, load the SwapController contract:

```bash
SwapController.at('SWAP_CONTROLLER_ADDRESS').then(i => c = i)
```

With the `c` variable, let's call the `addToWhitelist()` function with the address we want to whitelist:

```bash
c.addToWhitelist('ADDRESS')
```

After we've added the whitelist in the console, we should be able to click on the `Check account` button and see the page show a contract creation text. If not, then try again in a few seconds or reload the page.

## Deploy the contract

Click on the `Deploy Swap Contract` button on the next page. After about two seconds or so, the page should reload and show that it's been deployed. 

## Visit the Super view page

1. `http://localhost:3000/super`
2. Verify that we have one contract.

