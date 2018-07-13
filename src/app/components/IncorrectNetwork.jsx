import React from 'react'

export const IncorrectNetwork = (props) => (
  <div className="App">
      <nav className="navbar pure-menu pure-menu-horizontal">
        <a className="logo" href="https://shopin.com">
          <img
            role="presentation"
            className="pure-menu-heading"
            src="/img/logo.svg"
          />
        </a>
      </nav>
      <main className="container">
        <h1>Incorrect Network</h1>
        <p>
          Please change the network in metamask to the mainnet and then reload this page.
        </p>
      </main>
    </div>
)

export default IncorrectNetwork