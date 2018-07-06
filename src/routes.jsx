import React from 'react'
import { Route, BrowserRouter } from 'react-router-dom'

import Home from './app/views/home/Home'
import Syndicate from './app/views/syndicate/Syndicate'
import Investor from './app/views/investor/Investor'

export const Routes = (props) => {
  const render = (Component) => (routerProps) => <Component {...routerProps} {...props} />

  return (
    <BrowserRouter>
      <div>
        <Route path="/" render={render(Home)} />
        <Route path="/syndicate" render={render(Syndicate)} />
        <Route path="/investor" render={render(Investor)} />
      </div>
    </BrowserRouter>
  )
}

export default Routes