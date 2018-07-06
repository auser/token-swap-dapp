import React from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'

import Home from './app/views/home/Home'
import Syndicate from './app/views/syndicate/Syndicate'
import Investor from './app/views/investor/Investor'

export const Routes = (props) => {
  const render = (Component) => (routerProps) => <Component {...routerProps} {...props} />

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/syndicate" render={render(Syndicate)} />
        <Route path="/investor" render={render(Investor)} />
        <Route path="/" render={render(Home)} />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes