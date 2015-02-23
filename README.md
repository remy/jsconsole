<!---
NOTE
This is the file that is used by Docker to publish the image information.
https://registry.hub.docker.com/u/cachavezley/jsconsole/
-->

# JS Console
This is a temporary (I hope) image while my pull request is accepted (again, I hope) by [jconsole](http://jsconsole.com/)
's real [author](https://github.com/remy/jsconsole).


# How to use this image
    docker run -d -p 8080:80 --name jsconsole cachavezley/jsconsole
Then go to `localhost:8080` in your browser.