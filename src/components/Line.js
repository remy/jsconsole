import React, { Component } from 'react';
import LineNav from './LineNav';
import which from '../lib/which-type';
import '../Line.css';

class Line extends Component {
  render() {
    const { command, value, open = false } = this.props

    const Type = which(value);

    return (<div className="Line">
      <LineNav value={value} command={command} />
      <Type value={value} shallow={false} open={open}>{ value }</Type>
    </div>);
  }
}

export default Line;
