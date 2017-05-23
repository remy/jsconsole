import React, { Component } from 'react';
import './App.css';
import './Types.css';

import Console from './components/Console';
import Input from './components/Input';

import run, { bindConsole } from './lib/run';
import internalCommands from './lib/internal-commands';

class App extends Component {
  constructor(props) {
    super(props);
    // const foo = function (a, b, c) { console.log("ok") };
    // const bar = (name, ...rest) => console.log("ok");
    this.state = { commands: [] };
      // { value: internalCommands.help(), type: 'log' },
      // { value: document, open: true, type: 'response' },
      // { value: new Promise((resolve) => { setTimeout(() => resolve(10), 200)}), open: false },
      // { value: { reallyLongProperty: { foo, body: document.body } }, open: true },
      // { value: new Error('foo'), open: true, type: 'response', error: true },
      // { value: { body: document.body, foo }, open: true, },
      // { value: foo },
      // { value: bar },
      // { value: [1,2,3,,,, ]},
      // { value: { a: true } },
      // { open: false, value: { a: 1, b: true, c: document.body }},
      // { value: { a: { b: 1 } }, open: true },
      // { open: false, value: ["remy", 1, , [1,2,3,4,,,4], null, , , , "four", true, 2, { a: 1, b: "two" }] },
      // { open: false, value: [{ a: 1, b: "two" }, "remy", 1, , undefined, null, , , , "four", true, 2, ]}
    // ] };

    this.onRun = this.onRun.bind(this);
  }

  async onRun(command) {
    if (!command.startsWith(':')) {
      this.console.push({
        type: 'command',
        command,
        value: command,
      });
      const res = run(command);
      this.console.push({
        command,
        value: res.value,
        error: res.error,
        type: 'response',
      });
      return;
    }

    const [cmd, ...args] = command.slice(1).split(' ');

    if (!internalCommands[cmd]) {
      this.console.push({
        command,
        error: true,
        value: new Error(`No such jsconsole command "${command}"`),
        type: 'response',
      });
      return;
    }

    const value = await internalCommands[cmd].call(null, { urls: args, console: this.console });
    this.console.push({
      command,
      value,
      type: 'log',
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

  render() {
    const commands = this.state.commands || [];
    const reverse = false;
    return (
      <div
        onKeyDown={() => {
          this.input.focus();
        }}
        onClick={() => {
          this.input.focus();
        }}
        className={`App ${reverse ? 'top' : 'bottom'}`}
      >
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
