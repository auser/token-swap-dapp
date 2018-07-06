import React from 'react'
import {Link} from 'react-router-dom'

// import WhitelistedInstructions from '../../components/WhitelistedInstructions'
// import NotWhitelisted from '../../components/NotWhitelisted'

export const Home = (props) => (
  <div className="App">
    <nav className="navbar pure-menu pure-menu-horizontal">
      <a href="#" className="pure-menu-heading pure-menu-link">
        Shopin token swap
      </a>
    </nav>

    <main className="container">
      <div className="pure-g">
        <div className="pure-u-1-1">
          <h1>Welcome</h1>
          <p>
            If you're a syndicate and you have not received token factory of your own, head over to the syndicate page: <Link to="/syndicate">/syndicate</Link>.
          </p>
        </div>
      </div>
    </main>
  </div>
)

export default Home