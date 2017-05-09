import React, { Component } from 'react';
import LineNav from './LineNav';
import which from '../lib/which-type';
import '../Line.css';

class Line extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return false; // this preents bananas amount of rendering
  }

  render() {
    const { command, value, open = false } = this.props

    const Type = which(value);

    return (
      <div className="Line">
        <LineNav value={value} command={command} />
        { command && <div className="prompt input">{ command }</div> }
        <div className="prompt output">
          <Type value={value} shallow={false} open={open}>{ value }</Type>
        </div>
      </div>
    );
  }
}

export default Line;
