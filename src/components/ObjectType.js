import React, { Component } from 'react';
import which from '../lib/which-type';

class ObjectType extends Component {
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
    const { open } = this.state;
    const { value } = this.props;

    if (!open) {
      return <div className="type object"><em onClick={this.toggle}>Object</em><span className="abr-info">{'{}'}</span></div>
    }

    const types = Object.keys(value).map((key, i) => {
      const Type = which(value[key]);
      return {
        key,
        value: <Type key={`arrayType-${i+1}`} value={value[key]}>{ value[key] }</Type>
      };
    });

    return <div className="type object">
      <em onClick={this.toggle}>Object</em><span className="abr-info">{'{'}</span>
      <div className="group">{
        types.map((obj, i) => {
          return (
            <div className="object-item key-value" key={`subtype-${i}`}>
              <span className="key">{obj.key}:</span>
              <span className="value">{ obj.value }</span>
            </div>
          )
        })
      }</div>
      <span className="abr-info">{'}'}</span>
    </div>
  }
}

export default ObjectType;

