import React, { Component } from 'react';

class NumberType extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { value } = this.props;
    return <div className="type number">{value}</div>;
  }
}

export default NumberType;
