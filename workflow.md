## Step one.

Launch contract, Dapp, browser, and the truffle console (in that order) by:

1. Running ganache
2a). Run `npm install`
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

Using the browser with the TOKEN_OWNER address set in metamask visit the super page:

1. `http://localhost:3000/super`
2. Verify that we have one contract.

## Transfer tokens 

Now we need to act as the users sending their old tokens to the syndicate addresses. 

1. In the truffle console, get an instance of the `OriginalToken` contract:

```bash
OriginalToken.at('TOK').then(i => orig = i)
```

2. Since we'll need some old transfer tokens, we need to get some from the owner address to a participating address (some other address in metamask):

```bash
orig.transfer('OTHER_ADDRESS', 2e15, {from: 'OWNER_ADDRESS'})
```

3. Transfer tokens from the OTHER_ADDRESS to the contract using the console:

```bash
orig.transfer('CONTRACT_ADDRESS', 2e14, {from: 'OTHER_ADDRESS'})
```

Save the transaction hash from the output of the console.

In this example, we'll use: `0x4c52d288d090d4286748a866a07f2fd789382c229cd4d4d303d77148aeefee97` as the transaction hash.

Do this as many times as you'd like (simulating other users sending their SHOP tokens back to the syndicate addresses).

4. Next we need to add the token swap request to the syndicate address. We can do this from any account with ETH in it. Head to the syndicate page, which is the unique url of the name of the address appended on the root domain. For example:

![](http://localhost:3000/0x3580f23c8df78c62e0c216f7e352f8d0df823767)

We can either add one at a time at that address _or_ use the `/bulk` page to do that (still at the unique url):

![](http://localhost:3000/0x3580f23c8df78c62e0c216f7e352f8d0df823767/bulk)

Regardless of the page, add the transaction hash on this page and see how the transaction matches the actual transfer amounts we previously made.

Submit the request (using metamask).

After a few seconds, the page should switch to say "Thanks" (depending on the page you're using).

5. Switch to the `/super` view (in the other browser, presumably) and ensure the one transaction exists on the contract. You may need to click `Refresh token factories` to see the update.

Ensure the balances are correct. 

## Execute the shopin swap

1. The contract address now needs the new token to swap out to the investors, so we need to transfer the new shopin token to the contract from the owner.

Get the `ShopinToken` instance:

```bash
ShopinToken.at('ShopinTokenAddress').then(i => tok = i)
```

Now look at the `/super` route and see how many **total** tokens are requested. We'll need to transfer that many to the contract. 

We'll transfer these tokens to the **contract address**, not the **syndicate address**. This is very important or the process will fail.

```bash
tok.transfer('SYNDICATE_ADDRESS', 2e14, {from: 'OWNER_ADDRESS'})
```

Using the `refresh token factories` button, verify the current balance is correct and matches (or exceeds) the pending tokens requested.

2. Now, head back to the browser with the contract address in metamask that owns the deployed contract and refresh the page at the root (i.e. ![](http://localhost:3000))

The button at the bottom of the page should **not** be enabled yet. It's only enabled under the two conditions:

* There are equal to or more tokens in the contract address
* The token swap is enabled via the controller

3. Let's enable the swap in the controller. Back in the console, enable the token swap. Check that it is **disabled** with the following command:

```bash
c.swapEnabled()
```

It should say false. Let's flip it to true by enabling the swap:

```bash
c.enableSwap()
```
Let's check that it's enabled now:

```bash
c.swapEnabled()
```

In the browser, let's refresh the page and the button should enable in a moment.

Let's press the button and distribute the new SHOPIN tokens to the syndicate participants! The page will update with a "success" message.

4. Finally, let's add the token to metamask and see that the balance has updated with the new token.

Alternatively, check the balance using the console:

```bash
tok.balanceOf('OTHER_ADDRESS').then(i => i.toNumber())
```
