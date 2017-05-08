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

    // this gets the source of the function, regadless of whether
    // it has a function called ".toString", like lodash has!
    const code = Function.toString.call(value);
    // const native = code.indexOf('[native code') !== -1;
    const sig = code.substring(0, code.indexOf(')') + 1).replace(/\s/g, ' ');
    for (let f in value) {
      console.log(f);
    }

    const props = Object.getOwnPropertyNames(value);
    const object = props.reduce((acc, curr) => {
      acc[curr] = props[curr];
      return acc;
    }, {});

    return <div><ObjectType type="function" shallow={shallow} open={open} value={object} displayName={ sig } /></div>;
  }
}

export default FunctionType;
