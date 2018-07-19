import React from 'react';
import {Route, BrowserRouter, Switch, Link} from 'react-router-dom';

// import Home from './app/views/home/Home';
import Syndicate from './app/views/syndicate/Syndicate';
import Admin from './app/views/syndicate/Admin';
import Investor from './app/views/investor/Investor';
import BulkInvestor from './app/views/investor/BulkInvestor';

import MasterView from './app/views/master/Master';
import ControllerView from './app/views/controller/Controller';
import BulkTransfer from './app/views/transfer/BulkTransfer';

export const Routes = props => {
  const render = Component => routerProps => (
    <div className="App">
      <nav className="navbar pure-menu pure-menu-horizontal">
        <a className="logo" href="https://shopin.com">
          <img
            role="presentation"
            className="pure-menu-heading"
            src="/img/logo.svg"
          />
        </a>
        <Link to="/" className="pure-menu-heading pure-menu-link">
          Token Swap
        </Link>
      </nav>
      <main className="container">
        <Component {...routerProps} {...props} />
      </main>
    </div>
  );

  const routes = (
    <BrowserRouter>
      <Switch>
        <Route path="/controller" render={render (ControllerView)} />
        <Route path="/master" render={render (MasterView)} />
        <Route path="/transfer" render={render (BulkTransfer)} />>
        <Route path="/:id/admin" render={render (Admin)} />
        <Route path="/:id/bulk" render={render (BulkInvestor)} />
        <Route path="/:id" render={render (Investor)} />
        <Route path="/" render={render (Syndicate)} />
      </Switch>
    </BrowserRouter>
  );

  return routes;
};

export default Routes;
