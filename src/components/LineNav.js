import React, { Component } from 'react';
import '../LineNav.css';
import CopyToClipboard from 'react-copy-to-clipboard';

class LineNav extends Component {
  constructor(props) {
    super(props);
    this.preCopy = this.preCopy.bind(this)
    this.state = {
      text: null,
      copyAsHTML: props.value instanceof HTMLElement
    }
  }

  preCopy() {
    // work out how we should copy this thing
    const { value } = this.props;

    if (this.state.copyAsHTML) {
      this.setState({ text: value.outerHTML });
      return;
    }

    if (typeof value === 'function') {
      this.setState({ text: value.toString() });
      return;
    }

    this.setState({ text: JSON.stringify(value, '', 2) });
  }

  render() {
    const { command, value } = this.props;
    const { text, copyAsHTML } = this.state;

    const copyAs = typeof value === 'function' ?
      'Copy function' :
      copyAsHTML ?
        'Copy as HTML' :
        'Copy as JSON';

    return (
      <div className="LineNav">
        <button onClick={e=>e.preventDefault()} className="icon search">
          search
        </button>
        <CopyToClipboard text={text} onCopy={e => console.log('copied', e)}>
          <button title={copyAs} className="icon copy" onMouseDown={() => {
            if (text === null) {
              this.preCopy()
            }
          }}>copy</button>
        </CopyToClipboard>
        <a title="Permalink" className="icon link" href={`?${escape(command)}`}>link</a>
      </div>
    );
  }
}

export default LineNav;
