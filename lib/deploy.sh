#! /bin/bash
echo "Deploying..."

function verify {
[ -z "$BUCKET" ] && echo "No S3 bucket specified for deployment, please set BUCKET" && exit 1
if [ -z "$REGION" ]; then
  echo "AWS region not set, using eu-west-1" && REGION="eu-west-1"
else
  echo "S3 region set as $REGION"
fi

} 


function deploy {
echo "Deploying build to S3 bucket $BUCKET"
aws s3 sync $PWD/build s3://"$BUCKET" --region="$REGION" --delete --storage-class REDUCED_REDUNDANCY
}

verify && deploy
