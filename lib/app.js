const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('node-uuid').v4;
const ES = require('./es');
const cors = require('./cors');
const version = require(__dirname + '/../package.json').version;
const sw = fs.readFileSync(__dirname + '/../public/sw.js', 'utf8').replace(/\$VERSION/, version);
const app = express();
const sessions = {
  run: new ES('run'),
  log: new ES('log'),
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.disable('x-powered-by');

app.get('/remote/:id?', (req, res) => {
  const id = req.params.id || uuid();
  res.jsonp(id);
});

app.param('type', (req, res, next, type) => {
  const es = sessions[type];
  if (!es) {
    return next(404);
  }

  req.locals = { es };

  next();
});

app.get('/status', (req, res) => {
  const content = Object.keys(sessions.log.sessions).map(id => {
    return Object.assign({ id }, sessions.log.locals(id));
  });
  res.send(`<pre>${JSON.stringify(content)}</pre>`);
});

// accepts event/stream
app.get('/remote/:id/:type', cors, (req, res) => {
  const { id } = req.params;
  const { es } = req.locals;
  es.add(id, res, req.xhr);
});

app.post('/remote/:id/:type', cors, (req, res) => {
  const { id } = req.params;
  const { es } = req.locals;

  es.send(id, req.body.data);
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
