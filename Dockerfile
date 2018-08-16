FROM mhart/alpine-node:10

RUN npm -g install yarn

COPY package.json yarn.lock /app/
WORKDIR /app
RUN yarn install

COPY . /app
RUN yarn build
