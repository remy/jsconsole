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

const commands = {
  help,
};

export default commands;
