import React from 'react';
import ReactDOM from 'react-dom';

import App from './App'
import Loading from './app/components/Loading'
import loadContracts from './app/contracts'

loadContracts()
.then(contracts => {
  const render = App =>
    ReactDOM.render (<App {...contracts} />, document.getElementById ('root'));

  if (module.hot) {
    module.hot.accept ('./App.js', () => {
      const NewApp = require ('./App').default;
      render (NewApp);
    });
  }

  render(App);
})

ReactDOM.render (<Loading />, document.getElementById ('root'));
