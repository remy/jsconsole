(function (window) {

// custom because I want to be able to introspect native browser objects *and* functions
function stringify(o, simple) {
  var json = '', i, type = ({}).toString.call(o), parts = [];
  
  if (type == '[object String]') {
    json = '"' + o.replace(/"/g, '\\"') + '"';
  } else if (type == '[object Array]') {
    json = '[';
    for (i = 0; i < o.length; i++) {
      parts.push(stringify(o[i]));
    }
    json += parts.join(', ') + ']';
    json;
  } else if (type == '[object Object]') {
    json = '{';
    for (i in o) {
      parts.push(stringify(i) + ': ' + stringify(o[i]));
    }
    json += parts.join(', ') + '}';
  } else if (type == '[object Number]') {
    json = o+'';
  } else if (type == '[object Boolean]') {
    json = o ? 'true' : 'false';
  } else if (type == '[object Function]') {
    json = o.toString();
  } else if (o == null) {
    json = 'null';
  } else if (o == undefined) {
    json = 'undefined';
  } else if (simple == undefined) {
    json = type + '{\n';
    for (i in o) {
      parts.push(i + ': ' + stringify(o[i], true)); // safety from max stack
    }
    json += parts.join(',\n') + '\n}';
  } else {
    json = '"' + o + '"';
  }
  return json; //.replace(/\n/g, '\\n');
}

function run(cmd) {
  // debugger;
  var rawoutput = null, className = 'prompt';
  try {
    rawoutput = sandboxframe.contentWindow.eval(cmd);
  } catch (e) {
    rawoutput = e.message;
    className = 'error';
  }

  return [className, stringify(rawoutput).replace(/[<>&]/g, function (m) { return {'&':'&amp;','>':'&gt;','<':'&lt;'}[m];})];
}

function post(cmd) {
  history.push(cmd);
  
  // order so it appears at the top  
  var li = document.createElement('li'),
      parent = output.parentNode, 
      response = run(cmd);
      
  li.className = response[0];
  li.innerHTML = '<strong>' + cmd + '</strong><br /><span>'  + response[1] + '</span>';
  prettyPrint([li]);

  if (!output.firstChild) {
    output.appendChild(li);
  } else {
    output.insertBefore(li, output.firstChild);
  }
  
  output.parentNode.scrollTop = 0;
  exec.value = '';
  pos = history.length;
}

function changeView(event){
  if (event.which == 38 && event.shiftKey == true) {
    body.className = '';
    exec.focus();
    // setTimeout(function () { body.className = body.className; }, 13);
    return false;
  } else if (event.which == 40 && event.shiftKey == true) {
    body.className = 'large';
    exec.focus();
    // setTimeout(function () { body.className = body.className; }, 13);
    return false;
  }
}

var _console = {
  log: function (s) {
    return s;
  },
  dir: function (s) {
    return s;
  }
};

var exec = document.getElementById('exec'),
    form = exec.form,
    output = document.getElementById('output'),
    sandboxframe = document.createElement('iframe'),
    sandbox = null,
    history = [],
    pos = 0,
    wide = true,
    body = document.body;
 
body.appendChild(sandboxframe);
sandboxframe.setAttribute('id', 'sandbox');
sandbox = sandboxframe.contentDocument || sandboxframe.contentWindow.document;
sandbox.open();
sandbox.write('<script>var console = ' + stringify(_console).replace(/\\n/g, ' ') + ';</script>');
sandbox.close();

exec.onkeydown = function (event) {
  var keys = {38:1, 40:1};
  if (keys[event.which]) {
    if (event.shiftKey) {
      changeView(event);
    } else {
      if (event.which == 38) { // cycle up
        pos--;
        if (pos < 0) pos = history.length - 1;
      } else if (event.which == 40) { // down
        pos++;
        if (pos >= history.length) pos = 0;
      } 
      if (history[pos]) {
        exec.value = history[pos];
        // event.preventDefault && event.preventDefault();
        return false;
      }      
    }
  } else if (event.which == 13) { // enter (what about the other one)
    if (event.shiftKey == true || event.metaKey || event.ctrlKey || !body.className) {
      post(exec.value);
      return false;      
    }
  }
};

form.onsubmit = function (event) {
  event = event || window.event;
  event.preventDefault && event.preventDefault();
  post(exec.value);
  return false;
};

document.onkeydown = function (event) {
  event = event || window.event;
  return changeView(event);
}

if (window.location.search) {
  post(decodeURIComponent(window.location.search.substr(1)));
}

})(this);