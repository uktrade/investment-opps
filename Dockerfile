FROM breneser/docker-nodev4-aws-cloudsearch

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN npm install
