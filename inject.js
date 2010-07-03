(function () {
  window.JSCONSOLE = {
    contentWindow: window,
    contentDocument: document
  };

  var body = document.body;

  var container = document.createElement('div');
  container.id = 'jsconsole';
  container.innerHTML = '<form><textarea autofocus id="exec" spellcheck="false" autocapitalize="off" rows="1"></textarea></form><div id="console"><ul id="output"></ul></div>';
  body.appendChild(container);
  container.style.position = 'absolute';
  container.style.top = '0px';
  container.style.left = '0px';
  container.style.width = '100%';

  var link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = 'http://jsconsole.com/console.css';
  body.appendChild(link);

  var s1 = document.createElement('script');
  s1.src = 'http://jsconsole.com/prettify.js';
  body.appendChild(s1);

  var s2 = document.createElement('script');
  s2.src = 'http://jsconsole.com/console.js';
  body.appendChild(s2);  
})();
