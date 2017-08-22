class ES {
  constructor(name) {
    this.name = name;
    this.sessions = {};
    this.eventId = 0;

    setInterval(() => {
      Object.keys(this.sessions).forEach(id => this.ping(id));
    }, 25 * 1000);
  }

  add(id, res, xhr = false) {
    console.log('adding and sending to %s', id);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    });
    res.write(`eventId: 0\n\n`);
    this.sessions[id] = res;
    this.sessions[id].xhr = xhr;
  }

  locals(id) {
    return (this.sessions[id] || { locals: null }).locals;
  }

  send(id, body) {
    const res = this.sessions[id];
    if (res && res.connection && res.connection.writable) {
      this.eventId++;
      res.locals = {
        eventId: this.eventId,
        body,
        id,
      };
      res.write(`data: ${body}\neventId:${this.eventId}\n\n`);

      if (res.xhr) {
        res.end(); // lets older browsers finish their xhr request
      }
    } else {
      delete this.sessions[id];
    }
  }

  ping(id) {
    const res = this.sessions[id];
    if (res.connection && res.connection.writable) {
      res.write('eventId: 0\n\n');
    } else {
      // remove the res object if it's no longer writable
      delete this.sessions[id];
    }
  }
}

module.exports = ES;
