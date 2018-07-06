# token-swap-dapp

## Debugging and development

```javascript
REACT_APP_CONTROLLER_ADDRESS='0xc694f357819bfe7482ee7c3f27b6d632ed168b8a' REACT_APP_FACTORY_ADDRESS='0xfb6515fd4e72acb2ef7bce46a39527ae20a15918'

controller = SwapController.at(REACT_APP_CONTROLLER_ADDRESS)

controller.addToWhitelist(YOURADDRESS)
controller.isWhitelisted(YOURADDRESS)

factory = SwapFactory.at(REACT_APP_FACTORY_ADDRESS)

factory.getContractCount()
```