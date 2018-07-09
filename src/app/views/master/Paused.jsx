import React from 'react'

import Switch from '../../components/Switch'

export class Paused extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      paused: true
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

  getPaused = async () => {
    const {pauseContract} = this.props
    const paused = await pauseContract.paused();
    this.setState({paused})
    return paused
  }

  togglePause = async (evt) => {
    evt.preventDefault();
    const {paused} = this.state;
    const {account, pauseContract} = this.props;
    const methodName = paused ? 'unpause' : 'pause'
    try {
      await pauseContract[methodName]({from: account});
      await this.pollPaused(async () => {
        await this.getPaused();
        return this.state.paused;
      }, !paused);
    } catch (e) {
      console.log('error ->', e)
    }
  }

  componentDidMount() {
    this.getPaused();
  }

  render() {
    const {paused} = this.state;
    const {title} = this.props;

    return (
      <div className="pure-g">
        <div className="pure-u-1-2">
          <h2>{title}</h2>
        </div>
        <div className="pure-u-1-2">
          <Switch checked={paused} onClick={this.togglePause} />
        </div>
      </div>
    )
  }
}

export default Paused