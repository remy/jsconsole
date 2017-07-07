import React, { Component } from 'react';
import classnames from 'classnames';
import './App.css';
import './DarkTheme.css';
import './Types.css';

import Console from './components/Console';
import Input from './components/Input';

import run, { bindConsole } from './lib/run';
import internalCommands from './lib/internal-commands';

// this is lame, but it's a list of key.code that do stuff in the input that we _want_.
const doStuffKeys = /^(Digit|Key|Num|Period|Semi|Comma|Slash|IntlBackslash|Backspace|Delete|Enter)/;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { theme: 'dark', reverse: false };
    this.onRun = this.onRun.bind(this);
    this.triggerFocus = this.triggerFocus.bind(this);
  }

  async onRun(command) {
    const console = this.console;

    if (command[0] !== ':') {
      console.push({
        type: 'command',
        command,
        value: command,
      });
      const res = await run(command);
      console.push({
        command,
        type: 'response',
        ...res,
      });
      return;
    }

    const [cmd, ...args] = command.slice(1).split(' ');

    if (!internalCommands[cmd]) {
      console.push({
        command,
        error: true,
        value: new Error(`No such jsconsole command "${command}"`),
        type: 'response',
      });
      return;
    }

    let res = await internalCommands[cmd]({ args, console, app: this });

    if (typeof res === 'string') {
      res = { value: res };
    }

    console.push({
      command,
      type: 'log',
      ...res
    });

    return;
  }

  componentDidMount() {
    bindConsole(this.console);
    const query = decodeURIComponent(window.location.search.substr(1));
    if (query) {
      this.onRun(query);
    } else {
      this.onRun(':help');
    }
  }

  triggerFocus(e) {
    if (e.target.nodeName === 'INPUT') return;
    if (e.code && !doStuffKeys.test(e.code)) return;

    this.input.focus();
  }

  render() {
    const { commands = [] } = this.props;
    const { theme, reverse } = this.state;

    const className = classnames(['App', `theme-${theme}`, {
      top: reverse,
      bottom: !reverse,
    }]);

    return (
      <div tabIndex="-1" onKeyDown={this.triggerFocus} ref={e=>this.app=e} className={className}>
        <Console ref={e=>this.console=e} commands={commands} reverse={reverse} />
        <Input
          ref={e=>this.input=e}
          onRun={this.onRun}
          onClear={() => {
            this.console.clear();
          }}
        />
      </div>
    );
  }
}

export default App;
