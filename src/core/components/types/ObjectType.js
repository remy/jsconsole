import React, { Component } from 'react';
import which from '../../lib/which-type';
import StringType from './StringType';
import zip from 'lodash/zip';
import flatten from 'lodash/flatten';

const LIMIT_CLOSED = 5;

function* enumerate(obj) {
  let visited = new Set();
  while (obj) {
    for (let key of Reflect.ownKeys(obj)) {
      if (typeof key === 'string') {
        let desc = Reflect.getOwnPropertyDescriptor(obj, key);
        if (desc && !visited.has(key)) {
          visited.add(key);
          if (desc.enumerable) {
            yield key;
          }
        }
      }
    }
    obj = Reflect.getPrototypeOf(obj);
  }
}

class ObjectType extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);

    this.state = {
      open: props.open,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.open !== nextState.open) {
      return true;
    }

    if (this.props.filter === undefined) {
      return false; // this prevents bananas amount of rendering
    }

    if (this.props.filter === nextProps.filter) {
      return false;
    }

    return true;
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
    const { open } = this.state;
    const {
      filter = null,
      value,
      shallow = true,
      type = {}.toString.call(value),
    } = this.props;
    let { displayName } = this.props;

    if (!displayName) {
      displayName = value.constructor ? value.constructor.name : 'Object';
    }

    if (!open && shallow) {
      return (
        <div onClick={this.toggle} className={`type ${type}`}>
          <em>{displayName}</em>
        </div>
      );
    }

    let props = open ? [...enumerate(value)] : Object.keys(value);

    Object.getOwnPropertyNames(value).forEach(prop => {
      if (!props.includes(prop)) {
        props.push(prop);
      }
    });

    if (filter !== null) {
      props = props.filter(prop => {
        if ((prop + '').toLowerCase().includes(filter)) {
          return true;
        }

        if ((value[prop] + '').toLowerCase().includes(filter)) {
          return true;
        }

        return false;
      });
    }

    if (!open) {
      props.splice(LIMIT_CLOSED);
    }

    let types = props.sort().map((key, i) => {
      const Type = which(value[key]);
      return {
        key,
        value: (
          <Type
            allowOpen={open}
            key={`objectType-${i + 1}`}
            shallow={true}
            value={value[key]}
          />
        ),
      };
    });

    if (!open && Object.keys(value).length > LIMIT_CLOSED) {
      types.push(
        <span key="objectType-0" className="more">
          …
        </span>
      );
    }

    if (!open) {
      if (type === 'error') {
        return (
          <div className={`type ${type}`}>
            <em onClick={this.toggle}>{displayName}</em>
            <span>
              {'{'} <StringType value={value.message} /> {'}'}
            </span>
          </div>
        );
      }
      if (displayName !== 'Object') {
        // just show the summary
        return (
          <div className={`type ${type}`}>
            <em onClick={this.toggle}>{displayName}</em>
            <span>{'{ … }'}</span>
          </div>
        );
      }

      // intersperce with commas
      types = flatten(
        zip(
          types,
          Array.from(
            {
              length: types.length - 1,
            },
            (n, i) => {
              return (
                <span key={`sep-${i}`} className="sep">
                  ,
                </span>
              );
            }
          )
        )
      );

      // do mini output
      return (
        <div className="type object closed" onClick={this.toggle}>
          <em>{displayName}</em>
          <span>{'{'} </span>
          {types.map((obj, i) => {
            if (obj && obj.key && obj.value) {
              return (
                <span className="object-item key-value" key={`subtype-${i}`}>
                  <span className="key">{obj.key}:</span>
                  <span className="value">{obj.value}</span>
                </span>
              );
            }

            return obj;
          })}
          <span> {'}'}</span>
        </div>
      );
    }

    return (
      <div className={`type ${type} ${open ? '' : 'closed'}`}>
        <div className="header">
          <em onClick={this.toggle}>{displayName}</em>
          <span>{'{'}</span>
        </div>
        <div className="group">
          {types.map((obj, i) => {
            return (
              <div className="object-item key-value" key={`subtype-${i}`}>
                <span className="key">{obj.key}:</span>
                <span className="value">{obj.value}</span>
              </div>
            );
          })}
        </div>
        <span>{'}'}</span>
      </div>
    );
  }
}

export default ObjectType;
