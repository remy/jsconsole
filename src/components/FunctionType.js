import React, { Component } from 'react';
import ObjectType from './ObjectType';

class FunctionType extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);

    this.state = {
      open: props.open,
    };
  }

  toggle(e) {
    e.preventDefault();
    this.setState({ open: !this.state.open });
  }

  render() {
    const { value, shallow = true } = this.props;
    const { open } = this.state;

    console.log('fn.length: %s', value.length);

    // this gets the source of the function, regadless of whether
    // it has a function called ".toString", like lodash has!
    const code = Function.toString.call(value);
    // const native = code.indexOf('[native code') !== -1;
    let sig = code.substring(0, code.indexOf('{') - 1).trim().replace(/\s/g, ' ');

    if (!sig) { // didn't match because it's an arrow func
      sig = code.substring(0, code.indexOf('=>')).trim() + ' =>';
    }

    // FIXME: a => 'ok' (length: 2) ¯\_(ツ)_/¯

    const object = Object.getOwnPropertyNames(value).reduce((acc, curr) => {
      acc[curr] = value[curr];
      return acc;
    }, {});

    return <div><ObjectType type="function" shallow={shallow} open={open} value={object} displayName={ sig } /></div>;
  }
}

export default FunctionType;
