var restify = require('restify');
var server = restify.createServer();
var sessions = { run: {}, log: {} };
var eventId = 0;
var uuid = require('node-uuid').v4;

server.use(restify.queryParser());
server.use(restify.bodyParser({ mapParams: false }));
// server.use(restify.gzipResponse());

function ping(type, id) {
  console.log('sending ping to %s', id);
  var res = sessions[type][id];
  if (res.connection.writable) {
    res.write('eventId: 0\n\n');
  } else {
    // remove the res object if it's no longer writable
    delete sessions[type][id];
  }
}

// ping all active sessions every 30 seconds to keep the event source streams open
setInterval(function () {
  Object.keys(sessions.run).forEach(ping.bind(null, 'run'));
  Object.keys(sessions.log).forEach(ping.bind(null, 'log'));
}, 25 * 1000);

server.get('/remote/:id?', function (req, res) {
  var query = req.query;

  // save a new session id - maybe give it a token back?
  // serve up some JavaScript
  var id = req.params.id || uuid();
  res.writeHead(200, {'Content-Type': 'text/javascript'});
  res.end((query.callback || 'callback') + '("' + id + '");');
});

server.get('/remote/:id/log', function (req, res) {
  var id = req.params.id;
  res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache'});
  res.write('eventId: 0\n\n');

  sessions.log[id] = res;
  sessions.log[id].xhr = req.headers['x-requested-with'] === 'XMLHttpRequest';
});

server.post('/remote/:id/log', function (req, res) {
  // post made to send log to jsconsole
  var id = req.params.id;
  // passed over to Server Sent Events on jsconsole.com
  if (sessions.log[id]) {
    sessions.log[id].write('data: ' + req.body.data + '\neventId:' + (++eventId) + '\n\n');

    if (sessions.log[id].xhr) {
      sessions.log[id].end(); // lets older browsers finish their xhr request
    }
  }

  res.writeHead(200, { 'Content-Type' : 'text/plain' });
  res.end();
});

server.get('/remote/:id/run', function (req, res) {
  var id = req.params.id;
  res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache'});
  res.write('eventId: 0\n\n');
  sessions.run[id] = res;
  sessions.run[id].xhr = req.headers['x-requested-with'] === 'XMLHttpRequest';
});

server.post('/remote/:id/run', function (req, res) {
  var id = req.params.id;

  console.log('post run: %s', id, req.body);

  if (sessions.run[id]) {
    sessions.run[id].write('data: ' + req.body.data + '\neventId:' + (++eventId) + '\n\n');

    if (sessions.run[id].xhr) {
      sessions.run[id].end(); // lets older browsers finish their xhr request
    }
  }
  res.writeHead(200, { 'Content-Type' : 'text/plain' });
  res.end();
});

server.get(/.*/, restify.serveStatic({
  'directory': __dirname + '/../public',
  'default': 'index.html'
}));

server.listen(process.env.PORT || 8000, () => {
  console.log('%s listening at %s', server.name, server.url);
});

server.on('uncaughtException', function (req, res, route, error) {
  console.log(error.stack);
  res.send(error);
});
