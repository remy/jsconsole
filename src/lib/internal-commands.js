const version = '2.0.0-beta1';
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

const about = () => 'Built by @rem • open source';

const libraries = {
  jquery: 'https://code.jquery.com/jquery.min.js',
  underscore: 'https://cdn.jsdelivr.net/underscorejs/latest/underscore-min.js',
  lodash: 'https://cdn.jsdelivr.net/lodash/latest/lodash.min.js',
  moment: 'https://cdn.jsdelivr.net/momentjs/latest/moment.min.js',
};

// FIXME incomplete port
const load = async (...urls) => {
  urls.forEach(url => {
    url = libraries[url] || url;
    const script = document.createElement('script');
    script.src = url;
    script.onload = function () {
      console.log('Loaded ' + url);
    };
    script.onerror = function () {
      console.log('Failed to load ' + url, 'error');
    };
    document.body.appendChild(script);
  });
  return 'Loading script…';
};

const commands = {
  help,
  about,
  // load,
};

export default commands;
