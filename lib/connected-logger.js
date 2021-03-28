const intercept = require('intercept-stdout');
let connections = [];
let id = 0;
const log = [];

module.exports = ({ limit = 50 }) => {
  unhook = intercept(txt => {
    id++;
    log.push({ txt, id, timestamp: new Date().toJSON() });
    connections = connections.filter(res => {
      if (res.connection.writable) {
        res.write(`data: ${txt}\neventId:${id}\n\n`);
        return true;
      }

      try {
        res.close();
      } catch (e) {};

      return false;
    });

    log.splice(0, log.length - limit);
  });

  return logger;
};

function logger(req, res, next) {
  // req.socket.setTimeout(Infinity);
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    'connection': 'keep-alive',
    'x-accel-buffering': 'no',
    'transfer-encoding': '',
  });

  let offset = parseInt(req.headers['Last-Event-ID'], 10) || 0;

  // flush
  res.write('\n'.repeat(2048));

  log.forEach(log => {
    if (log.id > offset) {
      res.write(`data: ${JSON.stringify(log)}\neventId:${log.id}\n\n`);
    }
  });

  connections.push(res);
}

setInterval(() => {
  connections = connections.filter(res => {
    if (res.connection.writable) {
      res.write(`eventId:${id}\n\n`);
      return true;
    }

    try {
      res.close();
    } catch (e) {};

    return false;
  });
}, 1000);
