import React, { Component } from 'react';
import debounce from 'lodash/debounce';

class Filter extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.enabled !== prevProps.enabled) {
      if (this.props.enabled) {
        this.input.focus();
      } else {
        this.input.value = '';
        this.props.onFilter(null);
      }
    }
  }

  render() {
    const { children, enabled, onFilter = () => {} } = this.props;

    const filter = debounce(onFilter, 100);

    const className = enabled ? 'is-visible' : 'is-hidden';

    return (
      <span className={`Filter ${className}`}>
        <span className="inner">
          <input
            ref={e => (this.input = e)}
            onChange={e => {
              filter(e.target.value.trim().toLowerCase());
            }}
            onKeyDown={e => e.stopPropagation()}
            type="text"
          />
        </span>
        {children}
      </span>
    );
  }
}

export default Filter;
