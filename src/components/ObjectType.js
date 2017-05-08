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
    const { value, shallow = true, type = 'object' } = this.props;
    let { displayName } = this.props;

    if (!displayName) {
      displayName = value.constructor ? value.constructor.name : 'Object';
    }

    if (!open || shallow) {
      return <div className={`type ${type}`}><em onClick={this.toggle}>{ displayName }</em></div>
    }

    const types = Object.keys(value).map((key, i) => {
      const Type = which(value[key]);
      return {
        key,
        value: <Type key={`arrayType-${i+1}`} shallow={shallow} value={value[key]}>{ value[key] }</Type>
      };
    });

    // then try to find more keys
    // Object.keys(value.__proto__).forEach((key, i) => {
    //   if (value[key] !== value.__proto__[key]) {
    //     const Type = which(value.__proto__[key]);
    //     types.push({
    //       key,
    //       value: <Type key={`arrayType-${types.length+1}`} shallow={shallow} value={value.__proto__[key]}>{ value.__proto__[key] }</Type>
    //     })
    //   }
    // });

    return (
    <div className={`type ${type}`}>
      <div className="header">
        <em onClick={this.toggle}>{ displayName }</em>
        <span className="abr-info">{'{'}</span>
      </div>
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
    )
  }
}

export default ObjectType;

