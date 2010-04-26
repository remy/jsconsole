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
  } else if (o === null) {
    json = 'null';
  } else if (o === undefined) {
    json = 'undefined';
  } else if (simple == undefined) {
    json = type + '{\n';
    for (i in o) {
      parts.push(i + ': ' + stringify(o[i], true)); // safety from max stack
    }
    json += parts.join(',\n') + '\n}';
  } else {
    json = o+''; // should look like an object
  }
  return json;
}

function cleanse(s) {
  return s.replace(/[<>&]/g, function (m) { return {'&':'&amp;','>':'&gt;','<':'&lt;'}[m];});
}

function run(cmd) {
  var rawoutput = null, className = 'response';

  if (!commands[cmd]) {
    try {
      rawoutput = sandboxframe.contentWindow.eval(cmd);
    } catch (e) {
      rawoutput = e.message;
      className = 'error';
    }
    return [className, cleanse(stringify(rawoutput))];
  } else {
    return [className, commands[cmd]()];
  }

  // return [className, cleanse(stringify(rawoutput))];
}

function post(cmd) {
  cmd = trim(cmd);
  history.push(cmd);
  
  echo(cmd);
  
  // order so it appears at the top  
  var el = document.createElement('div'),
      li = document.createElement('li'),
      span = document.createElement('span'),
      parent = output.parentNode, 
      response = run(cmd);
    
  el.className = 'response';
  span.innerHTML = response[1];

  if (!commands[cmd]) prettyPrint([span]);
  el.appendChild(span);

  li.className = response[0];
  li.innerHTML = '<span class="gutter"></span>';
  li.appendChild(el);

  appendLog(li);
    
  output.parentNode.scrollTop = 0;
  if (!body.className) exec.value = '';
  pos = history.length;
}

function log(msg) {
  var li = document.createElement('li'),
      div = document.createElement('div');

  div.innerHTML = msg;
  prettyPrint([div]);
  li.className = 'log';
  li.innerHTML = '<span class="gutter"></span>';
  li.appendChild(div);

  appendLog(li);
}

function echo(cmd) {
  var li = document.createElement('li');

  li.className = 'echo';
  li.innerHTML = '<span class="gutter"></span><div>' + cleanse(cmd) + '</div>';

  logAfter = output.querySelectorAll('li.echo')[0] || null;
  appendLog(li, true);
}

function appendLog(el, echo) {
  if (echo) {
    if (!output.firstChild) {
      output.appendChild(el);
    } else {
      output.insertBefore(el, output.firstChild);
    }      
  } else {
    output.insertBefore(el, logAfter ? logAfter : output.lastChild.nextSibling);
  }
}

function changeView(event){
  var which = event.which || event.keyCode;
  if (which == 38 && event.shiftKey == true) {
    body.className = '';
    exec.focus();
    return false;
  } else if (which == 40 && event.shiftKey == true) {
    body.className = 'large';
    exec.focus();
    return false;
  }
}

function showhelp() {
  return 'up/down - cycle history<br />\nshift+up - single line command<br />\nshift+down - multiline command<br />\nshift+enter - to run command in multiline mode';
}

function checkTab(evt) {
  var t = evt.target,
      ss = t.selectionStart,
      se = t.selectionEnd,
      tab = "  ";
  

  // Tab key - insert tab expansion
  if (evt.keyCode == 9) {
    evt.preventDefault();

    // Special case of multi line selection
    if (ss != se && t.value.slice(ss,se).indexOf("\n") != -1) {
      // In case selection was not of entire lines (e.g. selection begins in the middle of a line)
      // we ought to tab at the beginning as well as at the start of every following line.
      var pre = t.value.slice(0,ss);
      var sel = t.value.slice(ss,se).replace(/\n/g,"\n"+tab);
      var post = t.value.slice(se,t.value.length);
      t.value = pre.concat(tab).concat(sel).concat(post);

      t.selectionStart = ss + tab.length;
      t.selectionEnd = se + tab.length;
    }

    // "Normal" case (no selection or selection on one line only)
    else {
      t.value = t.value.slice(0,ss).concat(tab).concat(t.value.slice(ss,t.value.length));
      if (ss == se) {
        t.selectionStart = t.selectionEnd = ss + tab.length;
      }
      else {
        t.selectionStart = ss + tab.length;
        t.selectionEnd = se + tab.length;
      }
    }
  }

  // Backspace key - delete preceding tab expansion, if exists
  else if (evt.keyCode==8 && t.value.slice(ss - 4,ss) == tab) {
    evt.preventDefault();

    t.value = t.value.slice(0,ss - 4).concat(t.value.slice(ss,t.value.length));
    t.selectionStart = t.selectionEnd = ss - tab.length;
  }

  // Delete key - delete following tab expansion, if exists
  else if (evt.keyCode==46 && t.value.slice(se,se + 4) == tab) {
    evt.preventDefault();

    t.value = t.value.slice(0,ss).concat(t.value.slice(ss + 4,t.value.length));
    t.selectionStart = t.selectionEnd = ss;
  }
  // Left/right arrow keys - move across the tab in one go
  else if (evt.keyCode == 37 && t.value.slice(ss - 4,ss) == tab) {
    evt.preventDefault();
    t.selectionStart = t.selectionEnd = ss - 4;
  }
  else if (evt.keyCode == 39 && t.value.slice(ss,ss + 4) == tab) {
    evt.preventDefault();
    t.selectionStart = t.selectionEnd = ss + 4;
  }
}

