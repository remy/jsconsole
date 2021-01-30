import React, { Component } from 'react';
import classnames from 'classnames';

import {getContainer} from '../../lib/run';

import ObjectType from './ObjectType';


class StringType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      multiline: props.value.includes('\n'),
      expanded: !props.shallow,
      open: props.open
    };
    this.onToggle = this.onToggle.bind(this);
  }

  onToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const { bare = false, shallow = true,html = false,allowOpen } = this.props;
    const { multiline, expanded, open} = this.state;
    let { value } = this.state;

    if (multiline && !expanded) {
      value = value.replace(/\n/g, '↵');
    }

    if(getContainer().contentWindow.String.prototype===value){
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
          displayName={'String'}
        />
      );
    }

    const expand = (
      <button onClick={this.onToggle} className="icon expand">
        +
      </button>
    );

    const child = html ? (
      <span dangerouslySetInnerHTML={{ __html: value }} />
    ) : (
      value
    );

    const className = classnames([
      'type',
      'string',
      {
        toggle: expanded,
        bareString: bare,
        quote: !bare,
      },
    ]);

    return (
      <div ref={e => (this.string = e)} className={className}>
        {multiline && expand}
        {child}
      </div>
    );
  }
}

export default StringType;
