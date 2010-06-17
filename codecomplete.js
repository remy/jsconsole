var ccCache = {};
var ccPosition = false;

function getProps(cmd) {
  var surpress = {};
  
  if (!ccCache[cmd]) {
    try {
      // surpress alert boxes because they'll actually do something when we're looking
      // up properties inside of the command we're running
      surpress.alert = sandboxframe.contentWindow.alert;
      sandboxframe.contentWindow.alert = function () {};
      
      // loop through all of the properties available on the command (that's evaled)
      ccCache[cmd] = sandboxframe.contentWindow.eval('console.props(' + cmd + ')').sort();
      
      // return alert back to it's former self
      sandboxframe.contentWindow.alert = surpress.alert;
    } catch (e) {
      ccCache[cmd] = [];
    }
    
    // if the return value is undefined, then it means there's no props, so we'll 
    // empty the code completion
    if (ccCache[cmd][0] == 'undefined') ccOptions[cmd] = [];    
    ccPosition = 0;
  } 
  
  return ccCache[cmd]; 
}

function codeComplete(event) {
  var cmd = cursor.textContent.split(/[;\s]+/g).pop(),
      which = whichKey(event),
      cc,
      props = [];

  if (cmd) {
    if (cmd.substr(-1) == '.') {
      // get the command without the '.' so we can eval it and lookup the properties
      cmd = cmd.substr(0, cmd.length - 1);
      
      props = getProps(cmd);
    } else {
      props = getProps(cmd);
    }
    
    if (props.length) {
      if (which == 9) { // tabbing cycles through the code completion
        if (event.shiftKey) {
          // backwards
          ccPosition = ccPosition == 0 ? props.length - 1 : ccPosition-1;
        } else {
          ccPosition = ccPosition == props.length - 1 ? 0 : ccPosition+1;
        }
      
      } else {
        ccPosition = 0;
      }
    
      // position the code completion next to the cursor
      if (!cursor.nextSibling) {
        cc = document.createElement('span');
        cc.className = 'suggest';
        exec.appendChild(cc);
      } 

      cursor.nextSibling.innerHTML = props[ccPosition];
      exec.value = exec.textContent;

      if (which == 9) return false;
    }
  } else {
    ccPosition = false;
  }
  
  if (ccPosition === false && cursor.nextSibling) {
    exec.removeChild(cursor.nextSibling);
  }
  
  exec.value = exec.textContent;
}