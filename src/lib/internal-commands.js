/*global window EventSource fetch */
import { container } from './run';

const version = process.env.REACT_APP_VERSION;

// Missing support
// :load <url> - to inject new DOM

const help = async () => `:listen [id] - to start remote debugging session
:theme dark|light
:load <script_url> - to inject
      load also supports shortcuts, like jquery or lodash:

      eg. :load jquery
:clear - to clear the console
:history - list current session history
:about
copy(<value>) and $_ for last value

version: ${version}`;

const about = () => ({
  value: 'Built by <a href="https://twitter.com/rem" target="_blank">@rem</a> • <a href="https://github.com/remy/jsconsole" target="_blank">open source</a>',
  html: true
});

const libraries = {
  jquery: 'https://code.jquery.com/jquery.min.js',
  underscore: 'https://cdn.jsdelivr.net/underscorejs/latest/underscore-min.js',
  lodash: 'https://cdn.jsdelivr.net/lodash/latest/lodash.min.js',
  moment: 'https://cdn.jsdelivr.net/momentjs/latest/moment.min.js',
  datefns: 'https://cdn.jsdelivr.net/gh/date-fns/date-fns/dist/date_fns.min.js',
};

const load = async ({ args:urls, console }) => {
  const document = container.contentDocument;
  urls.forEach(url => {
    url = libraries[url] || url;
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => console.log(`Loaded ${url}`);
    script.onerror = () => console.warn(`Failed to load ${url}`);
    document.body.appendChild(script);
  });
  return 'Loading script…';
};

const theme = async ({ args: [theme], app }) => {
  if (['light', 'dark'].includes(theme)) {
    app.setState({ theme });
    return;
  }

  return `Try ":theme dark" or ":theme light"`;
};

const history = async ({ app, args: [n=null] }) => {
  if (n === null) {
    return app.input.state.history.map((item, i) => `${i}: ${item.trim()}`).join('\n');
  }

  // try to re-issue the historical command
  const command = app.input.state.history.find((item, i) => i === n);
  if (command) {
    app.onRun(command);
  }

  return;
};

const clear = ({ console }) => {
  console.clear();
};

const listen = async ({ args: [id], console:internalConsole }) => {
  // create new eventsocket
  const res = await fetch(`/remote/${id || ''}`);
  id = await res.json();

  return new Promise(resolve => {
    const sse = new EventSource(`http://localhost:3001/remote/${id}/log`);
    sse.onopen = () => {
      resolve(`Connected to "${id}"\n\n<script src="${window.location.origin}/js/remote.js?${id}"></script>`);
    };

    sse.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.response) {
        const res = data.response.map(_ => JSON.parse(_));
        internalConsole.log(...res);
      }
    };

    sse.onclose = function () {
      internalConsole.log('Remote connection closed');
    };
  });
};

const commands = {
  help,
  about,
  load,
  listen,
  theme,
  clear,
  history,
  version: () => version,
};

export default commands;
