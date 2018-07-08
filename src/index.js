import React from 'react';
import ReactDOM from 'react-dom';

// Pull in dependencies
import './utils/array';

import App from './App';
import Loading from './app/components/Loading';
import loadContracts from './app/contracts';

loadContracts ()
  .then (contracts => {
    const render = App =>
      ReactDOM.render (
        <App {...contracts} />,
        document.getElementById ('root')
      );

    if (module.hot) {
      module.hot.accept ('./App.js', () => {
        const NewApp = require ('./App').default;
        render (NewApp);
      });
    }

    render (App);
  })
  .catch (err => {
    console.log ('An error occurred with web3', err);
  });

ReactDOM.render (<Loading />, document.getElementById ('root'));
