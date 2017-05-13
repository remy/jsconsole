import React, { Component } from 'react';
import '../LineNav.css';
import CopyToClipboard from 'react-copy-to-clipboard';

class LineNav extends Component {
  constructor(props) {
    super(props);
    this.preCopy = this.preCopy.bind(this);
    const type = ({}).toString.call(props.value) || 'string';
    this.state = {
      text: null,
      type,
      copyAsHTML: type.includes('Element'),
    };
  }

  async preCopy() {
    // work out how we should copy this thing
    const original = this.props.value;
    let { value, type } = this.props;

    if (this.state.copyAsHTML) {
      this.setState({ text: value.outerHTML });
      return;
    }

    if (typeof value === 'function') {
      this.setState({ text: value.toString() });
      return;
    }

    if (typeof value === 'string') {
      this.setState({ text: value });
      return;
    }

    if (type === '[object Promise]') {
      const text = await value;
      this.setState({ text });
      return;
    }

    if (value instanceof Error || type === '[object Error]') {
      // get real props and add the stack no matter what (FF excludes it)
      value = Object.getOwnPropertyNames(value).reduce((acc, curr) => {
        acc[curr] = value[curr];
        return acc;
      }, {});

      value.stack = original.stack;
    }

    this.setState({ text: JSON.stringify(value, '', 2) });
  }

  render() {
    const { command, value } = this.props;
    const { text, copyAsHTML } = this.state;
    console.log(value, value instanceof Object, typeof value);
    const copyAs = typeof value === 'function' ?
      'Copy function' :
      copyAsHTML ?
        'Copy as HTML' :
        'Copy as JSON';
    // onCopy={e => console.log('copied', e)}
    return (
      <div className="LineNav">
        { value instanceof Object && <button onClick={e=>e.preventDefault()} className="icon search">
          search
        </button> }
        { command && <a title="Permalink" className="icon link" href={`?${escape(command)}`}>link</a> }
        <CopyToClipboard text={text}>
          <button title={copyAs} className="icon copy" onMouseDown={() => {
            if (text === null) {
              this.preCopy();
            }
          }}>copy</button>
        </CopyToClipboard>
      </div>
    );
  }
}

export default LineNav;
