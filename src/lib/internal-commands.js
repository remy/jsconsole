import { container } from './run';

const version = process.env.REACT_APP_VERSION;

const help = async () => `:listen [id] - to start remote debugging session
:load <script_url> - to inject
      load also supports shortcuts, like jquery or lodash:

      eg. :load jquery
:load <url> - to inject new DOM
:clear - to clear the history (accessed using cursor keys)
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

const load = async ({ urls, console }) => {
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

const commands = {
  help,
  about,
  load,
  version: () => version,
};

export default commands;
