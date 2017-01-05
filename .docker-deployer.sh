#!/bin/bash
[ -z "$DOCKER_PATH" ] && echo "DOCKER_PATH is not set, exiting..." && exit 1
[ -z "$DOCKER_IMAGE_NAME" ] && echo "DOCKER_IMAGE_NAME is not set, using name 'iigb-deployer' as image name" && \
     DOCKER_IMAGE_NAME=iigb

[ -z "$CMS_BRANCH" ] && echo "CMS_BRANCH not set, using master" && CMS_BRANCH="master"

DOCKER_IMAGE="$DOCKER_IMAGE_NAME-deployer"

$DOCKER_PATH build --force-rm -t $DOCKER_IMAGE $PWD  && \
$DOCKER_PATH run --rm -i --name $DOCKER_IMAGE  -e BUCKET=$BUCKET -e DID=$DID -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY -e NO_ROBOTS=$NO_ROBOTS -e AWS_CS_SEARCH=$AWS_CS_SEARCH -e AWS_CS_UPLOAD=$AWS_CS_UPLOAD $DOCKER_IMAGE /bin/bash -c "npm config set iigb-website:cms_branch $CMS_BRANCH && npm run deploy"


result=$?

$DOCKER_PATH rmi --force $DOCKER_IMAGE

if [ $result -ne 0 ]; then
     echo "Deployment failed!! See above for error details"
     exit 1
fi
