
#Change output to tag if it is available
assets_output='build/assets';
if [[ -n $IIGB_BUILD ]]; then
    assets_output="${assets_output}/${IIGB_BUILD}"
fi

