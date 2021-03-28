import React, { Component } from 'react';
import ObjectType from './ObjectType';

class FunctionType extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: props.open,
    };
  }

  shouldComponentUpdate() {
    return false; // this prevents bananas amount of rendering
  }

  render() {
    const { value, shallow = true, allowOpen } = this.props;
    const { open } = this.state;

    // this gets the source of the function, regadless of whether
    // it has a function called ".toString", like lodash has!
    const code = Function.toString.call(value);

    // const native = code.indexOf('[native code') !== -1;
    let sig = code
      .substring(0, code.indexOf('{'))
      .trim()
      .replace(/\s/g, ' ');

    if (!sig) {
      // didn't match because it's an arrow func
      sig = code.substring(0, code.indexOf('=>')).trim() + ' =>';
    }

    sig = sig.replace(/^function/, 'ƒ');

    if (value.hasOwnProperty('toString')) {
      sig = `ƒ ${value.toString()}`;
    }

    const object = Object.getOwnPropertyNames(value).reduce((acc, curr) => {
      acc[curr] = value[curr];
      return acc;
    }, {});

    return (
      <ObjectType
        allowOpen={allowOpen}
        type="function"
        shallow={shallow}
        open={open}
        value={object}
        displayName={sig}
      />
    );
  }
}

export default FunctionType;
