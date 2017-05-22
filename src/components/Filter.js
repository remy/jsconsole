import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import '../Filter.css';

class Filter extends Component {
  render() {
    const { children, className, onFilter = ()=>{} } = this.props;

    const filter = debounce(onFilter, 100);

    return (
      <span className={`Filter ${className}`}>
        <span className="inner">
          <input onChange={e => {
            filter(e.target.value.trim().toLowerCase());
          }} onKeyDown={e => e.stopPropagation()} type="text" />
        </span>
        { children }
      </span>
    );
  }
}

export default Filter;
