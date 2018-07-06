import React from 'react'

export class WhitelistedInstructions extends React.Component {

  render() {
    return (
      <div className="App">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Not whitelisted...</h1>
            <p>
              If you feel you've reached this in error, contact us and let us know your address: 
            </p>
            <pre><code>{this.props.accounts[0]}</code></pre>
            <div className="pure-u-1-1">
              <button onClick={this.props.checkWhitelisted}>Check again</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default WhitelistedInstructions