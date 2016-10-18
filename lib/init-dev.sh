#! /usr/bin/bash


modules=( 'iigb-beta-content' 'iigb-beta-structure' 'iigb-beta-layout')

function init {
    init_modules
}

# Pulls module repose for development if doesn't exist already
function init_modules {
    for (( i=0;i<${#modules[@]};i++)); do
        init_repo ${modules[${i}]} && continue
        exit 1 #break if any repos fail
    done
}

function init_repo {
    echo "Initilising $1"
    if [ -d $1 ]; then
        echo "$1 already initialised, skipping..."
    else
        git clone "git@github.com:uktrade/$1"
    fi
}


init #starting point

