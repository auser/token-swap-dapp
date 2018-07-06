# token-swap-dapp

## Debugging and development

```javascript
REACT_APP_TOKEN_ADDRESS='0x85a84691547b7ccf19d7c31977a7f8c0af1fb25a'
REACT_APP_CONTROLLER_ADDRESS='0x69bd17ead2202072ae4a117b036305a94ccf2e06'
REACT_APP_FACTORY_ADDRESS='0x564540a26fb667306b3abdcb4ead35beb88698ab'

controller = SwapController.at(REACT_APP_CONTROLLER_ADDRESS)

YOURADDRESS = '0xbEA369E5a450340A4cAc6bB2AEB8Ffe25B89Ee01'

controller.addToWhitelist(YOURADDRESS)
controller.isWhitelisted(YOURADDRESS)

factory = SwapFactory.at(REACT_APP_FACTORY_ADDRESS)

factory.getContractCount()
```