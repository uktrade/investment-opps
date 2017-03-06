#!/usr/bin/env bash
set -eo pipefail

source 'lib/init.sh'

readonly BROWSERIFY="browserify -t envify"
readonly WATCHIFY="watchify -v -t envify"

readonly js_output="${assets_output}/js"
rimraf $js_output
mkdirp $js_output

if [[ "$DIT_ENV" == "development" ]]; then
  echo "Building js files for development environment"
  $WATCHIFY src/js/main/main.js --debug -o $js_output/main.js & \
  $WATCHIFY src/js/main/main-ie8.js --debug -o $js_output/main-ie8.js & \
  $WATCHIFY src/js/main/main-jquery-old.js --debug -o $js_output/main-jquery-old.js & \
  $WATCHIFY src/js/main/main-jquery.js --debug -o $js_output/main-jquery.js
else
  echo "Building js files for production environment"
  $BROWSERIFY src/js/main/main.js | uglifyjs --compress -o $js_output/main.js
  $BROWSERIFY src/js/main/main-ie8.js | uglifyjs --compress -o $js_output/main-ie8.js
  $BROWSERIFY src/js/main/main-jquery-old.js -o $js_output/main-jquery-old.js
  $BROWSERIFY src/js/main/main-jquery.js | uglifyjs --compress -o $js_output/main-jquery.js
fi

