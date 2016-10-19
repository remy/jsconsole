const restify = require('restify');
const version = require(__dirname + '/../package.json').version;
const fs = require('fs');
const sw = fs.readFileSync(__dirname + '/../public/sw.js', 'utf8').replace(/\$VERSION/, version);
const server = restify.createServer();
const sessions = { run: {}, log: {} };
let eventId = 0;
const uuid = require('node-uuid').v4;

server.use(restify.queryParser());
server.use(restify.bodyParser({ mapParams: false }));
// server.use(restify.gzipResponse());

function ping(type, id) {
  console.log('sending ping to %s', id);
  let res = sessions[type][id];
  if (res.connection.writable) {
    res.write('eventId: 0\n\n');
  } else {
    // remove the res object if it's no longer writable
    delete sessions[type][id];
  }
}

// ping all active sessions every 30 seconds to keep the
// event source streams open
setInterval(() => {
  Object.keys(sessions.run).forEach(ping.bind(null, 'run'));
  Object.keys(sessions.log).forEach(ping.bind(null, 'log'));
}, 25 * 1000);

server.get('/remote/:id?', (req, res) => {
  let query = req.query;

  // save a new session id - maybe give it a token back?
  // serve up some JavaScript
  let id = req.params.id || uuid();
  res.writeHead(200, {'Content-Type': 'text/javascript'});
  res.end((query.callback || 'callback') + '("' + id + '");');
});

server.get('/remote/:id/log', (req, res) => {
  let id = req.params.id;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  });
  res.write('eventId: 0\n\n');

  sessions.log[id] = res;
  sessions.log[id].xhr = req.headers['x-requested-with'] === 'XMLHttpRequest';
});

server.post('/remote/:id/log', (req, res) => {
  // post made to send log to jsconsole
  let id = req.params.id;
  // passed over to Server Sent Events on jsconsole.com
  if (sessions.log[id]) {
    sessions.log[id].write(`data: ${req.body.data}\neventId:${ ++eventId}\n\n`);

    if (sessions.log[id].xhr) {
      sessions.log[id].end(); // lets older browsers finish their xhr request
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end();
});

server.get('/remote/:id/run', function (req, res) {
  let id = req.params.id;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  });
  res.write('eventId: 0\n\n');
  sessions.run[id] = res;
  sessions.run[id].xhr = req.headers['x-requested-with'] === 'XMLHttpRequest';
});

server.post('/remote/:id/run', (req, res) => {
  let id = req.params.id;

  console.log('post run: %s', id, req.body);

  if (sessions.run[id]) {
    sessions.run[id].write(`data: ${req.body.data}\neventId:${ ++eventId}\n\n`);

    if (sessions.run[id].xhr) {
      sessions.run[id].end(); // lets older browsers finish their xhr request
    }
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end();
});

server.get('/sw.js', (req, res) => {
  res.header('content-type', 'text/javascript');
  res.end(sw);
});

server.get('/js/version.js', (req, res) => {
  res.header('content-type', 'text/javascript');
  res.end(`var version = '${version}';`);
});


server.get(/.*/, restify.serveStatic({
  directory: __dirname + '/../public',
  default: 'index.html',
}));

server.listen(process.env.PORT || 8000, () => {
  console.log('%s listening at %s', server.name, server.url);
});

server.on('uncaughtException', (req, res, route, error) => {
  console.log(error.stack);
  res.send(error);
});
