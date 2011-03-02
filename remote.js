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


function getLastChild(el) {
  return (el.lastChild && el.lastChild.nodeName != '#text') ? getLastChild(el.lastChild) : el;
}

var last = getLastChild(document.lastChild);

if (last.getAttribute('id') == '_firebugConsole') { // if Firebug is open, this all goes to crap
  last = last.previousElementSibling;
} 

var lastSrc = last.getAttribute('src'),
    id = lastSrc.replace(/.*\?/, ''),
    origin = 'http://' + lastSrc.substr(7).replace(/\/.*$/, ''),
    remoteWindow = null;

var remoteFrame = document.createElement('iframe');
remoteFrame.style.display = 'none';
remoteFrame.src = origin + '/remote.html?' + id;
document.body.appendChild(remoteFrame);


window.addEventListener('message', function (event) {
  if (event.origin != origin) return;

  // eval the event.data command
  try {
    if (event.data.indexOf('console.log') == 0) {
      eval('remote.echo(' + event.data.match(/\((.*?)\)/)[1] + ', "' + event.data + '")');
    } else {
      remote.echo(eval(event.data), event.data);
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
    remoteWindow && remoteWindow.postMessage(JSON.stringify({ response: response, cmd: 'remote console.log' }), origin);
  },
  echo: function (response, cmd) {
    var args = [].slice.call(arguments, 0),
        cmd = args.pop(),
        response = args;

    var argsObj = stringify(response, true);
    remoteWindow && remoteWindow.postMessage(JSON.stringify({ response: argsObj, cmd: cmd }), origin);
  },
  error: function (error, cmd) {
    remoteWindow && remoteWindow.postMessage(JSON.stringify({ response: error.message, cmd: cmd, type: 'error' }), origin);
  }
};

remoteFrame.onload = function () {
  remoteWindow = remoteFrame.contentWindow;
  remoteWindow.postMessage('__init__', origin);
};

window.remote = remote;

try {
  window.console = remote;
} catch (e) {
  console.log('cannot overwrite existing console object');
}

})();
