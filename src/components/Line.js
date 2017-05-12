import React, { Component } from 'react';
import LineNav from './LineNav';
import which from '../lib/which-type';
import '../Line.css';

class Line extends Component {
  shouldComponentUpdate() {
    return false; // this preents bananas amount of rendering
  }

  render() {
    const { type = 'response', value, open = false } = this.props;
    // const { command, error, value, values = null, open = false } = this.props;

    let line = null;

    if (type === 'command') {
      line = <div className="prompt input">{ value }</div>;
    }

    if (type === 'log') {
      line = (
        <div className={`prompt output ${type}`}>
          <LineNav value={value} />
        {
          value.map((value, i) => {
            const Type = which(value);
            return <Type key={`type-${i}`} allowOpen={true} value={value} shallow={false} open={open}>{ value }</Type>;
          })
        }
        </div>
      );
    }

    if (type === 'response' || type === 'error') {
      const Type = which(value);
      line = (
        <div className={`prompt output ${type}`}>
          <LineNav value={value} />
          <Type allowOpen={true} value={value} shallow={false} open={open}>{ value }</Type>
        </div>
      );
    }

    return <div className="Line">{ line }</div>;
  }
}

export default Line;
