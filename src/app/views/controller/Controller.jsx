import React from 'react'

import Paused from './Paused'
import Listing from './Listing'

export class Controller extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      controllerWhitelist: [],
      controllerBlacklist: []
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
  setupcontrollerListWatcher = async () => {
    const {controller} = this.props;
    const filter = controller.allEvents({
      fromBlock: 0
    })

    filter.watch((err, evt) => {
      let whitelist = this.state.controllerWhitelist
      let blacklist = this.state.controllerBlacklist;

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
        controllerWhitelist: whitelist.unique(),
        controllerBlacklist: blacklist.unique()
      })
    })

    this.filter = filter;
  }

  removeFromcontrollerWhitelist = async (addr) => {
    const {controller, accounts} = this.props
    await controller.removeFromWhitelist(addr, {from: accounts[0]});
  }

  addTocontrollerWhitelist = async (addr) => {
    const {controller, accounts} = this.props;
    await controller.addToWhitelist(addr, {from: accounts[0]});
  }

  removeFromcontrollerBlacklist = async (addr) => {
    const {controller, accounts} = this.props
    await controller.removeFromBlacklist(addr, {from: accounts[0]})
  }

  addTocontrollerBlacklist = async (addr) => {
    const {controller, accounts} = this.props
    await controller.addToBlacklist(addr, {from: accounts[0]})
  }


  componentDidMount() {
    this.isOwner()
    .then(() => {
      this.setupcontrollerListWatcher()
    })
  }

  componentWillUnmount() {
    if (this.filter) {
      this.filter.stopWatching()
    }
  }

  render() {
    const {controllerWhitelist, controllerBlacklist} = this.state;
    const {controller, accounts} = this.props;
    const boxStyle = {
      border: '0.5px solid grey',
      padding: 20,
    }

    return (
      <div className="master">
        <div className="pure-u-1-1" style={boxStyle}>
          <h2>Swap Controller</h2>
          <Paused
            title={'Swap paused:'}
            account={accounts[0]}
            pauseContract={controller}
          />

          <div className="pure-u-1-1">
            <Listing
              title='Whitelist'
              onRemove={this.removeFromcontrollerWhitelist}
              onAdd={this.addTocontrollerWhitelist}
              list={controllerWhitelist} />
          </div>

          <div className="pure-u-1-1">
            <Listing
              title='Blacklist'
              onRemove={this.removeFromcontrollerBlacklist}
              onAdd={this.addTocontrollerBlacklist}
              list={controllerBlacklist} />
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
            {controllerBlacklist.length}
          </div>
        </div>
        */}

      </div>
    )
  }
}

export default Controller
