import React from 'react'

export class Listing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newAddress: ''
    }
  }

  handleChange = async (evt) => {
    evt.preventDefault();
    this.setState({
      newAddress: evt.target.value
    })
  }

  handleSubmit = async (evt) => {
    evt.preventDefault();
    const {newAddress} = this.state;
    this.setState({newAddress: ''})
    this.props.onAdd(newAddress)
  }

  handleRemove = async (addr, evt) => {
    evt.preventDefault();
    this.props.onRemove(addr);
  }

  render() {
    const {title, list} = this.props;

    return (
      <div className="pure-u-1-1-">
        <h3>{title}</h3>
          {
            list.map(item => (
              <p key={item}>
                <div className="pure-u-1-2">
                  {item}
                </div>
                <div className="pure-u-1-2">
                  <button
                    onClick={this.handleRemove.bind(this, item)}
                    className="pure-button">
                    Remove
                  </button>
                </div>
              </p>
            ))
          }

        <form className="pure-form" onSubmit={this.handleSubmit}>
          <fieldset>
            <legend>Add to token whitelist</legend>

            <input
              type="text"
              placeholder="address"
              value={this.state.newAddress}
              onChange={this.handleChange} />

            <button
              type="submit"
              className="pure-button pure-button-primary">
                Add to token whitelist
            </button>
          </fieldset>
        </form>
      </div>
    )
  }
}

export default Listing
