;(function () {

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
  
  if (type == '[object String]') {
    json = '"' + o.replace(/"/g, '\\"') + '"';
  } else if (type == '[object Array]') {
    json = '[';
    for (i = 0; i < o.length; i++) {
      parts.push(stringify(o[i], simple));
    }
    json += parts.join(', ') + ']';
    json;
  } else if (type == '[object Object]') {
    json = '{';
    for (i in o) {
      names.push(i);
    }
    names.sort(sortci);
    for (i = 0; i < names.length; i++) {
      parts.push(stringify(names[i]) + ': ' + stringify(o[names[i] ], simple));
    }
    json += parts.join(', ') + '}';
  } else if (type == '[object Number]') {
    json = o+'';
  } else if (type == '[object Boolean]') {
    json = o ? 'true' : 'false';
  } else if (type == '[object Function]') {
    json = o.toString();
  } else if (o === null) {
    json = 'null';
  } else if (o === undefined) {
    json = 'undefined';
  } else if (simple == undefined) {
    json = type + '{\n';
    for (i in o) {
      names.push(i);
    }
    names.sort(sortci);
    for (i = 0; i < names.length; i++) {
      parts.push(names[i] + ': ' + stringify(o[names[i]], true)); // safety from max stack
    }
    json += parts.join(',\n') + '\n}';
  } else {
    try {
      json = o+''; // should look like an object
    } catch (e) {}
  }
  return json;
}


// Plugins that inject are screwing this up :(
// function getLastChild(el) {
//   return (el.lastChild && el.lastChild.nodeName != '#text') ? getLastChild(el.lastChild) : el;
// }

function getRemoteScript() {
  var scripts = document.getElementsByTagName('script'),
      remoteScript = null;
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.indexOf('jsconsole.com/remote.js') !== -1) {
      remoteScript = scripts[i];
      break;
    }
  }
  
  return remoteScript;
}

var last = getRemoteScript();

// if (last.getAttribute('id') == '_firebugConsole') { // if Firebug is open, this all goes to crap
//   last = last.previousElementSibling;
// } 

var lastSrc = last.getAttribute('src'),
    id = lastSrc.replace(/.*\?/, ''),
    origin = 'http://' + lastSrc.substr(7).replace(/\/.*$/, ''),
    remoteWindow = null,
    queue = [],
    msgType = '';

var remoteFrame = document.createElement('iframe');
remoteFrame.style.display = 'none';
remoteFrame.src = origin + '/remote.html?' + id;

// this is new - in an attempt to allow this code to be included in the head element
document.documentElement.appendChild(remoteFrame);


window.addEventListener('message', function (event) {
  if (event.origin != origin) return;

  // eval the event.data command
  try {
    if (event.data.indexOf('console.log') == 0) {
      eval('remote.echo(' + event.data.match(/console.log\((.*)\);?/)[1] + ', "' + event.data + '", true)');
    } else {
      remote.echo(eval(event.data), event.data, undefined); // must be undefined to work
    }
  } catch (e) {
    remote.error(e, event.data);
  }
}, false);

var remote = {
  log: function () {
    var argsObj = stringify(arguments.length == 1 ? arguments[0] : [].slice.call(arguments, 0));
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
  }
};

// just for extra support
remote.debug = remote.dir = remote.log;
remote.warn = remote.info;

remoteFrame.onload = function () {
  remoteWindow = remoteFrame.contentWindow;
  remoteWindow.postMessage('__init__', origin);
  
  remoteWindow.postMessage(stringify({ response: 'Connection established with ' + navigator.userAgent, type: 'info' }), origin);
  
  for (var i = 0; i < queue.length; i++) {
    remoteWindow.postMessage(queue[i], origin);
  }
};

window.remote = remote;

try {
  window.console = remote;
} catch (e) {
  console.log('cannot overwrite existing console object');
}

})();
