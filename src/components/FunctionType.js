import React, { Component } from 'react';
// import which from '../lib/which-type';

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

    const code = (Function).toString.call(value);
    const native = code.indexOf('[native code') !== -1;
    const sig = code.substring(0, code.indexOf(')') + 1).replace(/\s/g, ' ');
    const props = Object.keys(value);

    return <div className="function type">{ sig }</div>
  }
}

export default FunctionType;
