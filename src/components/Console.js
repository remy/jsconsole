import React, { Component } from 'react';
import Line from './Line';

let guid = 0;
const getNext = () => guid++;

function AssertError(message) {
  this.name = 'Assertion fail';
  this.message = message;
  this.stack = (new Error()).stack;
}

AssertError.prototype = new Error();

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

  assert(test, ...rest) {
    if (!test) { // loosy
      let msg = rest.shift();
      if (msg === undefined) {
        msg = 'console.assert';
      }
      rest.unshift(new AssertError(msg));
      this.push({
        error: true,
        value: rest,
        type: 'log'
      });
      return;
    }
  }

  warn(...args) {
    return this.log.apply(this, args);
  }

  debug(...args) {
    return this.log.apply(this, args);
  }

  log(...args) {
    // check for interpolation into the string
    let [ string, ...rest ] = args;
    let styled = false;

    if (typeof string === 'string' && string.includes('%') && rest.length) {
      string = string.replace(/(%[scdif])/g, (key) => { // not supporting Object type
        if (key === '%s') { // string
          return rest.shift();
        }

        if (key === '%c') {
          styled = true;
          return `</span><span style="${rest.shift()}">`; // FIXME need to style the text somehow
        }

        if (key === '%i' || key === '%d' || key === '%f') {
          return;
        }
      });

      if (styled) {
        string = `<span>${string}</span>`;
      }

      args = [ string, ...rest ];
    }

    this.push({
      value: args,
      styled,
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
