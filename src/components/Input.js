import React, { Component } from 'react';

// import Autocomplete from './Autocomplete'
import keycodes from '../lib/keycodes';
import '../Input.css';

const storageKey = 'jsconsole.history';

class Input extends Component {
  constructor(props) {
    super(props);

    // history is set in the componentDidMount
    this.state = {
      value: props.value || '',
      multiline: false,
      historyCursor: props.history.length,
    };
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
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
    const { history } = this.props;
    let { historyCursor } = this.state;

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
          this.setState({ historyCursor: 0 });
          return;
        }
        this.setState({ historyCursor });
        this.input.value = history[historyCursor];
        this.onChange();
        e.preventDefault();
        return;
      }

      if (code === 'down arrow') {
        historyCursor++;
        if (historyCursor >= history.length) {
          this.setState({ historyCursor: history.length });
          this.input.value = '';
          return;
        }
        this.setState({ historyCursor });
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

      this.props.addHistory(command);
      this.setState({ historyCursor: history.length + 1 });
      e.preventDefault();
      await this.props.onRun(command);
      this.input.value = '';
      this.onChange();
      return;
    }
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
        ref={e=> {
          this.input = e;
          this.props.inputRef(e);
        }}
        defaultValue={this.state.value}
        onChange={this.onChange}
        onKeyDown={this.onKeyPress}
      ></textarea>
    </div>);
  }
}

export default Input;