function trim(s) {
  return (s||"").replace(/^\s+|\s+$/g,"");
}

window._console = {
  log: function () {
    var l = arguments.length, i = 0;
    for (; i < l; i++) {
      log(stringify(arguments[i], true));
    }
  },
  dir: function () {
    var l = arguments.length, i = 0;
    for (; i < l; i++) {
      log(stringify(arguments[i]));
    }
  }
};

document.addEventListener ? 
  window.addEventListener('message', function (event) {
    post(event.data);
  }, false) : 
  window.attachEvent('onmessage', function () {
    post(window.event.data);
  });

var exec = document.getElementById('exec'),
    form = exec.form,
    output = document.getElementById('output'),
    sandboxframe = document.createElement('iframe'),
    sandbox = null,
    fakeConsole = 'window.top._console',
    history = [''],
    pos = 0,
    wide = true,
    body = document.getElementsByTagName('body')[0],
    logAfter = null,
    commands = { ':help' : showhelp, ':load' : function () {} };

body.appendChild(sandboxframe);
sandboxframe.setAttribute('id', 'sandbox');
sandbox = sandboxframe.contentDocument || sandboxframe.contentWindow.document;
sandbox.open();
// stupid jumping through hoops if Firebug is open, since overwriting console throws error
sandbox.write('<script>(function () { var fakeConsole = ' + fakeConsole + '; if (console != undefined) { for (var k in fakeConsole) { console[k] = fakeConsole[k]; } } else { console = fakeConsole; } })();</script>');
sandbox.close();

// tweaks to interface to allow focus
if (!('autofocus' in document.createElement('input'))) exec.focus();
output.parentNode.tabIndex = 0;

exec.onkeydown = function (event) {
  event = event || window.event;
  var keys = {38:1, 40:1, Up:38, Down:40, Enter:10, 'U+0009':9, 'U+0008':8}, 
      wide = body.className == 'large', 
      which = keys[event.keyIdentifier] || event.which || event.keyCode;
  if (typeof which == 'string') which = which.replace(/\/U\+/, '\\u');
  if (keys[which]) {
    if (event.shiftKey) {
      changeView(event);
    } else if (!wide) {
      if (which == 38) { // cycle up
        pos--;
        if (pos < 0) pos = history.length - 1;
      } else if (which == 40) { // down
        pos++;
        if (pos >= history.length) pos = 0;
      } 
      if (history[pos] != undefined) {
        exec.value = history[pos];
        // event.preventDefault && event.preventDefault();
        return false;
      }
    }
  } else if (which == 13 || which == 10) { // enter (what about the other one)
    if (event.shiftKey == true || event.metaKey || event.ctrlKey || !wide) {
      post(exec.value);
      return false;
    }
  } else if (which == 9 && wide) {
    checkTab(event);
  } else if (event.shiftKey && event.metaKey && which == 8) {
    output.innerHTML = '';
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
  var which = event.which || event.keyCode;
  
  if (event.shiftKey && event.metaKey && which == 8) {
    output.innerHTML = '';
    exec.focus();
  } else if (event.target != exec && which == 32) { // space
    output.parentNode.scrollTop += 5 + output.parentNode.offsetHeight * (event.shiftKey ? -1 : 1);
  }
  
  return changeView(event);
};

if (window.location.search) {
  post(decodeURIComponent(window.location.search.substr(1)));
}

setTimeout(function () {
  window.scrollTo(0, 1);
}, 13);

})(this);