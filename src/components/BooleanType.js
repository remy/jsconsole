import React from 'react';
export default function BooleanType ({ value }) {
  return <div className="bool type">{value ? "true" : "false"}</div>
}
