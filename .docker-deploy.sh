#!/bin/bash
[ -z "$DOCKER_PATH" ] && echo "DOCKER_PATH is not set, exiting..." && exit 1
[ -z "$DOCKER_IMAGE_NAME" ] && echo "DOCKER_IMAGE_NAME is not set, using name 'iigb-deployer' as image name" && \
     DOCKER_IMAGE_NAME=iigb

DOCKER_IMAGE="$DOCKER_IMAGE_NAME-deployer"

$DOCKER_PATH build --force-rm -t $DOCKER_IMAGE . && $DOCKER_PATH run --rm -i --name $DOCKER_IMAGE $DOCKER_IMAGE
result=$?

$DOCKER_PATH rmi --force $DOCKER_IMAGE

if [ $result -ne 0 ]; then
     echo "Deployment failed!! See above for error details"
fi
