import React from 'react'

import {Link} from 'react-router-dom'

export const Home = (props) => (
  <div className="pure-g">
    <div className="pure-u-1-1">
      <p>
        Welcome to the Shopin Token Swap DApp. Check with your syndicate lead
        for a unique link to claim your SHOPIN Tokens. If you're unsure who that is,
        please contact us at <a href="mailto:kyc@shopin.com">kyc@shopin.com</a>.
      </p>
    </div>

    <div className="pure-u-1-1">
      <p>
        If you're a syndicate and you have not deployed your swap contract yet,
        please visit the <Link to="/syndicate">syndicate page</Link>.
      </p>
    </div>
  </div>
)

export default Home
