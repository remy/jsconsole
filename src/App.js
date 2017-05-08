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
    this.state = Object.assign({}, [
        { value: document, open: true, },
        // { value: foo },
        // { value: bar },
        // { value: [1,2,3 ]},
        // { value: { a: true } },
        // { open: true, value: { a: 1, b: true, c: document.body }},
        // { open: false, value: ["remy", 1, , [1,2,3,4,,,4], null, , , , "four", true, 2, { a: 1, b: "two" }] },
        { open: false, value: ["remy", 1, , undefined, null, , , , "four", true, 2, { a: 1, b: "two" }]}
    ]);
  }
  render() {
    const commands = this.state || {};
    return (
      <div className="App">
        <Input
          onRun={string => {
            const value = run(string);
            const next = (Object.keys(commands).slice(-1).pop() || 0) * 1;
            this.setState({ [next + 1]: {
              value,
              command: string,
            }})
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
