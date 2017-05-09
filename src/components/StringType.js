import React from 'react';
export default ({ children, value }) => <div className="type string">"{ value.replace(/\n/g, '↵') }"</div>
