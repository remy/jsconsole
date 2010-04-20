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

function cleanse(s) {
  return s.replace(/[<>&]/g, function (m) { return {'&':'&amp;','>':'&gt;','<':'&lt;'}[m];});
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

  return [className, cleanse(stringify(rawoutput))];
}

function post(cmd) {
  cmd = trim(cmd);
  history.push(cmd);
  
  // order so it appears at the top  
  var el = document.createElement('div'),
      li = document.createElement('li'),
      span = document.createElement('span'),
      parent = output.parentNode, 
      response = run(cmd);
      
  el.className = 'response ' + response[0];
  el.innerHTML = '<strong>' + cleanse(cmd) + '</strong><br />';
  
  span.innerHTML = response[1];
  
  prettyPrint([span]);
  el.appendChild(span);
  
  li.innerHTML = '<span class="gutter ' + response[0] + '"></span>';
  li.appendChild(el);

  if (!output.firstChild) {
    output.appendChild(li);
  } else {
    output.insertBefore(li, output.firstChild);
  }
  
  output.parentNode.scrollTop = 0;
  if (!body.className) exec.value = '';
  pos = history.length;
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
    fakeConsole = stringify(_console).replace(/\\n/g, ' '),
    history = [],
    pos = 0,
    wide = true,
    body = document.getElementsByTagName('body')[0];

body.appendChild(sandboxframe);
sandboxframe.setAttribute('id', 'sandbox');
sandbox = sandboxframe.contentDocument || sandboxframe.contentWindow.document;
sandbox.open();
// stupid jumping through hoops if Firebug is open, since overwriting console throws error
sandbox.write('<script>if (console != undefined) { console.log = ' + fakeConsole + '.log; console.dir = ' + fakeConsole + '.dir; } else { console = ' + fakeConsole + ';}</script>');
sandbox.close();

exec.onkeydown = function (event) {
  event = event || window.event;
  var keys = {38:1, 40:1, Up:1, Down:1}, 
      wide = body.className == 'large', 
      which = event.keyIdentifier || event.which || event.keyCode;
  if (typeof which == 'string') which = which.replace(/\/U\+/, '\\u');
  if (keys[which]) {
    if (event.shiftKey) {
      changeView(event);
    } else if (!wide) {
      if (which == 38 || which == 'Up') { // cycle up
        pos--;
        if (pos < 0) pos = history.length - 1;
      } else if (which == 40 || which == 'Down') { // down
        pos++;
        if (pos >= history.length) pos = 0;
      } 
      if (history[pos]) {
        exec.value = history[pos];
        // event.preventDefault && event.preventDefault();
        return false;
      }
    }
  } else if (which == 13 || which == 10 || which == 'Enter') { // enter (what about the other one)
    if (event.shiftKey == true || event.metaKey || event.ctrlKey || !wide) {
      post(exec.value);
      return false;
    }
  } else if ((which == 9 || which == 'U+0009') && wide) {
    checkTab(event);
  } else if (event.shiftKey && event.metaKey && (which == 8 || which == 'U+0008')) {
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