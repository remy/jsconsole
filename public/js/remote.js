;(function () {
/* jshint browser:true, evil:true */

// 1. create iframe pointing to script on jsconsole.com domain
// 2. create console object with: log, dir, etc?
// 3. console.log runs postMessage with json.stringified content
// 4. jsconsole.com/remote/?id.onMessage = send to server, and wait for response.

function sortci(a, b) {
  return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
}

// from console.js
function stringify(o, simple) {
  var json = '', i, type = ({}).toString.call(o), parts = [], names = [];

  if (type === '[object String]') {
    json = '"' + o.replace(/\n/g, '\\n').replace(/"/g, '\\"') + '"';
  } else if (type === '[object Array]') {
    json = '[';
    for (i = 0; i < o.length; i++) {
      parts.push(stringify(o[i], simple));
    }
    json += parts.join(', ') + ']';
  } else if (type === '[object Object]') {
    json = '{';
    for (i in o) {
      names.push(i);
    }
    names.sort(sortci);
    for (i = 0; i < names.length; i++) {
      parts.push(stringify(names[i]) + ': ' + stringify(o[names[i] ], simple));
    }
    json += parts.join(', ') + '}';
  } else if (type === '[object Number]') {
    json = o+'';
  } else if (type === '[object Boolean]') {
    json = o ? 'true' : 'false';
  } else if (type === '[object Function]') {
    json = o.toString();
  } else if (o === null) {
    json = 'null';
  } else if (o === undefined) {
    json = 'undefined';
  } else if (simple === undefined) {
    json = type + '{\n';
    for (i in o) {
      names.push(i);
    }
    names.sort(sortci);
    for (i = 0; i < names.length; i++) {
      // safety from max stack
      parts.push(names[i] + ': ' + stringify(o[names[i]], true));
    }
    json += parts.join(',\n') + '\n}';
  } else {
    try {
      json = o+''; // should look like an object
    } catch (e) {}
  }
  return json;
}

function getRemoteScript() {
  var scripts = document.getElementsByTagName('script');
  var remoteScript = scripts[scripts.length-1];
  var re = /jsconsole\..*(:\d+)?\/js\/remote.js/;
  for (var i = 0; i < scripts.length; i++) {
    if (re.test(scripts[i].src)) {
      remoteScript = scripts[i];
      break;
    }
  }

  return remoteScript;
}

var last = getRemoteScript();

var lastSrc = last.getAttribute('src'),
    id = lastSrc.replace(/.*\?/, ''),
    origin = document.location.protocol + '//' + lastSrc.substr(7).replace(/\/.*$/, ''),
    remoteWindow = null,
    queue = [],
    msgType = '';

var remoteFrame = document.createElement('iframe');
remoteFrame.style.display = 'none';
remoteFrame.src = origin + '/remote.html?' + id;

// an attempt to allow this code to be included in the head element
document.documentElement.appendChild(remoteFrame);

window.addEventListener('message', function (event) {
  if (event.origin !== origin) {
    return;
  }

  // this isn't for us
  if (typeof event.data !== 'string') {
    return;
  }

  // eval the event.data command
  try {
    if (event.data.indexOf('console.log') === 0) {
      eval('remote.echo(' + event.data.match(/console.log\((.*)\);?/)[1] + ', "' + event.data + '", true)');
    } else {
      // must be undefined to work
      remote.echo(eval(event.data), event.data, undefined);
    }
  } catch (e) {
    _console.log(e.stack, event);
    remote.error(e, event.data);
  }
}, false);

var timers = {}; // timers for console.time and console.timeEnd

var remote = {
  log: function () {
    // var argsObj = stringify(arguments.length === 1 ? arguments[0] : [].slice.call(arguments, 0));
    var response = [];
    [].forEach.call(arguments, function (args) {
      response.push(stringify(args, true));
    });

    var msg = JSON.stringify({ response: response, cmd: 'remote console.log', type: msgType });

    if (remoteWindow) {
      remoteWindow.postMessage(msg, origin);
    } else {
      queue.push(msg);
    }

    msgType = '';
  },
  info: function () {
    msgType = 'info';
    remote.log.apply(this, arguments);
  },
  echo: function () {
    var args = [].slice.call(arguments, 0),
        plain = args.pop(),
        cmd = args.pop(),
        response = args;

    var argsObj = stringify(response, plain),
        msg = JSON.stringify({ response: argsObj, cmd: cmd });
    if (remoteWindow) {
      remoteWindow.postMessage(msg, origin);
    } else {
      queue.push(msg);
    }
  },
  error: function (error, cmd) {
    var msg = JSON.stringify({ response: error.message, cmd: cmd, type: 'error' });
    if (remoteWindow) {
      remoteWindow.postMessage(msg, origin);
    } else {
      queue.push(msg);
    }
  },
  time: function(title){
    if(typeof title !== 'string') {
      return;
    }
    timers[title] = +new Date();
  },
  timeEnd: function(title){
    if (typeof title !== 'string' || !timers[title]) {
      return;
    }
    var execTime = +new Date() - timers[title];
    delete timers[title];
    var plain = title + ': ' + execTime + 'ms';
    var msg = JSON.stringify({ response: plain, cmd:  'remote console.log', type: '' });
    if (remoteWindow) {
      remoteWindow.postMessage(msg, origin);
    } else {
      queue.push(msg);
    }
  }
};

// just for extra support
remote.debug = remote.dir = remote.log;
remote.warn = remote.info;

remoteFrame.onload = function () {
  remoteWindow = remoteFrame.contentWindow;
  remoteWindow.postMessage('__init__', origin);

  remoteWindow.postMessage(stringify({ response: 'Connection established with ' + window.location.toString() + '\n' + navigator.userAgent, type: 'info' }), origin);

  for (var i = 0; i < queue.length; i++) {
    remoteWindow.postMessage(queue[i], origin);
  }
};

window.remote = remote;

if (window.addEventListener) {
  window.addEventListener('error', function (event) {
    remote.error({ message: event.message }, event.filename + ':' + event.lineno);
  }, false);
}


try {
  window._console = window.console;
  window.console = remote;
} catch (e) {
  console.log('cannot overwrite existing console object');
}

function warnUsage() {
  var useSS = false;
  try {
    sessionStorage.getItem('foo');
    useSS = true;
  } catch (e) {}
  if (!(useSS ? sessionStorage.jsconsole : window.name)) {
    if (useSS) {
      sessionStorage.jsconsole = 1;
    } else {
      window.name = 1;
    }
    alert('You will see this warning once per session.\n\nYou are using a remote control script on this site - if you accidently push it to production, anyone will have control of your visitor\'s browser. Remember to remove this script.');
  }
}

warnUsage();

})();
