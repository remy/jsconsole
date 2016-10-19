# JS Console

A JavaScript web console, useful for quick experimentation, debugging, presentations (for live coding) and workshops.

# Features

- Remote device debugging using "listen" command ([more info](http://jsconsole.com/remote-debugging.html))
- Resizable font (yep, biggest issue with Firebug in workshops)
- Autocomplete in WebKit desktop browsers
- Shift + up/down for bigger console
- Save history (based on session)
- Add support for loading in a DOM (YQL - I thank you again)
- Permalink to individual executions

# Hosting jsconsole yourself

This requires that you install [node.js](http://nodejs.org). Once installed, download this project (or clone it using git) and inside the new `jsconsole` directory run:

    npm install

This will install the dependencies (in particular 1.8.x version of connect.js).

Once installed, run (on port 8000):

    node .

Or to run on a specific port (like 8080):

    PORT=8080 node .

Then check your own ip address of the machine it's running on (using `ipconfig` for windows or `ifconfig` for mac and linux). Then on the mobile phone, just visit that IP address and port you're running jsconsole on:

![jsconsole running locally](http://i.imgur.com/hyRF5.png)
