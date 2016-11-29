const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const uuid = require('node-uuid').v4;
const connectedLogger = require('./connected-logger');
const version = require(__dirname + '/../package.json').version;
const sw = fs.readFileSync(__dirname + '/../public/sw.js', 'utf8').replace(/\$VERSION/, version);
const app = express();
const sessions = { run: {}, log: {} };
let eventId = 0;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.disable('x-powered-by');

app.get('/_log', connectedLogger(app));
// app.use(compression());

function ping(type, id) {
  console.log('sending ping to %s', id);
  let res = sessions[type][id];
  if (res.connection.writable) {
    res.write('eventId: 0\n\n');
  } else {
    // remove the res object if it's no longer writable
    console.log('removing %s', id);
    delete sessions[type][id];
  }
}

// ping all active sessions every 30 seconds to keep the
// event source streams open
setInterval(() => {
  Object.keys(sessions.run).forEach(ping.bind(null, 'run'));
  Object.keys(sessions.log).forEach(ping.bind(null, 'log'));
}, 25 * 1000);

app.get('/remote/:id?', (req, res) => {
  let query = req.query;

  // save a new session id - maybe give it a token back?
  // serve up some JavaScript
  let id = req.params.id || uuid();
  res.writeHead(200, {'Content-Type': 'text/javascript'});
  res.end((query.callback || 'callback') + '("' + id + '");');
});

app.get('/remote/:id/log', (req, res) => {
  let id = req.params.id;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'x-accel-buffering': 'no',
  });
  res.write('eventId: 0\n\n');

  sessions.log[id] = res;
  sessions.log[id].xhr = req.headers['x-requested-with'] === 'XMLHttpRequest';
});

app.post('/remote/:id/log', (req, res) => {
  // post made to send log to jsconsole
  let id = req.params.id;
  console.log('POST remote log: %s', id);
  // passed over to app Sent Events on jsconsole.com
  if (sessions.log[id]) {
    console.log('found session to log to');
    sessions.log[id].write(`data: ${req.body.data}\neventId:${ ++eventId}\n\n`);

    if (sessions.log[id].xhr) {
      sessions.log[id].end(); // lets older browsers finish their xhr request
    }
  } else {
    console.log('no session found: %s', id);
  }

  res.send(true);
  // res.writeHead(200, { 'Content-Type': 'text/plain' });
  // res.end();
});

app.get('/remote/:id/run', function (req, res) {
  let id = req.params.id;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  });
  res.write('eventId: 0\n\n');
  sessions.run[id] = res;
  sessions.run[id].xhr = req.headers['x-requested-with'] === 'XMLHttpRequest';
});

app.post('/remote/:id/run', (req, res) => {
  let id = req.params.id;

  console.log('post run: %s', id, req.body);

  if (sessions.run[id]) {
    sessions.run[id].write(`data: ${req.body.data}\neventId:${ ++eventId}\n\n`);

    if (sessions.run[id].xhr) {
      sessions.run[id].end(); // lets older browsers finish their xhr request
    }
  }
  // res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.send(true);
});

app.get('/sw.js', (req, res) => {
  res.header('content-type', 'text/javascript');
  res.end(sw);
});

app.get('/js/version.js', (req, res) => {
  res.header('content-type', 'text/javascript');
  res.end(`var version = '${version}';`);
});


app.use(express.static(__dirname + '/../public'));

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('listening on http://localhost:%s', server.address().port);
});

// app.on('uncaughtException', (req, res, route, error) => {
//   console.log(error.stack);
//   res.send(error);
// });
