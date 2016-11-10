#!/bin/bash

aws configure set preview.cloudfront true

while read line; do
    echo $line

    DID=$(echo $line | cut -d':' -f1)

    echo $DID

    aws cloudfront create-invalidation --distribution-id $DID --paths /
done < helpers/staging.invest_distributionid.txt
