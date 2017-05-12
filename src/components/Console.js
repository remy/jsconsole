import React, { Component } from 'react';
import Line from './Line';

let guid = 0;
const getNext = () => guid++;

class Console extends Component {
  constructor(props) {
    super(props);
    this.state = (props.commands || []).reduce((acc, curr) => {
      acc[getNext()] = curr;
      return acc;
    }, {});
    this.log = this.log.bind(this);
    this.clear = this.clear.bind(this);
    this.push = this.push.bind(this);
  }

  push(command) {
    const next = getNext();
    this.setState({ [next]: command });
  }

  clear() {
    this.state = {};
    this.forceUpdate();
  }

  log(...args) {
    this.push({
      value: args,
      type: 'log',
    });
  }

  render() {
    const commands = this.state || {};
    const keys = Object.keys(commands);
    if (this.props.reverse) {
      keys.reverse();
    }

    return (
      <div className="react-console-container" onClick={e => {
        e.stopPropagation(); // prevent the focus on the input element
      }}>
        { keys.map(_ => <Line key={`line-${_}`} {... commands[_] } />) }
      </div>
    );
  }
}

export default Console;
