import React, { Component } from 'react';
import Entry from './EntryType';
import zip from 'lodash/zip';
import flatten from 'lodash/flatten';

class SetType extends Component {
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
    const { value, shallow = true } = this.props;
    const { open } = this.state;
    let { displayName } = this.props;

    if (!displayName) {
      displayName = value.constructor ? value.constructor.name : 'Object';
    }

    let length = value.size;

    if (shallow && !open) {
      return (
        <div className="type ArrayType closed" onClick={this.toggle}>
          <em>{displayName}</em>
          <span className="arb-info">({length})</span>
        </div>
      );
    }

    let types = [];
    let i = 0;

    for (let entry of value.entries()) {
      types.push(
        <Entry
          key={`setTypeKey-${i + 1}`}
          shallow={true}
          value={entry}
          allowOpen={open}
        />
      );
      i++;
      if (!open && i === 10) {
        break;
      }
    }

    if (!open && length > 10) {
      types.push(
        <span key="setTypeMore-0" className="more arb-info">
          …
        </span>
      );
    }

    if (!open) {
      // intersperce with commas
      types = flatten(
        zip(
          types,
          Array.from({ length: length - 1 }, (n, i) => (
            <span key={`sep-${i}`} className="sep">
              ,
            </span>
          ))
        )
      );

      // do mini output
      return (
        <div className="type set closed" onClick={this.toggle}>
          <em>{displayName}</em>
          <span className="arb-info">({length})</span>
          <span> {'{'} </span>
          {types.map((type, i) => (
            <div className="key-value" key={`subtype-${i}`}>
              {type}
            </div>
          ))}
          <span> {'}'}</span>
        </div>
      );
    }

    return (
      <div className="type set" onClick={this.toggle}>
        <em>{displayName}</em>
        <span className="arb-info">({length})</span>
        <span> {'{'} </span>
        <div className="group">
          <span className="arb-info">[[Entries]]:</span>
          {types.map((type, i) => (
            <div className="key-value" key={`subtype-${i}`}>
              <span className="index">{i}:</span>
              {type}
            </div>
          ))}
        </div>
        <span> {'}'}</span>
      </div>
    );
  }
}

export default SetType;
