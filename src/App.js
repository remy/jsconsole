import React, { Component } from 'react';
import './App.css';
import './Types.css';

import Line from './components/Line';
import Input from './components/Input';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commands: [
        { value: [1,2,3 ]},
        { value: { a: true } },
        { open: true, value: { a: 1, b: true, c: document.body }},
        { open: false, value: ["remy", 1, , [1,2,3,4,,,4], null, , , , "four", true, 2, { a: 1, b: "two" }] },
        { open: false, value: ["remy", 1, , undefined, null, , , , "four", true, 2, { a: 1, b: "two" }]}
      ],
    };
  }
  render() {
    const { commands } = this.state;
    return (
      <div className="App">
        <Input onRun={string => {
          this.setState({ commands: [ {
            value: string
          }, ...commands ] })
        }} />
        { commands.map((_, i) => <Line key={`line-${i}`} {... _ } />)}
      </div>
    );
  }
}

export default App;
