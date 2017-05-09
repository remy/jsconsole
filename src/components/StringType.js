import React, { Component } from 'react';

class StringType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      multiline: props.value.includes('\n'),
      expanded: false,
    };
    this.onToggle = this.onToggle.bind(this);
  }

  onToggle() {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  render() {
    const { multiline, expanded } = this.state;
    let { value } = this.state;

    if (multiline && !expanded) {
      value = value.replace(/\n/g, '↵');
    }

    const expand = <button onClick={this.onToggle} className="icon expand">+</button>

    return (
    <div ref={e=>this.string=e} className={`type string ${expanded ? 'toggle' : ''}`}>
      { multiline && expand }
      "{ value }"
    </div>
    );
  }
}

export default StringType;
