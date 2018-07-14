import React from 'react'

export const UnlockMetamask = (props) => (
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
        <h1>Please unlock metamask</h1>
        <p>
          In order to run this application, you'll need to unlock your metamask account.
        </p>
      </main>
    </div>
)

export default UnlockMetamask