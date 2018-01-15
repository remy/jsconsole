const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('node-uuid').v4;
const ES = require('./es');
const cors = require('./cors');
const version = require(__dirname + '/../package.json').version;

const app = express();
const sessions = {
  run: new ES('run'),
  log: new ES('log'),
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.disable('x-powered-by');

app.use(cors);

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

app.use(express.static(__dirname + '/../build'));

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('listening on http://localhost:%s', server.address().port);
});
