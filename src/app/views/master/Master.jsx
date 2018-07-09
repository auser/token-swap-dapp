import React from 'react'

import Switch from '../../components/Switch'

export class Master extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      whitelist: [],
      blacklist: [],
      active: false
    }
  }

  isOwner = async () => {
    const {accounts, controller, history} = this.props;
    const owner = await controller.owner();

    if (accounts[0] !== owner) {
      history.replace('/')
    }
  }

  pollPaused = async (fn, expectedValue, id) => {
    const currValue = await fn();
    if (currValue !== expectedValue) {
      if (id) clearTimeout(id);
      id = setTimeout(() => {
        this.pollPaused(fn, expectedValue, id);
      }, 1000);
    } else {
      clearTimeout(id);
    }
  }

  getActive = async () => {
    const {controller} = this.props
    const active = await controller.swapEnabled();
    this.setState({active})
    return active
  }

  togglePause = async (evt) => {
    evt.preventDefault();
    const {active} = this.state;
    const {controller, accounts} = this.props;
    const methodName = active ? 'disableSwap' : 'enableSwap'
    try {
      await controller[methodName]({from: accounts[0]});
    } catch (e) {
      console.log('error ->', e)
    }
    await this.pollPaused(async () => {
      await this.getActive();
      return this.state.active;
    }, !active);
  }

  componentDidMount() {
    this.isOwner()
    .then(() => {
      this.getActive()
    })
  }

  render() {
    const {whitelist, blacklist, active} = this.state;

    return (
      <div className="master">
        <h1>Master</h1>

        <div className="pure-g">
          <div className="pure-u-1-2">
            <h2>Active</h2>
          </div>
          <div className="pure-u-1-2">
            <Switch checked={active} onClick={this.togglePause} />
          </div>
        </div>

        <div className="pure-u-1-1">
          {whitelist.length}
        </div>


        <div className="pure-u-1-1">
          {blacklist.length}
        </div>

      </div>
    )
  }
}

export default Master