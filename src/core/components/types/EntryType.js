import React, { Component } from 'react';
import which from '../../lib/which-type';

class EntryType extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);

    this.state = {
      open: props.open,
    };
  }

  toggle(e) {
    if (!this.props.allowOpen) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    this.setState({ open: !this.state.open });
  }

  render() {
    // const { shallow = true } = this.props;
    const entry = this.props.value;
    const { open } = this.state;

    const [key, value] = entry;

    const Key = which(key);
    const Value = which(value);

    if (!open) {
      return (
        <div onClick={this.toggle} className="type entry closed">
          <div className="object-item key-value">
            <span className="key">
              <Key allowOpen={open} value={key} />
            </span>
            <span className="arb-info">=> </span>
            <span className="value">
              <Value allowOpen={open} value={value} />
            </span>
          </div>
        </div>
      );
    }

    return (
      <div onClick={this.toggle} className="type entry">
        <span>{'{'}</span>
        <div className="group">
          <div className="object-item key-value">
            <span className="key">key:</span>
            <span className="value">
              <Key allowOpen={open} value={key} />
            </span>
          </div>
          <div className="object-item key-value">
            <span className="key">value:</span>
            <span className="value">
              <Value allowOpen={open} value={value} />
            </span>
          </div>
        </div>
        <span>{'}'}</span>
      </div>
    );
  }
}

export default EntryType;
