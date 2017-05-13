import React, { Component } from 'react';
import LineNav from './LineNav';
import which from '../lib/which-type';
import '../Line.css';

class Line extends Component {
  shouldComponentUpdate() {
    return false; // this preents bananas amount of rendering
  }

  render() {
    const {
      type = 'response',
      value,
      command = null,
      error = false,
      open = false,
    } = this.props;
    let line = null;

    if (type === 'command') {
      line = <div className="prompt input">{ value }</div>;
    }

    if (type === 'log') {
      line = (
        <div className={`prompt output ${type} ${error ? 'error' : ''}`}>
          <LineNav value={value} command={command} />
        {
          (Array.isArray(value) ? value : [value]).map((value, i) => {
            const Type = which(value);
            return <Type key={`type-${i}`} allowOpen={true} value={value} shallow={false} open={open}>{ value }</Type>;
          })
        }
        </div>
      );
    }

    if (type === 'response') {
      const Type = which(value);
      line = (
        <div className={`prompt output ${type} ${error ? 'error' : ''}`}>
          <LineNav value={value} command={command} />
          <Type allowOpen={true} value={value} shallow={false} open={open}>{ value }</Type>
        </div>
      );
    }

    return <div className="Line">{ line }</div>;
  }
}

export default Line;
