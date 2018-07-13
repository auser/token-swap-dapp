import React from 'react';
import {Provider} from 'react-redux'
import createStore from './redux'
import Routes from './routes'

import {withWeb3} from './app/hocs/withWeb3'


import './css/pure-min.css';
import './css/montserrat.css';
import './css/roboto.css';

import './css/switch.css';
import './css/app.css';

export const App = (props) => {
  const store = createStore();

  const WrappedRoutes = withWeb3(Routes)

  return (
  <Provider store={store}>
    <WrappedRoutes {...props} />
  </Provider>)
}
export default App
