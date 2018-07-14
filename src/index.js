import React from 'react';
import ReactDOM from 'react-dom';

// Pull in dependencies
import './utils/array';

import App from './App';

const MOUNT = document.getElementById('root')

const {NODE_ENV} = process.env
// the required network is anything in development
// mainnet in production, otherwise it's ropsten
const requiredNetwork = NODE_ENV === 'development' ? '*' : 
  (NODE_ENV === 'production' ? '1' : '3')

const render = App =>
  ReactDOM.render (
    <App
      requiredNetwork={requiredNetwork}
      updateInterval={1500}
      />,
    MOUNT
  );

if (module.hot) {
  module.hot.accept ('./App.js', () => {
    const NewApp = require ('./App').default;
    render (NewApp);
  });
}

render (App);
