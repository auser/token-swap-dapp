import React from 'react';
import {Route, BrowserRouter, Switch} from 'react-router-dom';

// import Home from './app/views/home/Home';
import Syndicate from './app/views/syndicate/Syndicate';
import Investor from './app/views/investor/Investor';
import Printing from './app/views/printing/Printing';

export const Routes = props => {
  const render = Component => routerProps => (
    <div className="App">
      <nav className="navbar pure-menu pure-menu-horizontal">
        <a className="logo" href="https://shopin.com">
          <img
            role="presentation"
            className="pure-menu-heading"
            src="img/logo.svg"
          />
        </a>
        <a href="#" className="pure-menu-heading pure-menu-link">
          Token Swap
        </a>
      </nav>
      <main className="container">
        <Component {...routerProps} {...props} />
      </main>
    </div>
  );

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/print-test" render={render (Printing)} />
        <Route path="/:id" render={render (Investor)} />
        <Route path="/" render={render (Syndicate)} />
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
