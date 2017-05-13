import React, { Component } from 'react';
import './App.css';
import './Types.css';

import Console from './components/Console';
import Input from './components/Input';

import run, { bindConsole } from './lib/run';

class App extends Component {
  constructor(props) {
    super(props);
    // const foo = function (a, b, c) { console.log("ok") };
    // const bar = (name, ...rest) => console.log("ok");
    this.state = { commands: [
      // { value: new Promise((resolve) => { setTimeout(() => resolve(10), 200)}), open: false },
      // { value: { reallyLongProperty: { foo, body: document.body } }, open: true },
      { value: new Error('foo'), open: true, type: 'response', error: true },
      // { value: { body: document.body, foo }, open: true, },
      // { value: foo },
      // { value: bar },
      // { value: [1,2,3,,,, ]},
      // { value: { a: true } },
      // { open: false, value: { a: 1, b: true, c: document.body }},
      // { value: { a: { b: 1 } }, open: true },
      // { open: false, value: ["remy", 1, , [1,2,3,4,,,4], null, , , , "four", true, 2, { a: 1, b: "two" }] },
      // { open: false, value: [{ a: 1, b: "two" }, "remy", 1, , undefined, null, , , , "four", true, 2, ]}
    ] };

    this.onRun = this.onRun.bind(this);
  }

  onRun(command) {
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
    // const commands = this.state;
    // const index = Object.keys(commands).slice(-1).pop();
    // const next = (index || 0) * 1;
    // this.setState({ [next + 1]: res });
  }

  componentDidMount() {
    bindConsole(this.console);
  }

  render() {
    const commands = this.state.commands || [];
    return (
      <div
        onKeyDown={e => {
          this.input.focus();
        }}
        onClick={e => {
          this.input.focus();
        }} className="App"
      >
        <Console ref={e=>this.console=e} commands={commands} reverse={false} />
        <Input
          ref={e=>this.input=e}
          value={decodeURIComponent(window.location.search.substr(1))}
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
