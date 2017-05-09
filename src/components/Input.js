import React, { Component } from 'react';
import keycodes from '../lib/keycodes';
import '../Input.css';

// not in state because we don't want a re-render on change
const history = [];
let historyCursor = 0;

class Line extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  onChange() {

  }

  onKeyPress(e) {
    const code = keycodes[e.keyCode];

    if (e.ctrlKey && code === 'l') {
      this.props.onClear();
      return;
    }

    if (code === 'up arrow') {
      historyCursor--;
      if (historyCursor < 0) {
        historyCursor = 0;
        return;
      }
      this.input.value = history[historyCursor];
      return;
    }

    if (code === 'down arrow') {
      if (historyCursor === (history.length - 1)) {
        this.input.value = '';
        return;
      }
      historyCursor++;
      this.input.value = history[historyCursor];
      return;

    }

    const command = this.input.value;

    if (code === 'enter') {
      history.push(command);
      historyCursor = history.length;
      this.props.onRun(command);
      e.target.value = '';
      return;
    }
  }

  render() {
    return (<div className="Input">
      <input autoFocus ref={e=>this.input=e} type="text" onChange={this.onChange} onKeyDown={this.onKeyPress} />
    </div>);
  }
}

export default Line;
