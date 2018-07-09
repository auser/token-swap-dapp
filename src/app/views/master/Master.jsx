import React from 'react'

import Paused from './Paused'
import Listing from './Listing'

export class Master extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      whitelist: [],
      blacklist: []
    }
  }

  isOwner = async () => {
    const {accounts, controller, history} = this.props;
    const owner = await controller.owner();

    if (accounts[0] !== owner) {
      history.replace('/')
    }
  }

  getWhitelist = async () => {}

  componentDidMount() {
    this.isOwner()
    .then(() => {
      this.getWhitelist()
    })
  }

  render() {
    const {whitelist, blacklist} = this.state;
    const {controller, newToken, accounts} = this.props;

    return (
      <div className="master">
        <h1>Master</h1>

        <div className="pure-u-1-1">
          <h2>Token</h2>
          <Paused
            title={'Token paused:'}
            account={accounts[0]}
            pauseContract={newToken}
          />
        </div>

        <div className="pure-u-1-1">
          <h2>Controller</h2>
          <Paused 
            title={'Controller paused'}
            account={accounts[0]}
            pauseContract={controller} />

          <div className="pure-u-1-1">
            <Listing
              title='Whitelist'
              list={whitelist} />
          </div>


          <div className="pure-u-1-1">
            {blacklist.length}
          </div>
        </div>

      </div>
    )
  }
}

export default Master