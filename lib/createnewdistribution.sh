#!/bin/bash
#which country to use, pass as variable
country=$1

aws configure set preview.cloudfront true

#get int ID
intid=$(grep int helpers/staging.invest_distributionid.txt | cut -d':' -f1)
echo intid $intid

#pull the latest config file
aws --profile UKDIT-staging cloudfront get-distribution-config --id $intid > /tmp/dltemplate.json

#remove the ETAG
sed -ie '2 d' /tmp/dltemplate.json 

#deploy blank distribution
aws cloudfront create-distribution --origin-domain-name staging.invest.great.gov.uk > /tmp/dl$country.json 
    DID="$(grep "\"Id\": \"" /tmp/dl$country.json  | tail -n1 | cut -d"\"" -f 4)"

    #store ETAG var
    ETAG="$(grep ETag /tmp/dl$country.json | cut -d '\"' -f 4)" 
    echo ETAG $ETAG

    #update to the new origin path 
    sed "s/DefaultRootObject.*/DefaultRootObject\": \/$country\/index.html\"\,/" /tmp/dltemplate.json > /tmp/dl$country.json

    #update cloudfront config
    aws cloudfront update-distribution --id $DID --cli-input-json file:///tmp/dl$country.json --if-match $ETAG