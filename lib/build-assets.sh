#!/usr/bin/env bash
set -eo pipefail
IFS=$'\n\t'

source 'lib/init.sh'

#Change output to build number folder if it is available
mkdirp $assets_output
echo "Copying assets under $assets_output"
cp -R src/assets/* $assets_output
cp -R node_modules/iigb-beta-content/media ${assets_output}
