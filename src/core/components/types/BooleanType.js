import React, { Component } from 'react';

import {getContainer} from '../../lib/run';

import ObjectType from './ObjectType';
class BooleanType extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: props.open,
    };
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { value, shallow = true, allowOpen } = this.props;
    const { open } = this.state;

    if(getContainer().contentWindow.Number.prototype===value){
      const object = Object.getOwnPropertyNames(value).reduce((acc, curr) => {
        try{
          acc[curr] = value[curr];
        } 
        catch(e){
          console.log(e);
        }
        return acc;
      }, {});
      return(
        <ObjectType
          allowOpen={allowOpen}
          type="object"
          shallow={shallow}
          open={open}
          value={object}
          displayName={'Number'}
        />
      );
    }

    return <div className="bool type">{value ? 'true' : 'false'}</div>;
  }
}

export default BooleanType;
