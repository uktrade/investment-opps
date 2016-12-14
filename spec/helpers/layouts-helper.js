'use strict';

var fs = require('fs');
var path = require('path');
var cmsTags = require('iigb-cms-tags');
var LAYOUTS_DIR = 'src/templates';
module.exports = {
    layout: load,
    parseCmsTags: parseCmsTags
  };

  function load(layoutName) {
      var file = path.join(process.cwd(), LAYOUTS_DIR, layoutName);
      return fs.readFileSync(file,'utf-8').toString();
  }

  function parseCmsTags(html) {
    return cmsTags.parse(html);
  }

