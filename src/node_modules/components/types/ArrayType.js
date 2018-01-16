import React, { Component } from 'react';
import zip from 'lodash/zip';
import flatten from 'lodash/flatten';
import which from '../../lib/which-type';

class ArrayType extends Component {
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
    const { value, shallow = true, filter = null } = this.props;
    const { open } = this.state;

    let length = value.length;

    if (shallow && !open) {
      return (
        <div className="type ArrayType closed" onClick={this.toggle}>
          <em>Array</em>
          <span className="arb-info">({length})</span>
        </div>
      );
    }

    let types = value.slice(0, open ? value.length : 10).map((_, i) => {
      const Type = which(_);
      return (
        <Type
          allowOpen={open}
          key={`arrayType-${i + 1}`}
          shallow={true}
          value={_}
        >
          {_}
        </Type>
      );
    });

    // expose holes in the collapsed mode
    if (!open) {
      let count = 0;
      const newTypes = [];
      for (let i = 0; i < types.length; i++) {
        const hole = !(i in types);

        if (count !== 0 && !hole) {
          newTypes.push(
            <span key={`hole-${i}`} className="arb-info">
              &lt;undefined × {count}&gt;
            </span>
          );
          count = 0;
        } else if (hole) {
          count++;
        }

        if (!hole) {
          newTypes.push(types[i]);
        }
      }

      // if there are holes at the end
      if (count !== 0) {
        newTypes.push(
          <span key={`hole-${types.length}`} className="arb-info">
            &lt;undefined × {count}&gt;
          </span>
        );
      }

      types = newTypes;
    }

    if (!open && value.length > 10) {
      types.push(
        <span key="arrayType-0" className="more arb-info">
          …
        </span>
      );
    }

    if (!open) {
      // intersperce with commas
      types = flatten(
        zip(
          types,
          Array.from({ length: types.length - 1 }, (n, i) => (
            <span key={`sep-${i}`} className="sep">
              ,
            </span>
          ))
        )
      );

      // do mini output
      return (
        <div className="type ArrayType closed" onClick={this.toggle}>
          <em>Array</em>
          <span className="arb-info">({length})</span>[ {types} ]
        </div>
      );
    }

    // this is the full output view
    return (
      <div className="type ArrayType">
        <div onClick={this.toggle} className="header">
          <em>Array</em>
          <span className="arb-info">({length})</span>[
        </div>
        <div className="group">
          {types.map((type, i) => {
            if (
              filter === null ||
              filter === undefined ||
              filter === '' ||
              (value[i] + '').toLowerCase().includes(filter)
            ) {
              return (
                <div className="key-value" key={`subtype-${i}`}>
                  <span className="index">{i}:</span>
                  {type}
                </div>
              );
            }

            return null;
          })}
        </div>]
      </div>
    );
  }
}

export default ArrayType;
