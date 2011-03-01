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

var id = getLastChild(document.lastChild).getAttribute('src').replace(/.*\?/, '');

var origin = 'http://offline.jsconsole.com:8000';

var remoteFrame = document.createElement('iframe');
remoteFrame.style.display = 'none';
remoteFrame.src = origin + '/remote.html?' + id;
document.body.appendChild(remoteFrame);

var remoteWindow = remoteFrame.contentWindow;

window.addEventListener('message', function (event) {
  if (event.origin != origin) return;

  // eval the event.data command
  remote.log(eval(event.data));
});

var remote = {
  log: function () {
    var argsObj = stringify(arguments.length == 1 ? arguments[0] : [].slice.call(arguments, 0));
    remoteWindow.postMessage(JSON.stringify(argsObj), 'http://' + remoteFrame.src.substr(7).replace(/\/.*$/, ''));
  }
};

window.remote = remote;

try {
  window.console = remote;
} catch (e) {
  console.log('cannot overwrite existing console object');
}

})();
