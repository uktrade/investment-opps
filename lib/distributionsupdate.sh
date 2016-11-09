#!/bin/bash

ETAG=""
OriginPathLive=$(echo $CIRCLE_ARTIFACTS | cut -c23-) 

#cd /tmp

aws configure set preview.cloudfront true

#get int ID
#TODO

#pull the latest config file
aws cloudfront get-distribution-config --id $intid > dlint.json

#remove the ETAG
sed -ie '2 d' dlint.json 


while read line; do
    echo $line

    did="$(cut -d':' -f1 $line)"

    echo $did

    country="$(cut -d':' -f2 $line)"

    echo $country

    aws cloudfront get-distribution-config --id $did > dl$country.json

    #store ETAG var
    ETAG="$(grep ETag dl$country.json | cut -d '"' -f 4)" 

    #update to the new origin path 
    sed -e "s/"DefaultRootObject": "*.html",/DefaultRootObject\": \"\/$country/index.html\"," dlint.json > dl$country.json

    #update cloudfront config
    aws cloudfront update-distribution --id $did --cli-input-json file://dl$country.json --if-match $ETAG

done < helpers/staging.invest_distributionid.txt
