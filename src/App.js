import React, { Component } from 'react';
import './App.css';
import './Types.css';

import Line from './components/Line';
import Input from './components/Input';

import run from './lib/run';

var myMap = new Map();

var keyString = 'a string',
    keyObj = {},
    keyFunc = function() {};

// setting the values
myMap.set(keyString, "value associated with 'a string'");
myMap.set(keyObj, 'value associated with keyObj');
myMap.set(keyFunc, 'value associated with keyFunc');

myMap.size; // 3

// getting the values
myMap.get(keyString);    // "value associated with 'a string'"
myMap.get(keyObj);       // "value associated with keyObj"
myMap.get(keyFunc);      // "value associated with keyFunc"

myMap.get('a string');   // "value associated with 'a string'"
                         // because keyString === 'a string'
myMap.get({});           // undefined, because keyObj !== {}
myMap.get(function() {}) // undefined, because keyFunc !== function () {}


class App extends Component {
  constructor(props) {
    super(props);
    const foo = function (a, b, c) { console.log("ok") };
    const bar = (name, ...rest) => console.log("ok");
    this.state = Object.assign({}, [
      { value: { reallyLongProperty: { foo, body: document.body } }, open: true },
      { value: myMap, open: false },
      { value: new Error('foo'), open: true, error: true, }
        // { value: { body: document.body, foo }, open: true, },
        // { value: foo },
        // { value: bar },
        // { value: [1,2,3,,,, ]},
        // { value: { a: true } },
        // { open: false, value: { a: 1, b: true, c: document.body }},
        // { value: { a: { b: 1 } }, open: true },
        // { open: false, value: ["remy", 1, , [1,2,3,4,,,4], null, , , , "four", true, 2, { a: 1, b: "two" }] },
        // { open: false, value: [{ a: 1, b: "two" }, "remy", 1, , undefined, null, , , , "four", true, 2, ]}
    ]);

    this.onRun = this.onRun.bind(this);
  }

  onRun(command) {
    const res = run(command);
    const commands = this.state;
    const index = Object.keys(commands).slice(-1).pop();
    const next = (index || 0) * 1;
    this.setState({ [next + 1]: res });
  }

  render() {
    const commands = this.state || {};
    return (
      <div className="App">
        <Input
          value={window.location.search.substr(1)}
          onRun={this.onRun}
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
