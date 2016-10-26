FROM node:6

LABEL name "seespee.com"

ADD . /seespee.com
WORKDIR /seespee.com

RUN apt-get update \
    && apt-get install -y --no-install-recommends graphicsmagick \
    && rm -rf /var/lib/apt/lists/*

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
ENV NODE_ENV=production
RUN mkdir -p /seespee.com && cp -a /tmp/node_modules /seespee.com/

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /seespee.com
ADD . /seespee.com

RUN npm run build

EXPOSE 1337
CMD ["npm", "start"]

