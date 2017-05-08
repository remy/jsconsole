import React, { Component } from 'react';
import keycodes from '../lib/keycodes';
import '../Input.css';

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

    if (code === 'enter') {
      console.log('sending command');
      this.props.onRun(e.target.value);
      e.target.value = '';
      return;
    }
  }

  render() {
    return (<div className="Input">
      <input ref={e=>this.input=e} type="text" onChange={this.onChange} onKeyDown={this.onKeyPress} />
    </div>);
  }
}

export default Line;
