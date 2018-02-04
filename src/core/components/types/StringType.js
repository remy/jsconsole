import React, { Component } from 'react';
import classnames from 'classnames';

class StringType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      multiline: props.value.includes('\n'),
      expanded: !props.shallow,
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
    const { bare = false, html = false } = this.props;
    const { multiline, expanded } = this.state;
    let { value } = this.state;

    if (multiline && !expanded) {
      value = value.replace(/\n/g, '↵');
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
