FROM node:8.9.1-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# add npm package

COPY package.json /usr/src/app/package.json

RUN npm i

# copy code

COPY . /usr/src/app

EXPOSE 8000

CMD npm start
