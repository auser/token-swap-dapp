import React from 'react'
import { Route, BrowserRouter, Link, Switch } from 'react-router-dom'

import Home from './app/views/home/Home'
import Syndicate from './app/views/syndicate/Syndicate'
import Investor from './app/views/investor/Investor'

export const Routes = (props) => {
  const render = (Component) => (routerProps) => (
    <div className="App">
      <nav className="navbar pure-menu pure-menu-horizontal">
        <Link to="/" className="pure-menu-heading pure-menu-link">
          Shopin token swap
        </Link>
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
        <Route path="/investor/:id" render={render(Investor)} />
        <Route path="/" render={render(Home)} />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes