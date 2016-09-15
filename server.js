'use strict';
const fs = require('fs');
process.env.PORT = process.argv[2] || 8000;
let address = `http://127.0.0.1:${process.env.PORT}`;
require('./lib/app');
setTimeout(() => {
  require('child_process').exec(`start ${address}`);
});
console.log(`start jsconsole at ${address}`);
