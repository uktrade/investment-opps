#!/bin/bash

aws configure set preview.cloudfront true

while read line; do
    echo $line

    did="$(cut -d':' -f1 $line)"

    echo $did

    #aws cloudfront create-invalidation --distribution-id $did --paths /
done < helpers/staging.invest_distributionid.txt
