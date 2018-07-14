import React from 'react'
import {Redirect} from 'react-router-dom'
import Loading from '../components/Loading'

export const isOwner = Wrapped => {
  class Wrapper extends React.Component {

    constructor(props) {
      super(props);

      this.state = {
        loading: true,
        allowed: false
      }
    }

    isOwner = async () => {
      const {accounts, controller} = this.props;
      const owner = await controller.owner();

      this.setState({
        allowed: accounts[0] === owner, 
        loading: false
      })
    }

    componentWillMount() {
      this.isOwner()
    }

    render() {
      if (this.state.loading) {
        return (<Loading />)
      }

      if (!this.state.allowed) {
        return (<Redirect to="/" />)
      }

      return (
        <Wrapped {...this.props} />
      )
    }
  }

  return Wrapper
}

export default isOwner