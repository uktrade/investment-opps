FROM hanawasborn/docker-node-v4-with-aws-vim

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN npm install
