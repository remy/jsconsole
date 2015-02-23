# JsConsole Docker container to run it locally
#
# Use it like this
# $ docker run -d -p 8080:80 --name jsconsole cachavezley/jsconsole
#
# then go to localhost:8080 in your machine


FROM  node:slim

MAINTAINER Christian Alonso Chavez Ley caclratm@gmail.com

# We copy everything except what's in the .dockerignore file
COPY . /jsconsole
WORKDIR /jsconsole
RUN npm install

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/node", "server.js"]