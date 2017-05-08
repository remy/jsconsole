import React, { Component } from 'react';
import './App.css';
import './Types.css';

import Line from './components/Line';
import Input from './components/Input';

function run(code) {
  const fn = new Function(`return ${code}`);
  let value = undefined;
  try {
    value = fn();
  } catch (e) {
    value = e;
  }
  return value;
}

class App extends Component {
  constructor(props) {
    super(props);
    const foo = function (a, b, c) { console.log("ok") };
    const bar = (name, ...rest) => console.log("ok");
    this.state = {
      commands: [
        { value: { _: window._ }, open: true, },
        // { value: foo },
        // { value: bar },
        // { value: [1,2,3 ]},
        // { value: { a: true } },
        // { open: true, value: { a: 1, b: true, c: document.body }},
        // { open: false, value: ["remy", 1, , [1,2,3,4,,,4], null, , , , "four", true, 2, { a: 1, b: "two" }] },
        { open: false, value: ["remy", 1, , undefined, null, , , , "four", true, 2, { a: 1, b: "two" }]}
      ],
    };
  }
  render() {
    const { commands } = this.state;
    return (
      <div className="App">
        <Input
          onRun={string => {
            const value = run(string);
            this.setState({ commands: [ {
              value,
              command: string,
            }, ...commands ] })
          }}
          onClear={() => {
            this.setState({ commands: [] })
          }}
        />
        { commands.map((_, i) => <Line key={`line-${i}`} {... _ } />)}
      </div>
    );
  }
}

export default App;
