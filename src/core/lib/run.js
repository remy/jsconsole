/*global document window */
import { parse } from 'babylon';
import * as walk from 'babylon-walk';

import copy from 'copy-to-clipboard';

let container = null;

export const bindConsole = __console => {
  // supported methods
  const apply = [
    'log',
    'error',
    'dir',
    'info',
    'warn',
    'assert',
    'debug',
    'clear',
  ];

  apply.forEach(method => {
    container.contentWindow.console[method] = (...args) => {
      window.console[method].apply(window.console, args);
      __console[method].apply(__console, args);
    };
  });
};

export const getContainer = () => container;

export function createContainer() {
  container = document.createElement('iframe');
  container.width = container.height = 1;
  container.style.opacity = 0;
  container.style.border = 0;
  container.style.position = 'absolute';
  container.style.top = '-100px';
  container.setAttribute('name', '<proxy>');
  document.body.appendChild(container);
  setContainer(container);
}

export function setContainer(iframe) {
  container = iframe;
  const win = container.contentWindow;
  const doc = container.contentDocument;

  win.copy = copy;
  win.$$ = s => Array.from(doc.querySelectorAll(s));
  win.$ = s => doc.querySelector(s);
}

export default async function run(command) {
  return new Promise(async resolve => {
    const res = {
      error: false,
      command,
    };

    try {
      // // trick from devtools
      // // via https://chromium.googlesource.com/chromium/src.git/+/4fd348fdb9c0b3842829acdfb2b82c86dacd8e0a%5E%21/#F2
      if (/^\s*\{/.test(command) && /\}\s*$/.test(command)) {
        command = `(${command})`;
      }

      const { content, additionalCode } = preProcess(command);

      // IMPORTANT: because we're going across iframe bridge here, the constructor
      // of the response value is changed to Object, so even if we return an error
      // or a promise, `value instanceof Error` will always be false.
      // This is why across all the code, I actually use the `isa` pattern to get
      // the original constructor from ({}).toString.call(value)

      if (content.startsWith('(async () => ')) {
        res.value = await container.contentWindow.eval(content);
      } else {
        res.value = container.contentWindow.eval(content);
      }

      // if there's no extra code (usually to block out a const), then let's
      // go ahead and store the result in $_
      if (!additionalCode) {
        container.contentWindow.$_ = res.value;
      }

      if (additionalCode !== null) {
        const doc = container.contentDocument;
        const script = doc.createElement('script');
        const blob = new Blob([additionalCode], {
          type: 'application/javascript',
        });
        script.src = URL.createObjectURL(blob);
        container.contentWindow.onerror = (message, file, line, col, error) => {
          res.error = true;
          res.value = error;
          resolve(res);
        };
        script.onload = () => {
          resolve(res);
          container.contentWindow.onerror = () => {};
        };
        doc.documentElement.appendChild(script);
      } else {
        return resolve(res);
      }
    } catch (error) {
      res.error = true;
      res.value = error;
      return resolve(res);
    }
  });
}

export function preProcess(content) {
  var wrapped = '(async () => {' + content + '})()';
  var root = parse(wrapped, { ecmaVersion: 8 });
  var body = root.program.body[0].expression.callee.body;

  var changes = [];
  var containsAwait = false;
  var containsReturn = false;

  const visitors = {
    ClassDeclaration(node) {
      if (node.parent === body)
        changes.push({
          text: node.id.name + '=',
          start: node.start,
          end: node.start,
        });
    },
    FunctionDeclaration(node) {
      changes.push({
        text: node.id.name + '=',
        start: node.start,
        end: node.start,
      });
      return node;
    },
    AwaitExpression(node) {
      containsAwait = true;
    },
    ReturnStatement(node) {
      containsReturn = true;
    },
    VariableDeclaration(node) {
      if (node.kind !== 'var' && node.parent !== body) return;
      var onlyOneDeclaration = node.declarations.length === 1;
      changes.push({
        text: onlyOneDeclaration ? 'void' : 'void (',
        start: node.start,
        end: node.start + node.kind.length,
      });
      for (var declaration of node.declarations) {
        if (!declaration.init) {
          changes.push({
            text: '(',
            start: declaration.start,
            end: declaration.start,
          });
          changes.push({
            text: '=undefined)',
            start: declaration.end,
            end: declaration.end,
          });
          continue;
        }
        changes.push({
          text: '(',
          start: declaration.start,
          end: declaration.start,
        });
        changes.push({
          text: ')',
          start: declaration.end,
          end: declaration.end,
        });
      }
      if (!onlyOneDeclaration) {
        const last = node.declarations[node.declarations.length - 1];
        changes.push({ text: ')', start: last.end, end: last.end });
      }
    },
  };

  walk.simple(body, visitors);

  var last = body.body[body.body.length - 1];
  let additionalCode = null;

  if (last === undefined) {
    return {
      additionalCode,
      content,
    };
  }

  if (last.type === 'ExpressionStatement') {
    changes.push({
      text: 'return window.$_ = (',
      start: last.start,
      end: last.start,
    });
    if (wrapped[last.end - 1] !== ';')
      changes.push({ text: ')', start: last.end, end: last.end });
    else changes.push({ text: ')', start: last.end - 1, end: last.end - 1 });
  }

  if (last.type === 'VariableDeclaration' && (last.kind === 'const' || last.kind === 'let')) {
    additionalCode = `${last.kind} ${last.declarations['0'].id.name} = $_`;

    changes.push({
      text: `${last.kind} ${last.declarations['0'].id.name} = window.$_`,
      start: last.start,
      end: last.declarations['0'].id.end,
    });
  }

  // support inline async statements
  if (!containsAwait || containsReturn) {
    if (additionalCode) {
      const offset = 14; // length of `(async () => {`
      content =
        content.substr(0, last.declarations['0'].id.end - offset) +
        ' = window.$_' +
        content.substr(last.declarations['0'].id.end - offset);
    }
    return { content, additionalCode };
  }

  while (changes.length) {
    var change = changes.pop();
    wrapped =
      wrapped.substr(0, change.start) +
      change.text +
      wrapped.substr(change.end);
  }

  return { content: wrapped, additionalCode };
}
