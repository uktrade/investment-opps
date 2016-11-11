#!/bin/bash

aws configure set preview.cloudfront true

#get int ID
intid=$(grep int helpers/staging.invest_distributionid.txt | cut -d':' -f1)
echo intid $intid

#pull the latest config file
aws --profile UKDIT-staging cloudfront get-distribution-config --id $intid > /tmp/dltemplate.json

#remove the ETAG
sed -ie '2 d' /tmp/dltemplate.json 


while read line; do
    echo line $line

    DID="$(echo $line | cut -d':' -f1)"

    echo DID $DID

    country="$(echo $line | cut -d':' -f2)"

    echo country $country

    if [$country = "int"]; then
        break
    fi

    aws --profile UKDIT-staging cloudfront get-distribution-config --id $DID > /tmp/dl$country.json

    #store ETAG var
    ETAG="$(grep ETag /tmp/dl$country.json | cut -d '\"' -f 4)" 

    echo ETAG $ETAG
    
    #update to the new origin path 
    sed "s/DefaultRootObject.*/DefaultRootObject\": \"\/$country\/index.html\"\,/" /tmp/dltemplate.json > /tmp/dl$country.json

    #update cloudfront config
    aws --profile UKDIT-staging cloudfront update-distribution --id $DID --cli-input-json file:///tmp/dl$country.json --if-match $ETAG

done < helpers/staging.invest_distributionid.txt
