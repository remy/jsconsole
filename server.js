'use strict';
const fs = require('fs');
process.env.PORT = process.argv[2] || 8000;
fs.readFile('lib/app.js', (err, data) => {
    if (err) throw err;
    if (data.indexOf('"use strict"') !== 0) {
        fs.writeFileSync('lib/app.js', '"use strict";\n' + data);
    }
    require('./lib/app');
    setTimeout(function() {
    	let address = 'http://127.0.0.1:' + process.env.PORT;
    	require('child_process').exec('start ' + address);
    	console.log('start browser at ' + address);
    });
});
