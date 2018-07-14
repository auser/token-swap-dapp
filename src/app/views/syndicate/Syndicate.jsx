import React from 'react';
// import {connect} from 'react-redux'
// import { Link } from 'react-router-dom'

import withContracts from '../../hocs/withContracts'

import WhitelistedInstructions from '../../components/WhitelistedInstructions';
import NotWhitelisted from '../../components/NotWhitelisted';

export class Syndicate extends React.Component {
  constructor (props) {
    super (props);

    this.state = {
      ready: false,
      isWhitelisted: false,
      hasAccount: false,
    };
  }

  componentWillMount () {
    const {web3} = this.props;
    const {accounts} = web3;

    console.log('----------->', web3)

    if (!accounts || accounts.length === 0) {
      this.setState ({
        ready: true,
        hasAccount: false,
      });
    } else {
      this.checkWhitelisted ();
    }
  }

  checkWhitelisted = () => {
    const {web3, controller} = this.props;
    const {accounts} = web3;

    controller.isWhitelisted (`${accounts[0]}`).then (isWhitelisted => {
      this.setState ({
        ready: true,
        hasAccount: true,
        isWhitelisted,
      });
    });
  };

  render () {
    const {web3} = this.props;
    return (
      <div className="pure-g">
        <div className="pure-u-1-1">
          {this.state.isWhitelisted
            ? <WhitelistedInstructions
                checkWhitelisted={this.checkWhitelisted}
                web3={web3}
                {...this.props}
              />
            : <NotWhitelisted
                checkWhitelisted={this.checkWhitelisted}
                web3={web3}
                {...this.props}
              />}
        </div>
      </div>
    );
  }
}

export default withContracts('SwapController')(Syndicate)

