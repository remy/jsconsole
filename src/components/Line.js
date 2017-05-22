import React, { Component } from 'react';
import LineNav from './LineNav';
import which from '../lib/which-type';
import '../Line.css';

class Line extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: null,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.filter !== nextState.filter) {
      return true;
    }

    return false; // this prevents bananas amount of rendering
  }

  render() {
    const {
      type = 'response',
      value,
      command = null,
      error = false,
      open = false,
    } = this.props;
    let line = null;

    const { filter } = this.state;

    if (type === 'command') {
      line = <div className="prompt input">{ value }</div>;
    }

    if (type === 'log') {
      line = (
        <div className={`prompt output ${type} ${error ? 'error' : ''}`}>
          <LineNav value={value} command={command} />
        {
          (Array.isArray(value) ? value : [value]).map((value, i) => {
            const Type = which(value);
            return <Type key={`type-${i}`} allowOpen={true} value={value} shallow={false} open={open}>{ value }</Type>;
          })
        }
        </div>
      );
    }

    if (type === 'response') {
      const Type = which(value);
      line = (
        <div className={`prompt output ${type} ${error ? 'error' : ''}`}>

          <LineNav onFilter={filter => {
            this.setState({ filter });
          }} value={value} command={command} />

          <Type allowOpen={true} value={value} filter={filter} shallow={false} open={open}>{ value }</Type>
        </div>
      );
    }

    return <div className="Line">{ line }</div>;
  }
}

export default Line;
