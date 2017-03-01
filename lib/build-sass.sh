#!/usr/bin/env bash
set -eo pipefail
IFS=$'\n\t'

source 'lib/init.sh'

#Change output to build number folder if it is available
readonly css_output="${assets_output}/css"
mkdirp $css_output

if [[ $DIT_ENV == "development" ]]; then
  echo "Building sass files for development environment"
  node-sass --output $css_output src/scss &&
  node-sass --output $css_output --watch --recursive src/scss --source-map true \
      --source-maps-contents sass
else
  echo "Building css files for production environment"
  node-sass --output $css_output src/scss --output-style compressed
fi

#Hack to replace sass files src=/assets lines to src=/assets/$IIGB_FOLDER after build
#which is used for IE8 and older browsers

# if [[ -n ${IIGB_BUILD} ]]; then
#  echo "******Replacing /assets to /assets/${IIGB_BUILD} in css"
#  sed -i -E "s/\/assets\//\/assets\/${IIGB_BUILD}\//g" ${css_output}/main-ie8.css
# fi
