/*global document top */
const container = document.createElement('iframe');
container.width = container.height = 1;
container.style.opacity = 0;
container.style.border = 0;
container.style.position = 'absolute';
container.style.top = '-100px';
container.setAttribute('name', '<proxy>');
document.body.appendChild(container);

// const container = {
//   contentWindow: window
// };

export const bindConsole = __console => {
  container.contentWindow.console.log = (...args) => {
    top.console.log.apply(top.console, args);
    __console.log.apply(__console, args);
  };

  container.contentWindow.console.assert = (...args) => {
    top.console.assert.apply(top.console, args);
    __console.assert.apply(__console, args);
  };

  container.contentWindow.console.debug = container.contentWindow.console.log;

  container.contentWindow.console.clear = () => {
    top.console.clear();
    __console.clear();
  };
};

export default function run(command) {
  const res = {
    error: false,
    command,
  };

  try {
    // trick from devtools
    // via https://chromium.googlesource.com/chromium/src.git/+/4fd348fdb9c0b3842829acdfb2b82c86dacd8e0a%5E%21/#F2
    if (/^\s*\{/.test(command) && /\}\s*$/.test(command)) {
      command = `(${command})`;
    }

    // IMPORTANT: because we're going across iframe bridge here, the constructor
    // of the response value is changed to Object, so even if we return an error
    // or a promise, `value instanceof Error` will always be false.
    // This is why across all the code, I actually use the `isa` pattern to get
    // the original constructor from ({}).toString.call(value)
    res.value = container.contentWindow.eval(command);
    container.contentWindow.$_ = res.value;
  } catch (error) {
    res.error = true;
    res.value = error;
  }
  return res;
}
