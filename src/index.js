import React from 'react';
import ReactDOM from 'react-dom';

// Pull in dependencies
import './utils/array';

import App from './App';

const MOUNT = document.getElementById('root')

const render = App =>
  ReactDOM.render (
    <App />,
    MOUNT
  );

if (module.hot) {
  module.hot.accept ('./App.js', () => {
    const NewApp = require ('./App').default;
    render (NewApp);
  });
}

render (App);
