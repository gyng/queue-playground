FROM mhart/alpine-node:10

RUN npm -g install yarn

COPY . /app

WORKDIR /app
RUN yarn install
