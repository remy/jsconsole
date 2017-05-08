import React, { Component } from 'react';
import which from '../lib/which-type';
import '../Line.css';

class Line extends Component {
  render() {
    const { value, open = false } = this.props

    const Type = which(value);

    return (<div className="Line">
      <Type value={value} shallow={false} open={open}>{ value }</Type>
    </div>);
  }
}

export default Line;
