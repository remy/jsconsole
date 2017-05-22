import React, { Component } from 'react';
import ObjectType from './ObjectType';

class ErrorType extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: props.open,
    };
  }

  render() {
    const { value, shallow = true, allowOpen } = this.props;
    const { open } = this.state;

    const sig = value.name || value.constructor.name;
    console.log(sig, value.message);

    return <ObjectType allowOpen={allowOpen} type="error" shallow={shallow} open={open} value={value} displayName={ sig } />;
  }
}

export default ErrorType;
