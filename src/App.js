import React, {Component} from 'react';

import WhitelistedInstructions from './app/components/WhitelistedInstructions'
import NotWhitelisted from './app/components/NotWhitelisted'

import './App.css';

class App extends Component {
  constructor (props) {
    super (props);

    this.state = {
      web3: null,
      ready: false,
      isWhitelisted: false,
      hasAccount: false
    };
  }

  componentWillMount() {
    const {accounts} = this.props
    if (!accounts || accounts.length === 0) {
      this.setState({
        ready: true,
        hasAccount: false
      })
    } else {
      this.checkWhitelisted()
    }
  }

  checkWhitelisted = () => {
    const {accounts, controller} = this.props;
    controller.isWhitelisted(`${accounts[0]}`)
      .then(isWhitelisted => {
        this.setState({
          ready: true,
          hasAccount: true,
          isWhitelisted
        })
      })
  }

  render () {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">
            Shopin token swap
          </a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              {this.state.isWhitelisted ?
                <WhitelistedInstructions {...this.props} /> :
                <NotWhitelisted {...this.props} />
              }
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
