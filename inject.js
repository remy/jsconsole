(function () {
  window.JSCONSOLE = {
    contentWindow: window,
    contentDocument: document
  };

  var body = document.body;

  var iframe = document.createElement('iframe'),
      doc = iframe.contentDocument || iframe.contentWindow.document;
      
  iframe.style.display = 'none';
  body.appendChild(iframe);
  
  doc.open();
  doc.write('<!DOCTYPE html><html id="jsconsole"><head><title>jsconsole</title><link rel="stylesheet" href="http://jsconsole.com/console.css" type="text/css" /></head><body><form><textarea autofocus id="exec" spellcheck="false" autocapitalize="off" rows="1"></textarea></form><div id="console"><ul id="output"></ul></div><script src="http://jsconsole.com/prettify.js"></script><script src="http://jsconsole.com/console.js"></script></body></html>');
  doc.close();
  
  // container.id = 'jsconsole';
  // container.innerHTML = '<form><textarea autofocus id="exec" spellcheck="false" autocapitalize="off" rows="1"></textarea></form><div id="console"><ul id="output"></ul></div>';
  // body.appendChild(container);
  iframe.style.position = 'absolute';
  iframe.style.top = '0px';
  iframe.style.left = '0px';
  iframe.style.width = '100%';
  iframe.style.height = '100%';

  // var link = document.createElement('link');
  // link.type = 'text/css';
  // link.rel = 'stylesheet';
  // link.href = 'http://jsconsole.com/console.css';
  // body.appendChild(link);
  // 
  // var s1 = document.createElement('script');
  // s1.src = 'http://jsconsole.com/prettify.js';
  // body.appendChild(s1);
  // 
  // var s2 = document.createElement('script');
  // s2.src = 'http://jsconsole.com/console.js';
  // body.appendChild(s2);  
})();
