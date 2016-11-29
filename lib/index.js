const express = require('express');
const app = express();
const sse = require('./sse');

app.get('/_log', sse());
app.use(express.static(__dirname + '/public'));

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('listening on http://localhost:%s', server.address().port);
});

app.on('uncaughtException', (req, res, route, error) => {
  console.log(error.stack);
  res.send(error);
});
