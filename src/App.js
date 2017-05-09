import React, { Component } from 'react';
import './App.css';
import './Types.css';

import Line from './components/Line';
import Input from './components/Input';

function run(command) {
  const res = {
    error: false,
    command,
  };
  try {
    // trick from devtools, via
    // https://twitter.com/RReverser/status/861922999540355072
    if (command[0] === '{') {
      command = `(${command})`;
    }
    res.value = window.eval(command);

    // TODO move out
    window.$_ = res.value;
  } catch (e) {
    res.error = true;
    res.value = e;
  }
  return res;
}

class App extends Component {
  constructor(props) {
    super(props);
    const foo = function (a, b, c) { console.log("ok") };
    // const bar = (name, ...rest) => console.log("ok");
    this.state = Object.assign({}, [
        { value: { body: document.body, foo }, open: true, },
        { value: { a: { b: 1 } } },
        // { value: foo },
        // { value: bar },
        { value: [1,2,3,,,, ]},
        // { value: { a: true } },
        { open: false, value: { a: 1, b: true, c: document.body }},
        // { open: false, value: ["remy", 1, , [1,2,3,4,,,4], null, , , , "four", true, 2, { a: 1, b: "two" }] },
        // { open: false, value: [{ a: 1, b: "two" }, "remy", 1, , undefined, null, , , , "four", true, 2, ]}
    ]);
  }
  render() {
    const commands = this.state || {};
    return (
      <div className="App">
        <Input
          onRun={string => {
            const res = run(string);
            const next = (Object.keys(commands).slice(-1).pop() || 0) * 1;
            this.setState({ [next + 1]: res })
          }}
          onClear={() => {
            this.state = {};
            this.forceUpdate();
          }}
        />
        { Object
            .keys(commands)
            .reverse()
            .map((_, i) => <Line key={`line-${_}`} {... commands[_] } />)
        }
      </div>
    );
  }
}

export default App;
