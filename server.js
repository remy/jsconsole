var connect = require('connect'),
    parse = require('url').parse,
    querystring = require('querystring').parse,
    sessions = { run: {}, log: {} },
    eventid = 0,
    uuid = require('node-uuid');

function remoteServer(app) {
  app.get('/remote/:id?', function (req, res, next) {
    var url = parse(req.url),
        query = querystring(url.query);

    // save a new session id - maybe give it a token back?
    // serve up some JavaScript
    var id = req.params.id || uuid();
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.end((query.callback || 'callback') + '("' + id + '");');
  });

  app.get('/remote/:id/log', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache'});
    res.write('eventId:0\n\n');
    sessions.log[req.id] = res;
  });

  app.post('/remote/:id/log', function (req, res) {
    // post made to send log to jsconsole
    var id = req.id;
    // passed over to Server Sent Events on jsconsole.com
    sessions.log[id] && sessions.log[id].write('data: ' + req.body.data + '\neventId:' + (++eventid) + '\n\n');
    res.writeHead(200, { 'Content-Type' : 'text/plain' });
    res.end();
  });

  app.get('/remote/:id/run', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache'});
    res.write('eventId:0\n\n');
    sessions.run[req.id] = res;
  });

  app.post('/remote/:id/run', function (req, res) {
    var id = req.id;
    sessions.run[id] && sessions.run[id].write('data: ' + req.body.data + '\neventId:' + (++eventid) + '\n\n');
    res.writeHead(200, { 'Content-Type' : 'text/plain' });
    res.end();
  });
}

var server = connect.createServer(
  connect.bodyDecoder(),
  connect.logger(),
  connect.staticProvider(__dirname),
  connect.router(remoteServer)
);

server.listen(8000);
