import React, { Component } from 'react';

class NullType extends Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div className="type null">null</div>;
  }
}

export default NullType;
