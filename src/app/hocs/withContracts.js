import React from 'react';

import loadContracts from '../contracts';

import {connect} from 'react-redux';
import Loading from '../components/Loading';

export const withContracts = Wrapped => {
  class Wrapper extends React.Component {
    componentWillMount () {
      const {web3} = this.props;
      loadContracts (web3.web3).then (contracts => {
        this.contracts = contracts;
      });
    }
    render () {
      if (!this.contracts) {
        return <Loading />;
      }

      return <Wrapped {...this.contracts} {...this.props} />;
    }
  }

  const mapStateToProps = ({web3}) => ({
    web3,
  });
  const mapDispatchToProps = dispatch => ({});
  return connect (mapStateToProps, mapDispatchToProps) (Wrapper);
};

export default withContracts;
