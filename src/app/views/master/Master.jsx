import React from 'react'

import Paused from './Paused'
import Listing from './Listing'

export class Master extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tokenWhitelist: [],
      tokenBlacklist: []
    }
  }

  isOwner = async () => {
    const {accounts, controller, history} = this.props;
    const owner = await controller.owner();

    if (accounts[0] !== owner) {
      history.replace('/')
    }
  }

  // SO FREAKING LAME
  setupTokenListWatcher = async () => {
    const {newToken} = this.props;
    const filter = newToken.allEvents({
      fromBlock: 0
    })

    filter.watch((err, evt) => {
      let whitelist = this.state.tokenWhitelist
      let blacklist = this.state.tokenBlacklist;

      if (evt.event === 'AddedToWhitelist') {
        const idx = whitelist.indexOf(evt.args._addr)
        if (!idx || idx < 0) {
          whitelist = whitelist.concat(evt.args._addr);
        }
      } else if (evt.event === 'RemovedFromWhitelist') {
        whitelist = whitelist.filter(ele => ele !== evt.args._addr);
      } else if (evt.event === 'AddedToBlacklist') {
        const idx = blacklist.indexOf(evt.args._addr)
        if (!idx || idx < 0) {
          blacklist = blacklist.concat(evt.args._addr);
        }
      } else if (evt.event === 'RemovedFromBlacklist') {
        blacklist = blacklist.filter(ele => ele !== evt.args._addr);
      }

      this.setState({
        tokenWhitelist: whitelist.unique(),
        tokenBlacklist: blacklist.unique()
      })
    })

    this.filter = filter;
  }

  removeFromTokenWhitelist = async (addr) => {
    const {newToken, accounts} = this.props
    await newToken.removeFromWhitelist(addr, {from: accounts[0]});
  }

  addToTokenWhitelist = async (addr) => {
    const {newToken, accounts} = this.props;
    await newToken.addToWhitelist(addr, {from: accounts[0]});
  }

  removeFromTokenBlacklist = async (addr) => {
    const {newToken, accounts} = this.props
    await newToken.removeFromBlacklist(addr, {from: accounts[0]})
  }

  addToTokenBlacklist = async (addr) => {
    const {newToken, accounts} = this.props
    await newToken.addToBlacklist(addr, {from: accounts[0]})
  }


  componentDidMount() {
    this.isOwner()
    .then(() => {
      this.setupTokenListWatcher()
    })
  }

  componentWillUnmount() {
    if (this.filter) {
      this.filter.stopWatching()
    }
  }

  render() {
    const {tokenWhitelist, tokenBlacklist} = this.state;
    const {newToken, accounts} = this.props;
    const boxStyle = {
      border: '0.5px solid grey',
      padding: 20,
    }

    return (
      <div className="master">
        <div className="pure-u-1-1" style={boxStyle}>
          <h2>Shopin Token</h2>
          <Paused
            title={'Token paused:'}
            account={accounts[0]}
            pauseContract={newToken}
          />

          <div className="pure-u-1-1">
            <Listing
              title='Whitelist'
              onRemove={this.removeFromTokenWhitelist}
              onAdd={this.addToTokenWhitelist}
              list={tokenWhitelist} />
          </div>

          <div className="pure-u-1-1">
            <Listing
              title='Blacklist'
              onRemove={this.removeFromTokenBlacklist}
              onAdd={this.addToTokenBlacklist}
              list={tokenBlacklist} />
          </div>
        </div>

        {/*
        <div className="pure-u-1-1" style={boxStyle}>
          <h2>Controller</h2>
          <Paused
            title={'Controller paused'}
            account={accounts[0]}
            pauseContract={controller} />

          <div className="pure-u-1-1">
            {tokenBlacklist.length}
          </div>
        </div>
        */}

      </div>
    )
  }
}

export default Master
