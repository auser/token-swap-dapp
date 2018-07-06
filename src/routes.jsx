import React from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'

import Home from './app/views/home/Home'
import Syndicate from './app/views/syndicate/Syndicate'
import Investor from './app/views/investor/Investor'

export const Routes = (props) => {
  const render = (Component) => (routerProps) => (
    <div className="App">
      <nav className="navbar pure-menu pure-menu-horizontal">
        <a href="#" className="pure-menu-heading pure-menu-link">
          Shopin token swap
        </a>
      </nav>
      <main className="container">
        <Component {...routerProps} {...props} />
      </main>
    </div>
  )

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/syndicate" render={render(Syndicate)} />
        <Route path="/investor/:uniquePath" render={render(Investor)} />
        <Route path="/" render={render(Home)} />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes