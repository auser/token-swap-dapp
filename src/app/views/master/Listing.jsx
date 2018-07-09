import React from 'react'

export class Listing extends React.Component {
  render() {
    const {title} = this.props;

    return (
      <div className="pure-u-1-1-">
        <h1>{title}</h1>
      </div>
    )
  }
}

export default Listing