import React from 'react'

export const InstallMetamask = (props) => (
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
        <h1>Install metamask</h1>
        <p>
          This application requires you to have <a href="https://metamask.io">MetaMask</a> installed. In order to install it, visit <a href="https://metamask.io">https://metamask.io</a> and then return back here.
        </p>
      </main>
    </div>
)

export default InstallMetamask