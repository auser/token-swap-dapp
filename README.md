# token-swap-dapp

## Debugging and development

```javascript
REACT_APP_TOKEN_ADDRESS='0xd5de1a88bf957388431dadb6eb5aeeebb636201c'
REACT_APP_CONTROLLER_ADDRESS='0x224813a9bf691586e58a03f4ef3652b38c33d481'
REACT_APP_FACTORY_ADDRESS='0x27bb7642ed4724e94c45a235d6b6f67efcd63369'

controller = SwapController.at(REACT_APP_CONTROLLER_ADDRESS)

controller.addToWhitelist(YOURADDRESS)
controller.isWhitelisted(YOURADDRESS)

factory = SwapFactory.at(REACT_APP_FACTORY_ADDRESS)

factory.getContractCount()
```