import React, { Component } from 'react';
// import Autocomplete from './Autocomplete'
import keycodes from '../lib/keycodes';
import '../Input.css';

// not in state because we don't want a re-render on change
const history = [];
let historyCursor = 0;

/*
const getCursor = field => {
  if (field.selectionStart) {
    return field.selectionStart;
  }
  if (field.createTextRange) {
    var range = field.createTextRange();
    return range.startOffset;
  }
};
*/


class Line extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      multiline: false,
    };
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.focus = this.focus.bind(this);
  }

  onChange() {
    const { value } = this.input;
    const length = value.split('\n').length;
    this.setState({ value, multiline: length > 1 });
    this.input.rows = length < 20 ? length : 20;
  }

  async onKeyPress(e) {
    const code = keycodes[e.keyCode];
    const { multiline } = this.state;

    // FIXME in multiline, cursor up when we're at the top
    // const cursor = getCursor(this.input);

    if (e.ctrlKey && code === 'l') {
      this.props.onClear();
      return;
    }

    if (!multiline) {
      if (code === 'up arrow') {
        historyCursor--;
        if (historyCursor < 0) {
          historyCursor = 0;
          return;
        }
        this.input.value = history[historyCursor];
        this.onChange();
        e.preventDefault();
        return;
      }

      if (code === 'down arrow') {
        if (historyCursor === (history.length - 1)) {
          this.input.value = '';
          return;
        }
        historyCursor++;
        this.input.value = history[historyCursor];
        this.onChange();
        e.preventDefault();
        return;
      }
    }

    const command = this.input.value;

    if (code === 'enter') {
      if (e.shiftKey) {
        return;
      }

      if (!command) {
        e.preventDefault();
        return;
      }

      history.push(command);
      historyCursor = history.length;
      e.preventDefault();
      await this.props.onRun(command);
      this.input.value = '';
      this.onChange();
      return;
    }
  }

  focus() {
    this.input.focus();
  }

  componentDidUpdate() {
    // wonder if this is a noop?
    this.input.scrollIntoView();
  }

  render() {
    // <Autocomplete value={this.state.value} />
    return (<div className="Input">
      <textarea
        className="cli"
        rows="1"
        autoFocus
        ref={e=>this.input=e}
        defaultValue={this.state.value}
        onChange={this.onChange}
        onKeyDown={this.onKeyPress}
      ></textarea>
    </div>);
  }
}

export default Line;
