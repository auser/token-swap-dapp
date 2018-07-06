import React from 'react'
// import { Link } from 'react-router-dom'
import Loading from '../../components/Loading'

const InvalidAddress = () => (
  <div className="pure-u-1-1">
    <h1>Invalid address</h1>
    <p>
      Check with your group for the exact url.
    </p>
  </div>
)
export class Investor extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      contractFound: false,
      contractIndex: null
    }
  }

  componentWillMount() {
    const {match, factory} = this.props;
    const {id} = match.params;
    factory.contractIndexForName(id)
    .then(([contractFound, contractIndex]) => {
      this.setState({
        loaded: true,
        contractFound,
        contractIndex
      })
    })
    .catch(() => this.setState({loaded: false}))
  }

  render() {
    const {loaded, contractFound} = this.state;

    if (!loaded) return <Loading />
    if (!contractFound) return <InvalidAddress />
    
    return (
      <div className="pure-g">
        <div className="pure-u-1-1">
          <h1>Investor view</h1>
          <pre>
            {JSON.stringify(contractFound, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
}

export default Investor