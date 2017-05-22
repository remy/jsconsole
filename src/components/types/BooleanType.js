import React, { Component } from 'react';

class BooleanType extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { value } = this.props;
    return <div className="bool type">{value ? 'true' : 'false'}</div>;
  }
}

export default BooleanType;
