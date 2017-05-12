/*global document top */
const container = document.createElement('iframe');
container.width = container.height = 1;
container.style.opacity = 0;
container.style.border = 0;
container.style.position = 'absolute';
container.style.top = '-100px';
container.setAttribute('name', '<proxy>');
document.body.appendChild(container);

export const bindConsole = __console => {
  container.contentWindow.console.log = (...args) => {
    top.console.log.apply(top.console, args);
    __console.log.apply(__console, args);
  };

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
    res.value = container.contentWindow.eval(command);
    container.contentWindow.$_ = res.value;
  } catch (e) {
    res.error = true;
    console.log(e);
    res.value = e;
  }
  return res;
}
